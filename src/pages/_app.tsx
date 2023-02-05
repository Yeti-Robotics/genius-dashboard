import {
	ColorScheme,
	ColorSchemeProvider,
	DefaultMantineColor,
	MantineProvider,
} from '@mantine/core';
import type { AppProps } from 'next/app';
import { useLocalStorage } from '@mantine/hooks';
import { ColorProvider } from '@/components/ColorProvider';
import { Layout } from '@/components/Layout';
import { listen } from '@tauri-apps/api/event';
import { Message } from '@/types/Message';
import { getTopicStore } from '@/stores/topicsStore';
import { ModalsProvider } from '@mantine/modals';
import { Topic } from '@/types/Topic';
import { useBoardActions } from '@/stores/boardStore';
import { useEffect } from 'react';
import { invokeResult } from '@/utils/invokeResult';

const setTopic = getTopicStore().setTopic;
const setAnnouncedTopic = getTopicStore().setAnnouncedTopic;

// Handle messages from the server
listen<Message>('message', ({ payload }) => {
	setTopic(payload);
});
listen<Topic>('announce', ({ payload }) => setAnnouncedTopic(payload));

const App = ({ Component, pageProps }: AppProps) => {
	const { setBoard, setCurrentBoard } = useBoardActions();
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
			addr: process.env.NODE_ENV === 'development' ? '127.0.0.1:5810' : '10.35.6.2:5810',
		});
	};

	useEffect(() => {
		startClient();
		setBoard('My Board', {
			name: 'My Board',
			settings: {},
			widgets: [
				{
					display: 'simple',
					height: 100,
					width: 100,
					x: 100,
					y: 100,
					name: 'RGB Green Value',
					sources: { data: '/SmartDashboard/g' },
					options: { sus: 1 },
				},
				{
					display: 'simple',
					height: 100,
					width: 100,
					x: 200,
					y: 200,
					name: 'RGB Red Value',
					sources: { data: '/SmartDashboard/r' },
					options: { sus: 1 },
				},
			],
		});
		setCurrentBoard('My Board');
	}, []);

	return (
		<ColorProvider primaryColor={primaryColor} setPrimaryColor={setPrimaryColor}>
			<ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
				<MantineProvider
					theme={{ colorScheme, primaryColor, cursorType: 'pointer' }}
					withGlobalStyles
					withNormalizeCSS
				>
					<ModalsProvider>
						<Layout>
							<Component {...pageProps} />
						</Layout>
					</ModalsProvider>
				</MantineProvider>
			</ColorSchemeProvider>
		</ColorProvider>
	);
};

export default App;
