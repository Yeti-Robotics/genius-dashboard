import { useAnnouncedTopics } from '@/stores/topicsStore';
import { Topic } from '@/types/Topic';
import { MapOrValue } from '@/types/utils';
import { Button, Card, Collapse, Stack, Text } from '@mantine/core';
import { Dispatch, memo, SetStateAction, useState } from 'react';
import { Source } from '.';
import { Tree } from '../Tree';
import {
	isButtonHelper,
	isCamera,
	isCommand,
	isSmartDashboardChooser,
	isSubsystem,
	isTopic,
} from './assertions';

type Props = {
	sourcesDefinitions: Record<string, Source>;
	sources: Record<string, string>;
	setSources: Dispatch<SetStateAction<Record<string, string>>>;
};

const SelectSource = ({
	name,
	sources,
	sourceDef,
	setSources,
	openedTree,
	setOpenedTree,
}: Props & {
	name: string;
	sourceDef: Source;
	openedTree: string | undefined;
	setOpenedTree: Dispatch<SetStateAction<string | undefined>>;
}) => {
	const [selected, setSelected] = useState<string | undefined>(sources[name]);
	const opened = openedTree === name;
	const open = () => setOpenedTree(name);
	const close = () => setOpenedTree(undefined);
	const toggle = () => (opened ? close() : open());

	const topics = useAnnouncedTopics();

	if (isTopic(topics)) throw new Error('How?!?!?');

	return (
		<Stack>
			<Card withBorder>
				<Stack spacing={0}>
					<Text inline size={24} fw={600}>
						{name}{' '}
						{sourceDef.required && (
							<Text display='inline' color='red'>
								*
							</Text>
						)}
					</Text>
					<Text>{sourceDef.description}</Text>
					{selected !== undefined && (
						<Stack spacing={0} mt='md'>
							<Text size='xl' fw={600}>
								Selected Source:
							</Text>
							<Text>{selected}</Text>
						</Stack>
					)}
					<Button mt='md' onClick={() => toggle()}>
						{!opened ? 'Select Source' : 'Stop Selecting'}
					</Button>
				</Stack>
			</Card>
			<Collapse in={opened}>
				<Tree
					tree={topics}
					hasChildren={((sub: MapOrValue<Topic>) => !isTopic(sub)) as any}
					onSelect={(selectable, trail) => {
						const topic = `/${trail.join('/')}`;
						setSources((prev) => ({
							...prev,
							[name]: `/${trail.join('/')}`,
						}));
						setSelected(topic);

						// Success close this tree
						close();
					}}
					selectable={(sub) => {
						if (sourceDef.type === 'topic') {
							return true;
						} else if (sourceDef.type === 'smartDashboardChooser') {
							return isSmartDashboardChooser(sub, isTopic);
						} else if (sourceDef.type === 'camera') {
							return isCamera(sub, isTopic);
						} else if (sourceDef.type === 'command') {
							return isCommand(sub, isTopic);
						} else if (sourceDef.type === 'controller') {
							return isButtonHelper(sub, isTopic);
						} else if (sourceDef.type === 'subsystem') {
							return isSubsystem(sub, isTopic);
						} else return true;
					}}
					filter={(sub) => {
						if (sourceDef.type === 'topic') {
							if (isTopic(sub)) return sourceDef.types.includes(sub.type);
							else return true;
						} else if (sourceDef.type === 'smartDashboardChooser') {
							return (
								(!isTopic(sub) && isSmartDashboardChooser(sub, isTopic)) || true
							);
						} else if (sourceDef.type === 'camera') {
							return (!isTopic(sub) && isCamera(sub, isTopic)) || true;
						} else if (sourceDef.type === 'command') {
							return (!isTopic(sub) && isCommand(sub, isTopic)) || true;
						} else if (sourceDef.type === 'controller') {
							return (!isTopic(sub) && isButtonHelper(sub, isTopic)) || true;
						} else if (sourceDef.type === 'subsystem') {
							return (!isTopic(sub) && isSubsystem(sub, isTopic)) || true;
						} else return true;
					}}
				/>
			</Collapse>
		</Stack>
	);
};

export const SourcesForm = memo((props: Props) => {
	const [openedTree, setOpenedTree] = useState<string | undefined>();

	return (
		<Stack>
			{Object.entries(props.sourcesDefinitions).map(
				([sourceName, sourceDef]) => {
					return (
						<SelectSource
							{...props}
							openedTree={openedTree}
							setOpenedTree={setOpenedTree}
							name={sourceName}
							sourceDef={sourceDef}
							key={sourceName}
						/>
					);
				}
			)}
		</Stack>
	);
});
