import { useBoardActions, useCurrentBoardName } from '@/stores/boardStore';
import { ActionIcon, Menu, NavLink, Text } from '@mantine/core';
import { openConfirmModal, openModal } from '@mantine/modals';
import { IconDots, IconEdit, IconTrash } from '@tabler/icons-react';
import { EditBoardModal } from './EditBoardModal';

type Props = {
	boardName: string;
	i: number;
};

export const BoardButton = ({ boardName, i }: Props) => {
	const { setCurrentBoard, removeBoard } = useBoardActions();
	const currentBoardName = useCurrentBoardName();

	return (
		<NavLink
			key={boardName}
			label={boardName}
			component='div'
			data-autofocus={i === 0}
			onClick={(e) => {
				e.preventDefault();
				setCurrentBoard(boardName);
			}}
			styles={{ label: { fontSize: 18, fontWeight: 600 } }}
			active={currentBoardName === boardName}
			rightSection={
				<Menu withinPortal>
					<Menu.Target>
						<ActionIcon
							variant='filled'
							onClick={(e) => {
								e.stopPropagation();
							}}
						>
							<IconDots />
						</ActionIcon>
					</Menu.Target>

					<Menu.Dropdown>
						<Menu.Item
							icon={<IconEdit size={16} />}
							onClick={(e) => {
								e.stopPropagation();
								openModal({
									title: `Edit ${boardName}`,
									children: <EditBoardModal boardName={boardName} />,
								});
							}}
						>
							Edit Board
						</Menu.Item>
						<Menu.Item
							icon={<IconTrash size={16} />}
							color='red'
							onClick={(e) => {
								e.stopPropagation();
								openConfirmModal({
									title: 'Are you sure? 🤔',
									children: (
										<Text>Are you sure you want to delete {boardName}?</Text>
									),
									confirmProps: { color: 'red', children: 'Remove 😈' },
									cancelProps: { children: 'Keep It 🥺' },
									onConfirm: () => removeBoard(boardName),
								});
							}}
						>
							Delete Board
						</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			}
		/>
	);
};
