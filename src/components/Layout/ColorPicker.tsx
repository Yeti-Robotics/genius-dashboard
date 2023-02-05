import {
	ActionIcon,
	Box,
	createStyles,
	Group,
	Popover,
	Stack,
	Text,
	ThemeIcon,
	useMantineTheme,
} from '@mantine/core';
import { useClickOutside, useToggle } from '@mantine/hooks';
import { usePrimaryColor } from '../ColorProvider';
import { IconDroplet, IconCheck } from '@tabler/icons-react';

const useStyles = createStyles((theme) => {
	const colors = theme.fn.variant({ color: theme.primaryColor, variant: 'filled' });

	return {
		wrapper: {},

		menuButton: {
			backgroundColor: colors.background,
			cursor: 'pointer',
			'&:hover': {
				backgroundColor: colors.hover,
			},
		},

		colorButton: {
			borderRadius: '50%',
			cursor: 'pointer',
		},
	};
});

export const ColorPicker = () => {
	const { classes } = useStyles();
	const [opened, toggleOpened] = useToggle([false, true]);
	const ref = useClickOutside(() => toggleOpened(false));
	const theme = useMantineTheme();
	const { primaryColor, setPrimaryColor } = usePrimaryColor();

	const colors = Object.entries(theme.colors).map(([color, values]) => {
		const isSelected = primaryColor === color;
		return (
			<ThemeIcon
				key={color}
				className={classes.colorButton}
				sx={{
					backgroundColor: isSelected ? theme.fn.darken(values[6], 0.1) : values[6],
					border:
						color === 'dark' && theme.colorScheme === 'dark'
							? '1px dashed white'
							: undefined,
				}}
				onClick={() => setPrimaryColor(color)}
			>
				{isSelected ? <IconCheck /> :  null}
			</ThemeIcon>
		);
	});

	return (
		<div ref={ref} className={classes.wrapper}>
			<Popover opened={opened} position='bottom' withArrow withinPortal>
				<Popover.Target>
					<ActionIcon className={classes.menuButton} onClick={() => toggleOpened()}>
						<IconDroplet color='white' />
					</ActionIcon>
				</Popover.Target>

				<Popover.Dropdown>
					<Box sx={{ minWidth: 150, maxWidth: 300 }} py={8}>
						<Stack align='center' onClick={(e) => e.stopPropagation()}>
							<Text sx={{ fontWeight: 500 }} align='center'>
								Choose a color
							</Text>
							<Group sx={{ justifyContent: 'center' }} grow>
								{colors}
							</Group>
						</Stack>
					</Box>
				</Popover.Dropdown>
			</Popover>
		</div>
	);
};
