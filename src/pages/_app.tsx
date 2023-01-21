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

const App = ({ Component, pageProps }: AppProps) => {
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

	return (
		<ColorProvider primaryColor={primaryColor} setPrimaryColor={setPrimaryColor}>
			<ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
				<MantineProvider
					theme={{ colorScheme, primaryColor }}
					withGlobalStyles
					withNormalizeCSS
				>
					<Layout>
						<Component {...pageProps} />
					</Layout>
				</MantineProvider>
			</ColorSchemeProvider>
		</ColorProvider>
	);
}

export default App;
