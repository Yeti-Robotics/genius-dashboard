import { Card, Drawer, Group, Text } from '@mantine/core';
import { ThemeSwitch } from './ThemeSwitch';
import { ColorPicker } from './ColorPicker';
import { Burger } from '@mantine/core';
import { Menu } from './Menu';

type Props = {
	opened: boolean;
	toggle: () => void;
	close: () => void;
};

export const Header = ({ opened, toggle, close }: Props) => {
	return (
		<Card shadow='lg' py={0} px='xs'>
			<Group h={64} align='center'>
				<Burger
					opened={opened}
					title={opened ? 'Open Menu' : 'Close Menu'}
					onClick={toggle}
				/>
				<Text size='xl' fw={700}>
					Genius Dashboard
				</Text>
			</Group>
			<Drawer withCloseButton={false} opened={opened} onClose={close}>
				<Menu opened={opened} toggle={toggle} />
			</Drawer>
		</Card>
	);
};
