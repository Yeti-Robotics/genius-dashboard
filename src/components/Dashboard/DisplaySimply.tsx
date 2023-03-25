import { Message } from '@/types/Message';
import { Center, MantineNumberSize, Text } from '@mantine/core';

export const DisplaySimply = ({
	message,
	maxW,
	textSize,
}: {
	message: Message;
	maxW?: number;
	textSize?: MantineNumberSize;
}) => {
	if (message.type.includes('double') || message.type.includes('float'))
		return (
			<Center maw={maxW} sx={{ overflowX: 'auto' }}>
				<Text fw={600} size={textSize ?? 'xl'}>
					{!message.type.includes('[]')
						? (message.data as number).toFixed(2)
						: JSON.stringify(
								(message.data as number[]).map((n) => n.toFixed(2))
						  )}
				</Text>
			</Center>
		);

	return (
		<Center maw={maxW} sx={{ overflowX: 'auto' }}>
			<Text fw={600} size={textSize ?? 'xl'}>
				{message.type !== 'raw'
					? JSON.stringify(message.data)
					: "Raw data can't be displayed"}
			</Text>
		</Center>
	);
};
