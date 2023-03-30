import { isMessage, isSmartDashboardChooser, isTopic } from '../assertions';
import { Center, Select, Stack, Text } from '@mantine/core';
import { WidgetComponent } from '..';
import { publishValue } from '@/utils/topicUtils';
import { useTopic } from '@/stores/topicsStore';
import { Message } from '@/types/Message';
import { useTauriEvent } from '@/utils/tauriHooks';
import { useRef } from 'react';
import { notifications } from '@mantine/notifications';

export const SmartDashboardChooser: WidgetComponent<{
	chooser: {
		type: 'smartDashboardChooser';
		description: string;
		required: true;
	};
}> = {
	Component: ({ data, sources, options }) => {
		const chooserTopicDefinition = useTopic(sources);
		const isExample = 'example' in options;
		const lastValueRef = useRef<string | null>(null);

		const setValueToLast = () => {
			void (
				lastValueRef.current &&
				publishValue({
					topic: sources.chooser + '/selected',
					topicType: 'string',
					value: lastValueRef.current,
				})
			);
		};

		useTauriEvent('reconnect', setValueToLast);
		useTauriEvent('connect', setValueToLast);

		if (!isExample && !chooserTopicDefinition.chooser)
			return (
				<Center>
					<Text>The topic {sources.chooser} is not defined</Text>
				</Center>
			);

		if (
			!isExample &&
			(!isSmartDashboardChooser(chooserTopicDefinition.chooser, isTopic) ||
				isMessage(data.chooser))
		)
			return (
				<Center>
					<Text>
						Topic must follow the structure of a smartDashboardChooser
					</Text>
				</Center>
			);

		if (!data.chooser && !isMessage(data.chooser))
			return (
				<Center>
					<Text>Waiting on data...</Text>
				</Center>
			);

		if (!isSmartDashboardChooser(data.chooser, isMessage))
			return (
				<Stack align='center' spacing={0}>
					<Select
						value={
							((data.chooser as Record<string, Message>).active
								?.data as string) ||
							((data.chooser as Record<string, Message>).selected
								?.data as string) ||
							((data.chooser as Record<string, Message>).default
								?.data as string) ||
							null
						}
						data={[]}
						label={
							(data.chooser as Record<string, Message>)['.name']?.data as string
						}
						onChange={async (value) => {
							if (value === null) return;
							if (!isSmartDashboardChooser(data.chooser, isMessage)) return;
						}}
						disabled
						withinPortal
					/>
					<Text>Incomplete chooser topic</Text>
				</Stack>
			);

		return (
			<Center>
				<Select
					searchable
					value={
						data.chooser.active?.data || data.chooser.default?.data || null
					}
					data={data.chooser.options?.data ?? []}
					label={data.chooser['.name']?.data}
					onChange={async (value) => {
						if (value === null) return;
						if (!isSmartDashboardChooser(data.chooser, isMessage)) return;
						lastValueRef.current = value;
						const result = await publishValue({
							topic: sources.chooser + '/selected',
							topicType: data.chooser.active.type,
							value,
						});
						result.onErr((err) => {
							notifications.show({
								title: `Error updating value`,
								message: err,
							});
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
