import { isCamera, isCommand, isMessage } from '../assertions';
import { Center, Paper, Stack, Text } from '@mantine/core';
import { WidgetComponent } from '..';

export const Command: WidgetComponent<
	{
		command: { type: 'command'; description: string; required: true };
	}
> = {
	Component: ({ data, options }) => {
		const isExample = 'example' in options;

		if (isExample)
			return (
				<Center>
					<Paper withBorder>Command would be here.</Paper>
				</Center>
			);

		if (!data.command)
			return (
				<Center>
					<Text>Waiting on data...</Text>
				</Center>
			);

		if (!isCommand(data.command, isMessage))
			return (
				<Center>
					<Text>Topic must follow structure of a command publisher</Text>
				</Center>
			);

		return (
			<Stack>
				<div></div>
			</Stack>
		);
	},
	description: 'Show a command.',
	sources: {
		command: {
			type: 'command',
			required: true,
			description: 'Command to display',
		},
	},
	options: {},
};
