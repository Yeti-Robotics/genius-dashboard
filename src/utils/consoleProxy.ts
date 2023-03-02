// Replace global console with my own so that I can save logs to a file for debugging
// Substitution is not supported for the messages sent to the server

import { emit } from '@tauri-apps/api/event';

const ogConsole = window.console;

const paramsToMessage = (message: unknown, ...params: unknown[]) =>
	`FRONTEND: ${
		message === undefined
			? 'undefined'
			: message === null
			? 'null'
			: typeof message === 'object'
			? JSON.stringify(message)
			: message.toString()
	} ${params
		.map((p) =>
			p === undefined
				? 'undefined'
				: p === null
				? 'null'
				: typeof p === 'object'
				? JSON.stringify(p)
				: p.toString()
		)
		.join(' ')}`;

const setupConsole = () => {
	window.console = {
		...ogConsole,
		log: function (message: unknown, ...params: unknown[]) {
			emit('log', {
				log_type: 'log',
				message: paramsToMessage(message, params),
			});

			return ogConsole.log(message, ...params);
		},
		info: function (message: unknown, ...params: unknown[]) {
			emit('log', {
				log_type: 'info',
				message: paramsToMessage(message, params),
			});

			return ogConsole.info(message, ...params);
		},
		warn: function (message: unknown, ...params: unknown[]) {
			emit('log', {
				log_type: 'warn',
				message: paramsToMessage(message, params),
			});

			return ogConsole.warn(message, ...params);
		},
		error: function (message: unknown, ...params: unknown[]) {
			emit('log', {
				log_type: 'error',
				message: paramsToMessage(message, params),
			});

			return ogConsole.error(message, ...params);
		},
	};
};

if (!import.meta.env.TAURI_DEBUG) setupConsole();
