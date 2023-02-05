import { Button, Card, Text } from '@mantine/core';
import { Option, OptionDefToType, WIDGET_NAME_MAP } from '..';
import { WidgetCard } from '../WidgetBase';
import { openModal } from '@mantine/modals';
import { Board, useCurrentBoard } from '@/stores/boardStore';
import { Type } from '@/types/Message';
import { ConfigureWidgetModal } from './ConfigureWidgetModal';

type Props<K extends keyof typeof WIDGET_NAME_MAP> = {
	name: K;
	widget: typeof WIDGET_NAME_MAP[K];
	board: Board;
};

const defaultForType: Record<Type, any> = {
	'boolean[]': [true, false],
	'double[]': [1.2, 3.14],
	'float[]': [1.23, 6.28],
	'int[]': [1, 2, 3],
	'string[]': ['sussy', 'baka'],
	boolean: false,
	double: 3.14159,
	float: 6.28318,
	int: 1113,
	raw: [0, 1, 255, 6, 7, 8],
	string: 'amogus',
};

const defaultForOption = (option: Option | null | undefined) => {
	if (option?.type === 'enum') {
		return option.options;
	} else if (option?.type === 'string') {
		return 'Red is Sus!';
	} else if (option?.type === 'float') {
		return 3.14;
	} else if (option?.type === 'int') {
		return 1113;
	} else {
		throw new Error(`Unknown widget option type: ${(option as any)?.type}`);
	}
};

export const WidgetExample = <K extends keyof typeof WIDGET_NAME_MAP>({
	name,
	widget,
	board,
}: Props<K>) => {
	const currentBoard = useCurrentBoard();

	const data = Object.fromEntries(
		Object.entries(widget.sources).map(([sourceName, source]) => {
			if (source.type === 'topic') {
				const sourceType = source.types[0] ?? 'int';

				return [
					sourceName,
					{
						topic_name: '',
						timestamp: 1,
						type: source.types[0],
						data: defaultForType[sourceType],
					},
				];
			}
			return ['', ''];
		})
	) as any;

	const options = Object.fromEntries(
		Object.entries(widget.options).map(([optName, option]) => [
			optName,
			defaultForOption(option as Option),
		])
		// trust me bro, its the correct type 😁
	) as any;

	console.log(`${name} example`, { data, options });

	return (
		<Card p='md' withBorder shadow='md'>
			<Card.Section pt='md' inheritPadding>
				<Text align='center' size='xl' fw={600}>
					{name}
				</Text>
			</Card.Section>
			<Card.Section py='md' inheritPadding>
				<WidgetCard
					data={data}
					isDragging
					draggable={false}
					options={options}
					widget={{
						display: name,
						name: 'Example',
						sources: {} as any,
						options,
						height: 100,
						width: 100,
						x: 300,
						y: 300,
					}}
					zIndex={0}
				/>
			</Card.Section>
			<Card.Section pb='md' inheritPadding>
				<Button
					fullWidth
					onClick={() =>
						openModal({
							title: `Add ${name} widget to ${currentBoard?.name}`,
							children: (
								<ConfigureWidgetModal name={name} widget={widget} board={board} />
							),
						})
					}
				>
					Add To Board
				</Button>
			</Card.Section>
		</Card>
	);
};
