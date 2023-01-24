import { ActionIcon, Card, Group, Text } from '@mantine/core';
import { useTopic } from '@/stores/topicsStore';
import { Board, Widget, useBoardActions } from '@/stores/boardStore';
import { IconDots, IconGridDots } from '@tabler/icons';
import Draggable from 'react-draggable';
import { useState } from 'react';
import { WIDGET_NAME_DISPLAY_MAP } from '.';

type Props = {
	board: Board;
	widget: Widget;
	zIndex: number;
};

export const WidgetBase = ({ board, widget, zIndex }: Props) => {
	const { onDragEnd, onDragStart } = useBoardActions();
	const [isDragging, setIsDragging] = useState(false);
	const data = useTopic(widget.topic);
	const Display = WIDGET_NAME_DISPLAY_MAP[widget.display];

	return (
		<Draggable
			defaultPosition={{ x: widget.x, y: widget.y }}
			bounds='parent'
			handle='.handle'
			onStart={() => {
				setIsDragging(true);
				onDragStart(board.name, widget.name);
			}}
			onStop={(_, data) => {
				setIsDragging(false);
				onDragEnd(board.name, widget.name, data);
			}}
		>
			<Card
				withBorder
				pos='absolute'
				shadow={isDragging ? 'xl' : 'md'}
				p='md'
				w='auto'
				sx={(theme) => ({
					zIndex,
					borderColor: isDragging ? theme.colors[theme.primaryColor][5] : '',
				})}
			>
				<Card.Section inheritPadding pt='xs'>
					<Group position='apart'>
						<IconGridDots size={14} className='handle' cursor='move' />

						<ActionIcon variant='subtle'>
							<IconDots />
						</ActionIcon>
					</Group>
				</Card.Section>
				<Card.Section inheritPadding>
					<Display data={data} />
				</Card.Section>
				<Card.Section inheritPadding pb='xs'>
					<Text align='center'>{widget.name}</Text>
				</Card.Section>
			</Card>
		</Draggable>
	);
};
