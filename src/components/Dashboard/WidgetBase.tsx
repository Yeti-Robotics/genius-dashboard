import {
	ActionIcon,
	Box,
	Card,
	Group,
	Menu,
	Paper,
	Stack,
	Text,
} from '@mantine/core';
import { useTopicData } from '@/stores/topicsStore';
import {
	Board,
	Widget,
	useBoardActions,
	useCurrentBoardName,
} from '@/stores/boardStore';
import {
	IconChevronDownRight,
	IconDots,
	IconEdit,
	IconGridDots,
	IconLock,
	IconLockOpen,
	IconResize,
	IconTrash,
} from '@tabler/icons-react';
import Draggable from 'react-draggable';
import { forwardRef, memo, useState } from 'react';
import { WIDGET_NAME_MAP } from '.';
import { MapOrValue } from '@/types/utils';
import { Message } from '@/types/Message';
import { useDisclosure } from '@mantine/hooks';
import { openConfirmModal, openModal } from '@mantine/modals';
import { EditWidgetModal } from './EditWidgetModal';
import { Rnd } from 'react-rnd';

type Props = {
	board: Board;
	widgetName: string;
	zIndex: number;
	widget: Widget;
};

export const WidgetBase = memo(({ widget, zIndex, ...props }: Props) => {
	const { onDragEnd, moveWidgetToFront, setWidget } = useBoardActions();
	const [isDragging, setIsDragging] = useState(false);
	const data = useTopicData(widget?.sources ?? {});

	if (!widget) return null;

	const draggable = !widget.locked;

	const baseProps = {
		draggable,
		data,
		example: false,
		options: widget.options,
		isDragging,
		widget,
		widgetName: props.widgetName,
	};

	return (
		<Rnd
			style={{ zIndex }}
			// This will reset it to use auto when autoSize is turned on
			size={widget.autoSize ? { width: 'auto', height: 'auto' } : undefined}
			default={widget}
			disableDragging={!draggable}
			onDragStart={() => {
				if (!draggable) return false;
				setIsDragging(true);
				moveWidgetToFront(props.board.name, widget.name);
			}}
			onDragStop={(_, data) => {
				setIsDragging(false);
				onDragEnd(props.board.name, widget.name, {
					x: data.lastX,
					y: data.lastY,
				});
			}}
			dragHandleClassName='handle'
			bounds='parent'
			resizeHandleComponent={{
				bottomRight: <IconChevronDownRight />,
			}}
			resizeGrid={[10, 10]}
			enableResizing={
				widget.autoSize || widget.lockSize
					? false
					: {
							bottomRight: true,
					  }
			}
			dragAxis='both'
			enableUserSelectHack
			onResizeStart={(e) => {
				if (!widget.autoSize) return e.preventDefault();
				moveWidgetToFront(props.board.name, widget.name);
			}}
			onResizeStop={(_e, _dir, el, _delta, position) => {
				setWidget(props.board.name, widget.name, {
					width: el.offsetWidth,
					height: el.offsetHeight,
					...position,
				});
			}}
		>
			<WidgetCard {...baseProps} />
		</Rnd>
	);
});

export const WidgetCard = forwardRef<
	HTMLDivElement,
	Omit<Props, 'board' | 'zIndex'> & {
		isDragging: boolean;
		draggable: boolean;
		example: boolean;
		data: Record<string, MapOrValue<Message> | undefined>;
		options: Record<string, any>;
		widget: Widget;
	}
>(({ isDragging, draggable, widget, data, options, example }, ref) => {
	const { Component } = WIDGET_NAME_MAP[widget.display];
	const currentBoardName = useCurrentBoardName();
	const { setWidget, removeWidget } = useBoardActions();
	const [menuOpened, { toggle, close }] = useDisclosure(false);

	return (
		<Card
			ref={ref}
			withBorder
			shadow={draggable ? (isDragging ? 'xl' : 'md') : 'none'}
			p='md'
			style={{ width: '100%', height: '100%' }}
		>
			<Stack h='100%'>
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
								icon={
									draggable ? (
										<IconLock size={16} />
									) : (
										<IconLockOpen size={16} />
									)
								}
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
								icon={<IconResize size={16} />}
								onClick={() =>
									setWidget(currentBoardName, widget.name, {
										autoSize: !widget.autoSize,
										lockSize: false,
									})
								}
							>
								{widget.autoSize ? 'Manual Size' : 'Auto Size'}
							</Menu.Item>
							{!widget.autoSize && (
								<Menu.Item
									icon={
										widget.lockSize ? (
											<IconLockOpen size={16} />
										) : (
											<IconLock size={16} />
										)
									}
									color={widget.lockSize ? 'green' : 'yellow'}
									onClick={() =>
										setWidget(currentBoardName, widget.name, {
											lockSize: !widget.lockSize,
										})
									}
								>
									{widget.lockSize ? 'Unlock Size' : 'Lock Size'}
								</Menu.Item>
							)}
							<Menu.Item
								icon={<IconTrash size={16} />}
								color='red'
								onClick={() =>
									openConfirmModal({
										title: 'Are you sure? 🤔',
										children: (
											<Text>
												Are you sure you want to delete your {widget.name}?
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
				<Paper withBorder p='xs' style={{ flexGrow: 1, overflow: 'auto' }}>
					<Component data={data} options={options} sources={widget.sources} />
				</Paper>
				<Text fw={600} align='center'>
					{widget.name}
				</Text>
			</Stack>
		</Card>
	);
});
