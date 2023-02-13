import {
	ColorScheme,
	ColorSchemeProvider,
	DefaultMantineColor,
	MantineProvider,
} from '@mantine/core';
import { useHotkeys, useLocalStorage } from '@mantine/hooks';
import { ColorProvider } from '@/components/ColorProvider';
import { Layout } from '@/components/Layout';
import { listen } from '@tauri-apps/api/event';
import { Message } from '@/types/Message';
import { getTopicStore } from '@/stores/topicsStore';
import { ModalsProvider } from '@mantine/modals';
import { Topic } from '@/types/Topic';
import { useEffect } from 'react';
import { invokeResult } from '@/utils/invokeResult';
import { notifications, Notifications } from '@mantine/notifications';
import { Dashboard } from './components/Dashboard';

const setTopic = getTopicStore().setTopic;
const setAnnouncedTopic = getTopicStore().setAnnouncedTopic;

// Handle messages from the server
listen<Message>('message', ({ payload }) => {
	setTopic(payload);
});
listen<Topic>('announce', ({ payload }) => setAnnouncedTopic(payload));
listen('disconnect', () => {
	notifications.show({
		title: 'Disconnected from robot! 😭',
		message: 'This is so sad.',
	});
});
listen('reconnect', () => {
	notifications.show({
		title: 'Reconnected to robot! 😁',
		message: 'This is epic.',
	});
});

export const App = () => {
	const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
		key: 'colorScheme',
		defaultValue: 'dark',
		getInitialValueInEffect: true,
	});
	const [primaryColor, _setPrimaryColor] = useLocalStorage({
		key: 'primaryColor',
		defaultValue: 'blue',
		getInitialValueInEffect: true,
	});
	const toggleColorScheme = (value?: ColorScheme) =>
		setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

	const setPrimaryColor = (color: DefaultMantineColor) => {
		_setPrimaryColor(color);
	};

	const startClient = async () => {
		await invokeResult('start_client', {
			addr:
				process.env.NODE_ENV === 'development'
					? '127.0.0.1:5810'
					: '10.35.6.2:5810',
		});
	};

	useHotkeys([
		[
			'mod+r',
			async () => {
				await invokeResult('close_client');
				await startClient();
			},
		],
	]);

	useEffect(() => {
		startClient();
	}, []);

	return (
		<ColorProvider
			primaryColor={primaryColor}
			setPrimaryColor={setPrimaryColor}
		>
			<ColorSchemeProvider
				colorScheme={colorScheme}
				toggleColorScheme={toggleColorScheme}
			>
				<MantineProvider
					theme={{ colorScheme, primaryColor, cursorType: 'pointer' }}
					withGlobalStyles
					withNormalizeCSS
				>
					<ModalsProvider>
						<Layout>
							<Dashboard />
							<Notifications position='bottom-left' limit={2} />
						</Layout>
					</ModalsProvider>
				</MantineProvider>
			</ColorSchemeProvider>
		</ColorProvider>
	);
};
