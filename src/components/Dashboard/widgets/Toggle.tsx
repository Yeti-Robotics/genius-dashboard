import { isMessage } from '../assertions';
import { Center, Switch, Text } from '@mantine/core';
import { WidgetComponent } from '..';
import { Type } from '@/types/Message';
import { usePublishValue } from '@/stores/topicsStore';

export const Toggle: WidgetComponent<{
	data: { type: 'topic'; types: Type[]; description: string; required: true };
}> = {
	Component: ({ data, sources, options }) => {
		const isExample = 'example' in options;
		const setChecked = usePublishValue(!isExample ? sources.data : '');

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

		if (data.data.type !== 'boolean')
			return (
				<Center>
					<Text>Topic type must be `boolean`</Text>
				</Center>
			);

		return (
			<Center>
				<Switch
					checked={data.data.data as boolean}
					onChange={async (e) => {
						console.log(sources.data);
						if (isExample || !isMessage(data.data)) return;
						setChecked(e.target.checked);
					}}
				/>
			</Center>
		);
	},
	description: 'Display a toggle for a boolean.',
	sources: {
		data: {
			type: 'topic',
			types: ['boolean'],
			required: true,
			description: 'Boolean to toggle',
		},
	},
	options: {},
};
