import { EventCallback, UnlistenFn, listen } from '@tauri-apps/api/event';
import { useEffect } from 'react';

export const useTauriEvent = <T>(name: string, handler: EventCallback<T>) => {
	let unlisten: UnlistenFn;
	useEffect(() => {
		listen(name, handler).then((unlistenFn) => (unlisten = unlistenFn));
		return unlisten;
	});
};
