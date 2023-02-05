import { MapOrValue } from '@/types/utils';
import { Accordion, Button, Group, Stack, Text, UnstyledButton } from '@mantine/core';
import { isTopic } from '../Dashboard/assertions';

type Props<T> = {
	tree: Record<string, MapOrValue<T>>;
	onSelect: (data: MapOrValue<T>, trail: string[]) => void;
	/** Selected item and trail of keys used to reach this item */
	selectable: (subject: MapOrValue<T>) => boolean;
	hasChildren: (sub: MapOrValue<T>) => sub is Record<string, MapOrValue<T>>;
	/** Return true if it should be shown */
	filter?: (sub: MapOrValue<T>) => boolean;
};

const createBranch = <T extends unknown>(
	key: string,
	value: MapOrValue<T>,
	props: Props<T>,
	nesting = 0,
	trail: string[] = [],
) => {
	if (props.hasChildren(value) && props.filter?.(value)) {
		return (
			<Accordion.Item sx={{ border: '0' }} ml={nesting * 16} value={key} key={key}>
				<Accordion.Control
					sx={(theme) => ({ border: `1px solid ${theme.colors[theme.primaryColor][5]}` })}
				>
					<Group position='apart'>
						{key}
						{props.selectable(value) && (
							<Button
								onClick={(e) => {
									e.stopPropagation();
									props.onSelect(value, trail);
								}}
							>
								Use
							</Button>
						)}
					</Group>
				</Accordion.Control>
				<Accordion.Panel>
					<Accordion multiple styles={{ content: { padding: 0 } }}>
						{Object.entries(value).map(([childKey, childValue]) =>
							createBranch(childKey, childValue, props, nesting + 1, [...trail, key])
						)}
					</Accordion>
				</Accordion.Panel>
			</Accordion.Item>
		);
	} else {
		return (
			<Accordion.Item py='md' sx={{ border: 0 }} ml={nesting * 16} value={key} key={key}>
				<Group grow>
					<Stack spacing='xs'>
						<Text fw={600}>Name: {key}</Text>
						<Text fw={600}>Type: {isTopic(value) ? value.type : 'Unknown'}</Text>
					</Stack>
					{props.selectable(value) && (
						<Button onClick={() => props.onSelect(value, [...trail, key])}>Use</Button>
					)}
				</Group>
			</Accordion.Item>
		);
	}
};

export const Tree = <T extends unknown>(props: Props<T>) => {
	return (
		<Accordion multiple styles={{ content: { padding: 0 } }}>
			{Object.entries(props.tree).map(([key, value]) => createBranch(key, value, props))}
		</Accordion>
	);
};
