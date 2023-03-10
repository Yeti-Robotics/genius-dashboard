import { useCurrentBoard } from '@/stores/boardStore';
import {
	ActionIcon,
	Box,
	Center,
	Group,
	Paper,
	Text,
	Tooltip,
	useMantineTheme,
} from '@mantine/core';
import { WidgetBase } from './WidgetBase';
import { IconPlus } from '@tabler/icons-react';
import { openModal } from '@mantine/modals';
import { SelectWidgetModal } from './SelectWidgetModal/SelectWidgetModal';

export const Dashboard = () => {
	const board = useCurrentBoard();
	const theme = useMantineTheme();

	if (!board)
		return (
			<Center>No board selected, open the menu to create or select one.</Center>
		);

	return (
		<Box pos='relative' h='100%'>
			{board.widgets.map((widget, i) => (
				<WidgetBase
					key={`${board.name}-${widget.display}-${widget.name}-${JSON.stringify(
						widget.sources
					)}`}
					widget={widget}
					board={board}
					widgetName={widget.name}
					zIndex={board.widgets.length + i * -1}
				/>
			))}
			<Paper
				p='xs'
				withBorder
				shadow='lg'
				pos='absolute'
				bottom='0.5rem'
				right='2rem'
				sx={{ zIndex: 2, overflow: 'visible' }}
			>
				<Group>
					<Text size='sm' mr={30}>
						{board.name}
					</Text>
					<Tooltip withArrow label='Add Widget'>
						<ActionIcon
							radius='xl'
							size={64}
							pos='absolute'
							right='-32px'
							variant='gradient'
							gradient={{
								from: theme.colors[theme.primaryColor][8],
								to: theme.colors[theme.primaryColor][5],
							}}
							onClick={() =>
								openModal({
									title: 'Select a widget',
									children: <SelectWidgetModal board={board} />,
								})
							}
							sx={{ zIndex: 3 }}
						>
							<IconPlus />
						</ActionIcon>
					</Tooltip>
				</Group>
			</Paper>
		</Box>
	);
};
