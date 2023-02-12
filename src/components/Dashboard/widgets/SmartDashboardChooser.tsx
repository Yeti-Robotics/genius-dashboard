import { isMessage, isSmartDashboardChooser, isTopic } from '../assertions';
import { Center, Select, Text } from '@mantine/core';
import { WidgetComponent } from '..';
import { publishValue } from '@/utils/topicUtils';
import { useTopic } from '@/stores/topicsStore';

export const SmartDashboardChooser: WidgetComponent<{
	chooser: { type: 'smartDashboardChooser'; description: string; required: true };
}> = {
	Component: ({ data, sources, options }) => {
		const chooserTopicDefinition = useTopic(sources);
		const isExample = 'example' in options;

		if (!isExample && !chooserTopicDefinition.chooser)
			return (
				<Center>
					<Text>The topic {sources.chooser} is not defined</Text>
				</Center>
			);

		if (!isExample && !isSmartDashboardChooser(chooserTopicDefinition.chooser, isTopic))
			return (
				<Center>
					<Text>Topic must follow the structure of a smartDashboardChooser</Text>
				</Center>
			);

		if (!data.chooser || !isSmartDashboardChooser(data.chooser, isMessage))
			return (
				<Center>
					<Text>Waiting on data...</Text>
				</Center>
			);

		return (
			<Center>
				<Select
					value={data.chooser.active.data || data.chooser.default.data || null}
					data={data.chooser.options.data}
					label={data.chooser['.name'].data}
					onChange={async (value) => {
						if (value === null) return;
						if (!isSmartDashboardChooser(data.chooser, isMessage)) return;
						await publishValue({
							topic: sources.chooser + '/selected',
							topicType: data.chooser.active.type,
							value,
						});
					}}
					disabled={!data.chooser['.controllable'].data}
					withinPortal
				/>
			</Center>
		);
	},
	description: 'Display a chooser.',
	sources: {
		chooser: {
			type: 'smartDashboardChooser',
			required: true,
			description: 'Chooser to display.',
		},
	},
	options: {},
};
