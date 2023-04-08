#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod log;

use std::{collections::HashMap, net::SocketAddr, str::FromStr, time::Duration};

use arrayvec::ArrayVec;
use network_tables::v4::{
    Config, MessageData, PublishProperties, PublishedTopic, SubscriptionOptions, Type,
};
use once_cell::sync::OnceCell;
use serde::Deserialize;
use tauri::{Manager, Window};
use tokio::{select, sync::Mutex};

static CLIENT: OnceCell<Mutex<Option<network_tables::v4::Client>>> = OnceCell::new();
static PUBLISHED_TOPICS: OnceCell<parking_lot::Mutex<HashMap<String, PublishedTopic>>> = OnceCell::new();

#[derive(Debug, Deserialize)]
#[serde(rename_all = "lowercase")]
enum LogType {
    Log,
    Info,
    Warn,
    Error,
}

#[derive(Debug, Deserialize)]
struct LogEvent {
    log_type: LogType,
    message: String,
}

async fn create_new_client(
    window: &Window,
    addr: SocketAddr,
) -> Result<network_tables::v4::Client, String> {
    let on_announce_window = window.clone();
    let on_disconnect_window = window.clone();
    let on_reconnect_window = window.clone();
    let new_client = network_tables::v4::Client::try_new_w_config(
        addr,
        Config {
            connect_timeout: 500,
            disconnect_retry_interval: 3000,
            on_announce: Box::new(move |announced_topics| {
                let on_announce_window = on_announce_window.clone();
                Box::pin(async move {
                    on_announce_window.emit("announce", announced_topics).ok();
                })
            }),
            on_disconnect: Box::new(move || {
                let on_disconnect_window = on_disconnect_window.clone();
                Box::pin(async move {
                    on_disconnect_window.emit("disconnect", ()).ok();
                })
            }),
            on_reconnect: Box::new(move || {
                let on_reconnect_window = on_reconnect_window.clone();
                Box::pin(async move {
                    on_reconnect_window.emit("reconnect", ()).ok();
                    PUBLISHED_TOPICS.get().unwrap().lock().clear();
                })
            }),
            ..Default::default()
        },
    )
    .await
    .map_err(|e| e.to_string())?;

    let mut subscription = new_client
        .subscribe_w_options(
            &[""],
            Some(SubscriptionOptions {
                all: Some(true),
                prefix: Some(true),
                ..Default::default()
            }),
        )
        .await
        .map_err(|e| e.to_string())?;

    let window = window.clone();

    tauri::async_runtime::spawn(async move {
        let mut msg_buf = ArrayVec::<MessageData, 64>::new();

        loop {
            select! {
                biased;
                message = subscription.next() => {
                    if let Some(message) = message {
                        match msg_buf.try_push(message) {
                            Ok(_) => {},
                            Err(err) => {
                                // Buffer is full, send it to frontend
                                window.emit("message", &msg_buf).ok();
                                msg_buf.clear();
                                // SAFETY: Just cleared buffer + no awaits = safe 😁
                                unsafe { msg_buf.push_unchecked(err.element()) };
                            }
                        }
                    } else {
                        // If sub returns none, break it out
                        println!("Subscription returned Non");
                        break;
                    }
                },
                _ = tokio::time::sleep(Duration::from_millis(7)) => {
                    // Every 7 ms (for now) send all currently buffered messages to the frontend
                    if !msg_buf.is_empty() {
                        window.emit("message", &msg_buf).ok();
                        msg_buf.clear();
                    };
                },
            }
        }
    });

    Ok(new_client)
}

/// Starts / restarts client connecting to addr
#[tauri::command]
async fn start_client(window: Window, addr: &str) -> Result<(), String> {
    let socket_addr = SocketAddr::from_str(addr).map_err(|e| e.to_string())?;
    let new_client = create_new_client(&window, socket_addr).await?;
    // Must clear published topics when creating a new client
    PUBLISHED_TOPICS.get().unwrap().lock().clear();
    *CLIENT.get().unwrap().lock().await = Some(new_client);
    window.emit("connect", ()).ok();

    Ok(())
}

#[tauri::command]
async fn close_client() {
    *CLIENT.get().unwrap().lock().await = None;
    tracing::info!("Dropped client");
}

#[tauri::command]
async fn publish_value(
    topic: String,
    topic_type: Type,
    value: network_tables::Value,
) -> Result<(), String> {
    let client = CLIENT.get().unwrap().lock().await;
    if let Some(client) = client.as_ref() {
        // Have to clone here to avoid deadlock on disconnect
        let existing = PUBLISHED_TOPICS.get().unwrap().lock().get(&topic).cloned();
        if let Some(existing) = existing {
            client
                .publish_value(&existing, &value)
                .await
                .map_err(|e| e.to_string())?;
        } else {
            let published_topic = client
                .publish_topic(
                    &topic,
                    topic_type,
                    Some(PublishProperties {
                        retained: Some(true),
                        ..Default::default()
                    }),
                )
                .await
                .map_err(|e| e.to_string())?;

            let result = client
                .publish_value(&published_topic, &value)
                .await
                .map_err(|e| e.to_string());
            // Add topic into hashmap no matter what
            PUBLISHED_TOPICS.get().unwrap().lock().insert(topic, published_topic);

            result?;
        }
    }

    Ok(())
}

fn main() {
    CLIENT.set(Mutex::new(None)).unwrap();
    PUBLISHED_TOPICS.set(parking_lot::Mutex::new(HashMap::new())).unwrap();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            start_client,
            close_client,
            publish_value
        ])
        .setup(|app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                let window = app.get_window("main").unwrap();
                window.open_devtools();
                window.close_devtools();
            }

            // Listen for logs from the frontend
            #[allow(unreachable_code, unused_variables)]
            app.listen_global("log", |e| {
                // Don't log frontend stuff to stdout in debug mode
                #[cfg(debug_assertions)] return;
                let payload = serde_json::from_str::<LogEvent>(e.payload().unwrap()).unwrap();

                match payload.log_type {
                    LogType::Log => tracing::info!(payload.message),
                    LogType::Info => tracing::info!(payload.message),
                    LogType::Warn => tracing::warn!(payload.message),
                    LogType::Error => tracing::error!(payload.message),
                }
            });

            // Set up a subscriber to write events to the log file
            let _ = log::init_logger(app);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
