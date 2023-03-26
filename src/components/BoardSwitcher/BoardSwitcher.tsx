import {
	useAllBoards,
	useBoardActions,
	useCurrentBoardName,
} from '@/stores/boardStore';
import {
	Affix,
	Group,
	Paper,
	Text,
	createStyles,
} from '@mantine/core';
import { useWindowEvent } from '@mantine/hooks';
import { memo, useState } from 'react';

const useStyles = createStyles((theme) => ({
	board: {},
	active: {
		backgroundColor: theme.fn.variant({
			variant: 'light',
			color: theme.primaryColor,
		}).background,
		color: theme.fn.variant({ variant: 'light', color: theme.primaryColor })
			.color,
	},
}));

export const BoardSwitcher = memo(() => {
	const { classes, cx } = useStyles();
	const boards = Object.keys(useAllBoards());
	const currentBoard = useCurrentBoardName();
	const { setCurrentBoard } = useBoardActions();
	const [isOpen, setIsOpen] = useState(false);

	// Next board or loop
	const moveBoard = () => {
		const currentBoardIdx = boards.findIndex((name) => name === currentBoard);
		if (boards[currentBoardIdx + 1]) {
			setCurrentBoard(boards[currentBoardIdx + 1]);
		} else {
			setCurrentBoard(boards[0]);
		}
	};

	useWindowEvent('keydown', (e) => {
		// Do nothing if there are no more boards
		if (boards.length <= 1) return;
		if (!isOpen && e.ctrlKey && e.key === 'Tab') {
			// First open
			e.preventDefault();
			setIsOpen(true);
			moveBoard();
		} else if (isOpen && e.key === 'Tab') {
			e.preventDefault();
			moveBoard();
		}
	});

	useWindowEvent('keyup', (e: KeyboardEvent) => {
		// Only close if they let go of the control key
		if (e.key === 'Control') {
			setIsOpen(false);
		}
	});

	if (!isOpen) return null;

	return (
		<Affix
			maw='100vw'
			left='50%'
			top='50%'
			sx={{ transform: 'translate(-50%, -50%)' }}
		>
			<Paper w='100%' p='xl' withBorder shadow='xl'>
				<Group align='center' position='center' mx='md'>
					{boards.map((board) => (
						<Text
							py='0.25rem'
							px='0.5rem'
							fw={600}
							sx={(theme) => ({ borderRadius: theme.radius.sm })}
							size={18}
							className={cx({ [classes.active]: currentBoard === board })}
							key={board}
						>
							{board}
						</Text>
					))}
				</Group>
			</Paper>
		</Affix>
	);
});
