import { ActionIcon, Card, Group, Text } from '@mantine/core';
import { useTopicData } from '@/stores/topicsStore';
import { Board, Widget, useBoardActions } from '@/stores/boardStore';
import { IconDots, IconGridDots } from '@tabler/icons-react';
import Draggable from 'react-draggable';
import { forwardRef, useState } from 'react';
import { WIDGET_NAME_MAP } from '.';
import { MapOrValue } from '@/types/utils';
import { Message } from '@/types/Message';

type Props = {
	board: Board;
	widget: Widget;
	zIndex: number;
};

export const WidgetBase = (props: Props) => {
	const { onDragEnd, onDragStart } = useBoardActions();
	const [isDragging, setIsDragging] = useState(false);
	const [options, setOptions] = useState<Record<string, any>>();
	const data = useTopicData(props.widget.sources);

	return (
		<Draggable
			defaultPosition={{ x: props.widget.x, y: props.widget.y }}
			bounds='parent'
			handle='.handle'
			onStart={() => {
				setIsDragging(true);
				onDragStart(props.board.name, props.widget.name);
			}}
			onStop={(_, data) => {
				setIsDragging(false);
				onDragEnd(props.board.name, props.widget.name, { x: data.lastX, y: data.lastY });
			}}
		>
			<WidgetCard
				draggable
				data={data}
				options={options}
				isDragging={isDragging}
				widget={props.widget}
				zIndex={props.zIndex}
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
	...props
}: Omit<Props, 'board'> & {
	isDragging: boolean;
	draggable: boolean;
	data: Record<string, MapOrValue<Message> | undefined>;
	options: Record<string, any> | undefined;
}) => {
	const { Component } = WIDGET_NAME_MAP[widget.display];

	return (
		<Card
			withBorder
			{...props}
			pos={draggable ? 'absolute' : undefined}
			shadow={draggable ? (isDragging ? 'xl' : 'md') : 'none'}
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
				<Component data={data} options={widget.options} />
			</Card.Section>
			<Card.Section inheritPadding pb='xs'>
				<Text align='center'>{widget.name}</Text>
			</Card.Section>
		</Card>
	);
};
