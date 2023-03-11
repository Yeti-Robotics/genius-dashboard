#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod log;

use std::{collections::HashMap, net::SocketAddr, str::FromStr, time::Duration};

use arrayvec::ArrayVec;
use network_tables::v4::{Config, MessageData, PublishedTopic, SubscriptionOptions, Type};
use once_cell::sync::OnceCell;
use serde::Deserialize;
use tauri::{Manager, Window};
use tokio::{select, sync::Mutex};

static CLIENT: OnceCell<Mutex<Option<network_tables::v4::Client>>> = OnceCell::new();
static PUBLISHED_TOPICS: OnceCell<Mutex<HashMap<String, PublishedTopic>>> = OnceCell::new();

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
            connect_timeout: 3000,
            on_announce: Box::new(move |announced_topics| {
                on_announce_window.emit("announce", announced_topics).ok();
            }),
            on_disconnect: Box::new(move || {
                on_disconnect_window.emit("disconnect", ()).ok();
            }),
            on_reconnect: Box::new(move || {
                on_reconnect_window.emit("reconnect", ()).ok();
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

        println!("Subscription returned Non");
    });

    Ok(new_client)
}

/// Starts / restarts client connecting to addr
#[tauri::command]
async fn start_client(window: Window, addr: &str) -> Result<(), String> {
    let socket_addr = SocketAddr::from_str(addr).map_err(|e| e.to_string())?;
    let new_client = create_new_client(&window, socket_addr).await?;
    // Must clear published topics when creating a new client
    PUBLISHED_TOPICS.get().unwrap().lock().await.clear();
    *CLIENT.get().unwrap().lock().await = Some(new_client);

    Ok(())
}

#[tauri::command]
async fn close_client() {
    *CLIENT.get().unwrap().lock().await = None;
}

#[tauri::command]
async fn publish_value(
    topic: String,
    topic_type: Type,
    value: network_tables::Value,
) -> Result<(), String> {
    if let Some(client) = CLIENT.get().unwrap().lock().await.as_ref() {
        let mut published_topics = PUBLISHED_TOPICS.get().unwrap().lock().await;
        if let Some(existing) = published_topics.get(&topic) {
            client
                .publish_value(existing, &value)
                .await
                .map_err(|e| e.to_string())?;
        } else {
            let published_topic = client
                .publish_topic(&topic, topic_type, None)
                .await
                .map_err(|e| e.to_string())?;

            let result = client
                .publish_value(&published_topic, &value)
                .await
                .map_err(|e| e.to_string());
            // Add topic into hashmap no matter what
            published_topics.insert(topic, published_topic);

            result?;
        }
    }

    Ok(())
}

fn main() {
    CLIENT.set(Mutex::new(None)).unwrap();
    PUBLISHED_TOPICS.set(Mutex::new(HashMap::new())).unwrap();

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
            app.listen_global("log", |e| {
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
