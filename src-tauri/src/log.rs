use std::{fs::File, path::Path};

pub fn init_logger(app: &tauri::App) -> Result<(), std::io::Error> {
    if cfg!(debug_assertions) {
        // In dev mode just do a subscriber to stdout
        tracing_subscriber::fmt().with_env_filter("info").init();
        return Ok(())
    }

    if let Some(mut log_file_path) = app.path_resolver().app_log_dir() {
        println!("{:?}", log_file_path);
        // Ensure the dir exists
        let _ = std::fs::create_dir_all(&log_file_path);

        let _ = clean_log_dir(&log_file_path);
        let date = now().date();

        // Log files should be named YYYY-MM-DD.log
        log_file_path.push(format!("{date}.log"));

        // Get or create log file and hold onto it until program ends
        let log_file = open_or_create(log_file_path)?;
        tracing_subscriber::fmt()
            .with_env_filter("info")
            .with_writer(log_file)
            .init();
    };

    Ok(())
}

fn clean_log_dir(path: impl AsRef<Path>) -> Result<(), std::io::Error> {
    let dir = walkdir::WalkDir::new(path).max_depth(1);

    for file in dir {
        if let Ok(file) = file {
            // If valid log file, name should be utf8
            if let Some(file_name) = file.file_name().to_str() {
                // If valid log file, should end with .log
                if let Some(date_str) = file_name.strip_suffix(".log") {
                    let date_format = time::macros::format_description!("[year]-[month]-[day]");
                    // If valid log file, should be parsable to YYYY-MM-DD
                    if let Ok(date) = time::Date::parse(date_str, date_format) {
                        // If log was created a week or more ago, delete it
                        if date.saturating_add(time::Duration::WEEK) >= now().date() {
                            let _ = std::fs::remove_file(file.path());
                        }
                    }
                }
            }
        }
    }

    Ok(())
}

fn now() -> time::OffsetDateTime {
    time::OffsetDateTime::now_local().unwrap_or(time::OffsetDateTime::now_utc())
}

pub fn open_or_create<P: AsRef<Path>>(path: P) -> Result<File, std::io::Error> {
    match File::open(path.as_ref()) {
        Ok(file) => Ok(file),
        Err(err) => match err.kind() {
            std::io::ErrorKind::NotFound => File::create(path),
            _ => Err(err),
        },
    }
}
