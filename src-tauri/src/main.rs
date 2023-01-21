#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{collections::HashMap, net::SocketAddr, str::FromStr};

use network_tables::v4::SubscriptionOptions;
use once_cell::sync::OnceCell;
use parking_lot::Mutex;
use tauri::{Window, Manager};

static CLIENTS: OnceCell<Mutex<HashMap<SocketAddr, network_tables::v4::Client>>> = OnceCell::new();

#[tauri::command]
async fn start_client(window: Window, addr: &str) -> Result<(), String> {
    let socket_addr = {
        let clients = CLIENTS.get().unwrap().lock();
        let socket_addr = SocketAddr::from_str(addr).map_err(|e| e.to_string())?;

        if clients.contains_key(&socket_addr) {
            return Ok(());
        }
        socket_addr
    };

    let client = network_tables::v4::Client::try_new(socket_addr)
        .await
        .map_err(|e| e.to_string())?;

    let mut subscription = client
        .subscribe_w_options(
            &["/SmartDashboard", "/GeniusDashboard"],
            Some(SubscriptionOptions {
                all: Some(true),
                prefix: Some(true),
                ..Default::default()
            }),
        )
        .await
        .map_err(|e| e.to_string())?;

    let mut clients = CLIENTS.get().unwrap().lock();
    clients.insert(socket_addr, client);
    let window = window.clone();
    tauri::async_runtime::spawn(async move {
        while let Some(message) = subscription.next().await {
            window.emit("message", message).ok();
            // TODO log err if it occurs somehow
        }
    });

    Ok(())
}

fn main() {
    CLIENTS.set(Mutex::new(HashMap::new())).unwrap();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![start_client])
        .setup(|app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                let window = app.get_window("main").unwrap();
                window.open_devtools();
                window.close_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
