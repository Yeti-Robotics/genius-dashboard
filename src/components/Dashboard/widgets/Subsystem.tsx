import { isSubsystem, isMessage } from '../assertions';
import { Center, Text } from '@mantine/core';
import { WidgetComponent } from '..';
import { ExtraProps } from '../ExtraProps';

export const Subsystem: WidgetComponent<{
	subsystem: {
		type: 'subsystem';
		description: string;
		required: true;
	};
}> = {
	Component: ({ data, options }) => {
		const isExample = 'example' in options;

		if (!data.subsystem)
			return (
				<Center>
					<Text>Waiting on data...</Text>
				</Center>
			);

		if (!isSubsystem(data.subsystem, isMessage))
			return (
				<Center>
					<Text>Topic must match the structure of a subsystem.</Text>
				</Center>
			);

		return (
			<Center>
				<ExtraProps
					data={data.subsystem}
					baseKeys={[
						'.name',
						'.type',
						'.hasDefault',
						'.default',
						'.hasCommand',
						'.command',
						'.controllable'
					]}
				/>
			</Center>
		);
	},
	description: 'Show a command.',
	sources: {
		subsystem: {
			type: 'subsystem',
			required: true,
			description: 'Subsystem to display',
		},
	},
	options: {},
};
