import { Message } from '@/types/Message';
import { MapOrValue } from '@/types/utils';
import { isMessage } from '../assertions';
import { Center, Text } from '@mantine/core';

type Props = {
	data: MapOrValue<Message> | undefined;
};

export const SimpleDisplay = ({ data }: Props) => {
	if (!data)
		return (
			<Center>
				<Text>Waiting on data...</Text>
			</Center>
		);
		
	if (!isMessage(data))
		return (
			<Center>
				<Text>Topic must be standalone (not a chooser, etc.)</Text>
			</Center>
		);

	return (
		<Center>
			<Text fw={600} size='xl'>
				{data.type !== 'raw' ? JSON.stringify(data.data) : "Raw data can't be displayed"}
			</Text>
		</Center>
	);
};
