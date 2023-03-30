import { isButtonHelper, isMessage } from '../assertions';
import {
	Button,
	Center,
	SimpleGrid,
	Stack,
	Text,
	useMantineTheme,
} from '@mantine/core';
import { WidgetComponent } from '..';

const layerToColorLight: Record<number, string> = {
	[0]: 'red',
	[1]: 'blue',
};

const layerToColorDark: Record<number, string> = {
	[0]: 'red',
	[1]: 'blue',
};

const layerToColor = (layer: number, isDark: boolean) =>
	isDark ? layerToColorDark[layer] : layerToColorLight[layer];

export const Controller: WidgetComponent<
	{
		data: { type: 'controller'; description: string; required: true };
	},
	{
		columns: {
			type: 'int';
			description: string;
			default: number;
		};
		start: {
			type: 'enum';
			description: string;
			options: string[];
			default: string;
		};
	}
> = {
	Component: ({ data, options }) => {
		const theme = useMantineTheme();
		const isDark = theme.colorScheme === 'dark';
		const isExample = 'example' in options;

		if (!data.data)
			return (
				<Center>
					<Text>Waiting on data...</Text>
				</Center>
			);

		if (!isButtonHelper(data.data, isMessage))
			return (
				<Center>
					<Text>Topic must follow structure of a controller publisher</Text>
				</Center>
			);

		// Array of button numbers sorted ascending
		const buttons = Object.keys(data.data)
			.filter((key) => key.endsWith('layer'))
			// The first section before '-' should be the button number
			.map((key) => parseInt(key.split('-')[0]))
			.filter((num) => !isNaN(num))
			// Sorts ascending
			.sort((a, b) => a - b);

		if (options.start.includes('right')) buttons.reverse();

		const numRows = Math.ceil(buttons.length / options.columns);
		const midRow = numRows / 2;

		return (
			<Center p='md'>
				<SimpleGrid cols={isExample ? 3 : options.columns ?? 6} spacing='xs' verticalSpacing='md'>
					{buttons.map((buttonNumber, i) => {
						if (!isButtonHelper(data.data, isMessage)) return;
						const layer = data.data[`${buttonNumber}-layer`].data as number;
						const commandName = data.data[`${buttonNumber}-command`]
							.data as string;
						const color = layerToColor(layer, isDark);

						let order: number | undefined;
						// row number this button is in between 1
						const rowNumber = Math.ceil((i + 1) / options.columns);
						const pivotRow = Math.round(midRow - rowNumber);

						if (
							options.start === 'bottom-left' ||
							options.start === 'top-right'
						)
							order = (pivotRow + 1) * options.columns;

						return (
							<Stack key={i} align='center' sx={{ order }} spacing={0}>
								<Button
									bg={color}
									p='md'
									w='5rem'
									h='3rem'
								>
									<Text size='xs' align='center'>
										{buttonNumber}
									</Text>
								</Button>
								<Text size='xs'>{commandName}</Text>
							</Stack>
						);
					})}
				</SimpleGrid>
				{isExample && <Text align='center'>This widget is in beta</Text>}
			</Center>
		);
	},
	description: 'Show a controller',
	sources: {
		data: {
			type: 'controller',
			required: true,
			description: 'Controller to display',
		},
	},
	options: {
		columns: {
			type: 'int',
			description: 'How many columns to show buttons in',
			default: 6,
		},
		start: {
			type: 'enum',
			description: 'Where to start ordering buttons from',
			options: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
			default: 'bottom-left',
		},
	},
};
