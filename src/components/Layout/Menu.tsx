import { useState } from 'react';
import {
	createStyles,
	Navbar,
	Group,
	Box,
	Burger,
	Text,
	Stack,
	TextInput,
	Button,
} from '@mantine/core';
import { IconPlus, IconReload, IconSettings } from '@tabler/icons-react';
import { useAllBoards, useBoardActions, useCurrentBoardName } from '@/stores/boardStore';
import { invokeResult } from '@/utils/invokeResult';
import { ThemeSwitch } from './ThemeSwitch';
import { ColorPicker } from './ColorPicker';
import { closeAllModals, openContextModal, openModal } from '@mantine/modals';

const useStyles = createStyles((theme, _params, getRef) => {
	const icon = getRef('icon');
	return {
		footer: {
			paddingTop: theme.spacing.md,
			marginTop: theme.spacing.md,
			borderTop: `1px solid ${
				theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
			}`,
		},

		link: {
			...theme.fn.focusStyles(),
			display: 'flex',
			alignItems: 'center',
			textDecoration: 'none',
			fontSize: theme.fontSizes.sm,
			color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[7],
			padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
			borderRadius: theme.radius.sm,
			fontWeight: 500,
			cursor: 'pointer',

			'&:hover': {
				backgroundColor:
					theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
				color: theme.colorScheme === 'dark' ? theme.white : theme.black,

				[`& .${icon}`]: {
					color: theme.colorScheme === 'dark' ? theme.white : theme.black,
				},
			},
		},

		linkIcon: {
			ref: icon,
			color: theme.colorScheme === 'dark' ? theme.colors.dark[2] : theme.colors.gray[6],
			marginRight: theme.spacing.sm,
		},

		linkActive: {
			'&, &:hover': {
				backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor })
					.background,
				color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
				[`& .${icon}`]: {
					color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
				},
			},
		},
	};
});

type Props = {
	opened: boolean;
	toggle: () => void;
};

const CreateBoardModal = () => {
	const [boardName, setBoardName] = useState('');
	const [error, setError] = useState('');
	const boards = useAllBoards();
	const { setBoard } = useBoardActions();

	return (
		<Stack>
			<TextInput
				label='Board Name'
				value={boardName}
				error={error || undefined}
				onChange={(e) => {
					if (e.target.value in boards) setError('Name must be unique');
					setError('');
					setBoardName(e.target.value);
				}}
			/>
			<Button
				color={error ? 'red' : undefined}
				onClick={() => {
					if (!boardName) return setError('Must not be empty');
					if (error) return;
					setBoard(boardName, {
						name: boardName,
						widgets: [],
						settings: {},
					});
					closeAllModals();
				}}
			>
				Create
			</Button>
		</Stack>
	);
};

export const Menu = ({ opened, toggle }: Props) => {
	const { classes, cx } = useStyles();
	const { setCurrentBoard } = useBoardActions();
	const currentBoardName = useCurrentBoardName();
	const boards = Object.keys(useAllBoards());

	const links = boards.map((boardName, i) => (
		<Box
			className={cx(classes.link, { [classes.linkActive]: boardName === currentBoardName })}
			key={boardName}
			data-autofocus={i === 0}
			onClick={(event) => {
				event.preventDefault();
				setCurrentBoard(boardName);
			}}
		>
			<span>{boardName}</span>
		</Box>
	));

	return (
		<Navbar p='md'>
			<Navbar.Section grow>
				<Group align='center' pb='md' h={48}>
					<Burger
						opened={opened}
						title={opened ? 'Open Menu' : 'Close Menu'}
						onClick={toggle}
					/>
					<Text size='xl' fw={700}>
						Genius Dashboard
					</Text>
				</Group>
				{links}
			</Navbar.Section>

			<Navbar.Section className={classes.footer}>
				<div
					className={classes.link}
					onClick={(e) => {
						e.preventDefault();
						openModal({ title: 'Create a new board', children: <CreateBoardModal /> });
					}}
				>
					<IconPlus className={classes.linkIcon} stroke={1.5} />
					<span>Create a board</span>
				</div>
				<div
					className={classes.link}
					onClick={async (e) => {
						e.preventDefault();
						const addr =
							process.env.NODE_ENV === 'development'
								? '127.0.0.1:5810'
								: '10.35.6.2:5810';
						await invokeResult('close_client', {
							addr,
						});
						await invokeResult('start_client', {
							addr:
								process.env.NODE_ENV === 'development'
									? '127.0.0.1:5810'
									: '10.35.6.2:5810',
						});
					}}
				>
					<IconReload className={classes.linkIcon} stroke={1.5} />
					<span>Reconnect to Robot</span>
				</div>
				<div className={classes.link} onClick={(e) => e.preventDefault()}>
					<IconSettings className={classes.linkIcon} stroke={1.5} />
					<span>Settings</span>
				</div>
				<Group mt='md' position='center'>
					<ThemeSwitch /> <ColorPicker />
				</Group>
			</Navbar.Section>
		</Navbar>
	);
};
