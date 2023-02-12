import { ActionIcon, Card, Group, Menu, Text } from '@mantine/core';
import { useTopicData } from '@/stores/topicsStore';
import {
	Board,
	Widget,
	useBoardActions,
	useCurrentBoardName,
	useWidget,
} from '@/stores/boardStore';
import {
	IconArrowsShuffle,
	IconDots,
	IconEdit,
	IconGridDots,
	IconLock,
	IconSettings,
	IconTrash,
} from '@tabler/icons-react';
import Draggable from 'react-draggable';
import { useState } from 'react';
import { WIDGET_NAME_MAP } from '.';
import { MapOrValue } from '@/types/utils';
import { Message } from '@/types/Message';
import { useDisclosure } from '@mantine/hooks';
import { openConfirmModal, openModal } from '@mantine/modals';
import { SourcesForm } from './SourcesForm';
import { EditWidgetModal } from './EditWidgetModal';

type Props = {
	board: Board;
	widgetName: string;
	zIndex: number;
};

export const WidgetBase = (props: Props) => {
	const { onDragEnd, onDragStart } = useBoardActions();
	const [isDragging, setIsDragging] = useState(false);
	const widget = useWidget(props.board.name, props.widgetName);
	const data = useTopicData(widget?.sources ?? {});

	if (!widget) return null;

	const draggable = !widget.locked;

	return (
		<Draggable
			defaultPosition={{ x: widget.x, y: widget.y }}
			bounds='parent'
			handle='.handle'
			onStart={() => {
				if (!draggable) return false;
				setIsDragging(true);
				onDragStart(props.board.name, widget.name);
			}}
			onStop={(_, data) => {
				setIsDragging(false);
				onDragEnd(props.board.name, widget.name, {
					x: data.lastX,
					y: data.lastY,
				});
			}}
		>
			<WidgetCard
				draggable={draggable}
				data={data}
				example={false}
				options={widget.options}
				isDragging={isDragging}
				widget={widget}
				zIndex={props.zIndex}
				widgetName={props.widgetName}
			/>
		</Draggable>
	);
};

export const WidgetCard = ({
	isDragging,
	draggable,
	zIndex,
	widget,
	data,
	options,
	example,
	...props
}: Omit<Props, 'board'> & {
	isDragging: boolean;
	draggable: boolean;
	example: boolean;
	data: Record<string, MapOrValue<Message> | undefined>;
	options: Record<string, any>;
	widget: Widget;
}) => {
	const { Component } = WIDGET_NAME_MAP[widget.display];
	const currentBoardName = useCurrentBoardName();
	const { setWidget, removeWidget } = useBoardActions();
	const [menuOpened, { toggle, close }] = useDisclosure(false);

	return (
		<Card
			withBorder
			{...props}
			pos={!example ? 'absolute' : undefined}
			shadow={draggable ? (isDragging ? 'xl' : 'md') : 'none'}
			p='md'
			w='auto'
			sx={{ zIndex }}
		>
			<Card.Section inheritPadding pt='xs'>
				<Group position='apart'>
					<IconGridDots
						size={14}
						className='handle'
						cursor={draggable ? 'move' : 'not-allowed'}
					/>

					<Menu
						position='top-end'
						opened={menuOpened}
						onClose={close}
						withinPortal
					>
						<Menu.Target>
							<ActionIcon
								variant='subtle'
								onClick={() => {
									if (example) return;
									toggle();
								}}
							>
								<IconDots />
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Item
								icon={<IconEdit size={16} />}
								onClick={() =>
									openModal({
										title: `Edit ${widget.name}`,
										children: (
											<EditWidgetModal
												boardName={currentBoardName}
												component={WIDGET_NAME_MAP[widget.display]}
												widgetName={widget.name}
											/>
										),
									})
								}
							>
								Edit Widget
							</Menu.Item>
							<Menu.Item
								icon={<IconLock size={16} />}
								color={draggable ? 'yellow' : 'green'}
								onClick={() =>
									setWidget(currentBoardName, widget.name, {
										locked: draggable,
									})
								}
							>
								{draggable ? 'Lock' : 'Unlock'} Position
							</Menu.Item>
							<Menu.Item
								icon={<IconTrash size={16} />}
								color='red'
								onClick={() =>
									openConfirmModal({
										title: 'Are you sure? 🤔',
										children: (
											<Text>
												Are you sure you want to delete your {widget.name}{' '}
												modal.
											</Text>
										),
										confirmProps: { color: 'red', children: 'Remove 😈' },
										cancelProps: { children: 'Keep It 🥺' },
										onConfirm: () =>
											removeWidget(currentBoardName, widget.name),
									})
								}
							>
								Delete Widget
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				</Group>
			</Card.Section>
			<Card.Section inheritPadding>
				<Component data={data} options={options} sources={widget.sources} />
			</Card.Section>
			<Card.Section inheritPadding pb='xs'>
				<Text fw={600} align='center'>
					{widget.name}
				</Text>
			</Card.Section>
		</Card>
	);
};
