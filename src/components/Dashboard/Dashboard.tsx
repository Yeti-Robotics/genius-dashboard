import { useBoardActions, useCurrentBoard } from '@/stores/boardStore';
import { Box, Center } from '@mantine/core';
import { WidgetBase } from './WidgetBase';

export const Dashboard = () => {
	const board = useCurrentBoard();
	const {  } = useBoardActions();

	if (!board) return <Center>No board selected, open the menu to create or select one.</Center>;

	return (
		<Box pos='relative' h='100%'>
			{board.widgets.map((widget, i) => (
				<WidgetBase key={widget.topic} board={board} widget={widget} zIndex={board.widgets.length + (i * -1)} />
			))}
		</Box>
	);
};
