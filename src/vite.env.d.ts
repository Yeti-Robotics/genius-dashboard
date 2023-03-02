/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly TAURI_DEBUG: string;
	// more env variables...
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
