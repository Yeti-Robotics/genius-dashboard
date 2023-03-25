import { Message } from '@/types/Message';
import { MapOrValue } from '@/types/utils';
import { Paper, Table, Text } from '@mantine/core';
import { isMessage } from './assertions';
import { DisplaySimply } from './DisplaySimply';

export const ExtraProps = ({
	data,
	baseKeys,
	maxW,
}: {
	data: MapOrValue<Message>;
	baseKeys: string[];
	maxW?: number;
}) => {
	const extraProps = Object.entries(data)
		.filter(([name, message]) => !baseKeys.includes(name) && isMessage(message))
		.map(([name, message]) => (
			<tr>
				<td>
					<Text fw={600} size='sm'>
						{name}
					</Text>
				</td>
				<td>
					<DisplaySimply
						maxW={maxW ?? 100}
						textSize='sm'
						message={message as Message}
					/>
				</td>
			</tr>
		));

	return (
		<>
			{extraProps.length > 0 && (
				<Paper withBorder>
					<Table striped highlightOnHover>
						<thead>
							<tr>
								<th>Name</th>
								<th>Value</th>
							</tr>
						</thead>
						<tbody>{extraProps}</tbody>
					</Table>
				</Paper>
			)}
		</>
	);
};
