import { isMessage } from '../assertions';
import { Center, Text } from '@mantine/core';
import { WidgetComponent } from '..';
import { Type } from '@/types/Message';
import { DisplaySimply } from '../DisplaySimply';
import { ExtraProps } from '../ExtraProps';

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
					<ExtraProps data={data.data} baseKeys={[]} />
				</Center>
			);

		return (
			<DisplaySimply textSize={16} message={data.data} />
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
