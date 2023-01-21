import { Group, Stack } from '@mantine/core';
import { ReactNode } from 'react';
import { ColorPicker } from './ColorPicker';
import { ThemeSwitch } from './ThemeSwitch';

type Props = {
	children: ReactNode;
};

export const Layout = ({ children }: Props) => {
	return (
		<Stack align='stretch' spacing={0}>
			<Group>
				<ThemeSwitch /> <ColorPicker />
			</Group>
			<Stack p='md'>{children}</Stack>
		</Stack>
	);
};
