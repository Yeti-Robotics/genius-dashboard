import { Switch, Group, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { IconSun, IconMoonStars } from '@tabler/icons-react';

export const ThemeSwitch = () => {
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();
	const theme = useMantineTheme();

	return (
		<Group position='center'>
			<Switch
				checked={colorScheme === 'dark'}
				onChange={() => toggleColorScheme()}
				size='lg'
				onLabel={<IconSun color={theme.white} size={20} stroke={1.5} />}
				offLabel={<IconMoonStars color={theme.colors.gray[6]} size={20} stroke={1.5} />}
			/>
		</Group>
	);
};
