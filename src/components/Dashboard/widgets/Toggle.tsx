import { isMessage } from '../assertions';
import { Stack, Switch, Text } from '@mantine/core';
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
				<Stack>
					<Text>Waiting on data...</Text>
					<Text size='sm'>
						This widget is deprecated, use editable instead.
					</Text>
				</Stack>
			);

		if (!isMessage(data.data))
			return (
				<Stack>
					<Text>Topic must be standalone (not a chooser, etc.)</Text>{' '}
					<Text size='sm'>
						This widget is deprecated, use editable instead.
					</Text>
				</Stack>
			);

		if (data.data.type !== 'boolean')
			return (
				<Stack>
					<Text>Topic type must be `boolean`</Text>{' '}
					<Text size='sm'>
						This widget is deprecated, use editable instead.
					</Text>
				</Stack>
			);

		return (
			<Stack>
				<Switch
					checked={data.data.data as boolean}
					onChange={async (e) => {
						console.log(sources.data);
						if (isExample || !isMessage(data.data)) return;
						setChecked(e.target.checked);
					}}
				/>{' '}
				<Text size='sm'>This widget is deprecated, use editable instead.</Text>
			</Stack>
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
	deprecated: true,
};
