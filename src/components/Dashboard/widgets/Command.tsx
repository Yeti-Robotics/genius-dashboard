import { isCommand, isMessage } from '../assertions';
import { Button, Center, Paper, Stack, Text } from '@mantine/core';
import { WidgetComponent } from '..';
import { usePublishValue } from '@/stores/topicsStore';
import { useEffect, useState } from 'react';
import { Command as CommandMessage } from '@/types/Message';

const baseKeys: string[] = [
	'.controllable',
	'.isParented',
	'.name',
	'.type',
	'interruptBehavior',
	'running',
	'runsWhenDisabled',
];

export const Command: WidgetComponent<{
	command: { type: 'command'; description: string; required: true };
}> = {
	Component: ({ data, options, sources }) => {
		const [updatingRunning, setUpdatingRunning] = useState(false);
		const publishRunning = usePublishValue(sources.command + '/running');
		const isExample = 'example' in options;

		useEffect(() => {
			// If running changes, set updating to false
			setUpdatingRunning(false);
		}, [(data.command as CommandMessage)?.running?.data]);

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

		const isRunning = data.command.running.data;
		const controllable = data.command['.controllable'].data;

		const extraProps = Object.entries(data.command)
			.filter(([name]) => !baseKeys.includes(name))
			.map(([name, message]) => {
				// TODO: this
			});

		return (
			<Stack>
				{controllable && (
					<Button
						loading={updatingRunning}
						onClick={() => {
							setUpdatingRunning(true);
							publishRunning(!isRunning);
						}}
					>
						{isRunning ? 'Unschedule' : 'Schedule'}
					</Button>
				)}
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
