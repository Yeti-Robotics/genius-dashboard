import { isMessage } from '../assertions';
import { Center, Text } from '@mantine/core';
import { WidgetComponent } from '..';
import { Type } from '@/types/Message';

export const SimpleDisplay: WidgetComponent<
	{ data: { type: 'topic'; types: Type[]; description: string; required: true } }
> = {
	Component: ({ data }) => {
		if (!data.data)
			return (
				<Center>
					<Text>Waiting on data...</Text>
				</Center>
			);

		if (!isMessage(data.data))
			return (
				<Center>
					<Text>Topic must be standalone (not a chooser, etc.)</Text>
				</Center>
			);

		return (
			<Center>
				<Text fw={600} size='xl'>
					{data.data.type !== 'raw'
						? JSON.stringify(data.data.data)
						: "Raw data can't be displayed"}
				</Text>
			</Center>
		);
	},
	description: 'Display data simply.',
	sources: {
		data: {
			type: 'topic',
			types: [
				'boolean',
				'boolean[]',
				'int',
				'int[]',
				'float',
				'float[]',
				'double',
				'double[]',
				'string',
				'string[]',
			],
			required: true,
			description: 'Data to display',
		},
	},
	options: {},
};
