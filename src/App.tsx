import {
	ColorScheme,
	ColorSchemeProvider,
	DefaultMantineColor,
	MantineProvider,
} from '@mantine/core';
import { useHotkeys, useLocalStorage, useWindowEvent } from '@mantine/hooks';
import { ColorProvider } from '@/components/ColorProvider';
import { Layout } from '@/components/Layout';
import { listen } from '@tauri-apps/api/event';
import { Message } from '@/types/Message';
import { getTopicStore } from '@/stores/topicsStore';
import { ModalsProvider, openModal } from '@mantine/modals';
import { Topic } from '@/types/Topic';
import { notifications, Notifications } from '@mantine/notifications';
import { Dashboard } from './components/Dashboard';
import { startClient } from './utils/client';
import { BoardSwitcher } from './components/BoardSwitcher';
import { useEffect } from 'react';
import { SelectWidgetModal } from './components/Dashboard/SelectWidgetModal';
import { getBoardStore } from './stores/boardStore';

const setManyTopics = getTopicStore().setManyTopics;
const setAnnouncedTopic = getTopicStore().setAnnouncedTopic;

// Handle messages from the server
listen<Message[]>('message', ({ payload }) => {
	setManyTopics(payload);
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

	useHotkeys([
		['mod+r', startClient],
		[
			'mod+t',
			() => {
				const boardStore = getBoardStore();
				openModal({
					title: 'Select a widget',
					children: (
						<SelectWidgetModal
							board={boardStore.boards[boardStore.currentBoard]}
						/>
					),
				});
			},
		],
	]);

	useWindowEvent('online', () => {
		startClient();
	});

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
							<BoardSwitcher />
						</Layout>
					</ModalsProvider>
				</MantineProvider>
			</ColorSchemeProvider>
		</ColorProvider>
	);
};
