import { useState } from 'react';
import {
	createStyles,
	Navbar,
	Group,
	Burger,
	Text,
	Stack,
	TextInput,
	Button,
	NavLink,
} from '@mantine/core';
import { IconPlus, IconReload, IconSettings } from '@tabler/icons-react';
import { useAllBoards, useBoardActions } from '@/stores/boardStore';
import { invokeResult } from '@/utils/invokeResult';
import { ThemeSwitch } from '../ThemeSwitch';
import { ColorPicker } from '../ColorPicker';
import { closeAllModals, openModal } from '@mantine/modals';
import { BoardButton } from './BoardButton';
import { openSettingsModal } from '@/utils/modals';

const useStyles = createStyles((theme) => {
	return {
		footer: {
			paddingTop: theme.spacing.md,
			marginTop: theme.spacing.md,
			borderTop: `1px solid ${
				theme.colorScheme === 'dark'
					? theme.colors.dark[4]
					: theme.colors.gray[2]
			}`,
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

	const onSubmit = () => {
		if (!boardName) return setError('Must not be empty');
		if (error) return;
		setBoard(boardName, {
			name: boardName,
			widgets: [],
			settings: {},
		});
		closeAllModals();
	};

	return (
		<Stack>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					onSubmit();
				}}
			>
				<TextInput
					label='Board Name'
					value={boardName}
					error={error || undefined}
					data-autofocus
					onChange={(e) => {
						if (e.target.value in boards) setError('Name must be unique');
						setError('');
						setBoardName(e.target.value);
					}}
				/>
			</form>
			<Button color={error ? 'red' : undefined} onClick={onSubmit}>
				Create
			</Button>
		</Stack>
	);
};

export const Menu = ({ opened, toggle }: Props) => {
	const { classes } = useStyles();
	const allBoards = useAllBoards();
	const boards = Object.keys(allBoards);

	const links = boards.map((boardName, i) => (
		<BoardButton boardName={boardName} i={i} key={boardName} />
	));

	return (
		<Navbar p='md' h='100%'>
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
				<NavLink
					label='Create a board'
					onClick={(e) => {
						e.preventDefault();
						openModal({
							title: 'Create a new board',
							children: <CreateBoardModal />,
						});
					}}
					icon={<IconPlus stroke={1.5} />}
				/>
				<NavLink
					label='Reconnect To Robot'
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
					icon={<IconReload stroke={1.5} />}
				/>
				<NavLink
					label='Settings'
					onClick={(e) => {
						e.preventDefault();
						openSettingsModal();
					}}
					icon={<IconSettings stroke={1.5} />}
				/>
				<Group mt='md' position='center'>
					<ThemeSwitch /> <ColorPicker />
				</Group>
			</Navbar.Section>
		</Navbar>
	);
};
