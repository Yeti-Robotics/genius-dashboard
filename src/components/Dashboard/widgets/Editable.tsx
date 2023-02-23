import { isMessage } from '../assertions';
import { Center, NumberInput, Switch, Text, TextInput } from '@mantine/core';
import { WidgetComponent } from '..';
import { Type } from '@/types/Message';
import { usePublishValue } from '@/stores/topicsStore';

export const Editable: WidgetComponent<{
	data: { type: 'topic'; types: Type[]; description: string; required: true };
}> = {
	Component: ({ data, sources }) => {
		const publishValue = usePublishValue(sources.data);

		if (!data.data)
			return (
				<Center>
					<Text>Waiting on data...</Text>
				</Center>
			);

		if (!isMessage(data.data))
			return (
				<Center>
					<Text>Topic must be standalone (not a chooser, camera, etc.)</Text>
				</Center>
			);

		if (data.data.type === 'int')
			return (
				<Center>
					<NumberInput
						value={(data.data.data as number) ?? 0}
						precision={0}
						onChange={async (v) => {
							if (!v) publishValue(0);
							publishValue(Math.round(v as number));
						}}
					/>
				</Center>
			);

		if (data.data.type === 'float' || data.data.type === 'double')
			return (
				<Center>
					<NumberInput
						defaultValue={(data.data.data as number) ?? 0}
						onChange={(v) => {
							if (!v) publishValue(0);
							publishValue(v);
						}}
					/>
				</Center>
			);

		if (data.data.type === 'string')
			return (
				<Center>
					<TextInput
						value={(data.data.data as string) ?? ''}
						onChange={async (e) => publishValue(e.target.value)}
					/>
				</Center>
			);

		if (data.data.type === 'boolean')
			return (
				<Center>
					<Switch
						checked={(data.data.data as boolean) ?? false}
						onChange={async (e) => publishValue(e.target.checked)}
					/>
				</Center>
			);

		return (
			<Center>
				<Text fw={600} size='xl'>
					Type: {data.data.type} is not supported by this widget.
				</Text>
			</Center>
		);
	},
	description: 'Display data that can edited.',
	sources: {
		data: {
			type: 'topic',
			types: ['boolean', 'int', 'float', 'double', 'string'],
			required: true,
			description: 'Data to display and edit',
		},
	},
	options: {},
};
