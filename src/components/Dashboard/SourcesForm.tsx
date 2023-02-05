import { useAnnouncedTopics } from '@/stores/topicsStore';
import { Topic } from '@/types/Topic';
import { MapOrValue } from '@/types/utils';
import { Button, Card, Collapse, Group, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { closeModal, openModal } from '@mantine/modals';
import { createContext, Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Source } from '.';
import { Tree } from '../Tree';
import { isSmartDashboardChooser, isTopic } from './assertions';

type Props = {
	sourcesDefinitions: Record<string, Source>;
	sources: Record<string, string>;
	setSources: Dispatch<SetStateAction<Record<string, string>>>;
};
const SusContext = createContext<Record<string, string>>({});

const SelectSource = ({
	name,
	sourcesDefinitions,
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
						{name} {sourceDef.required && <Text display='inline' color='red'>*</Text>}
					</Text>
					<Text>{sourceDef.description}</Text>
					{sources[name] !== undefined && (
						<Stack spacing={0} mt='md'>
							<Text size='xl' fw={600}>
								Selected Source:
							</Text>
							<Text>{sources[name]}</Text>
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
						console.log(trail);
						if (sourceDef.type === 'topic') {
							if (isTopic(selectable, sourceDef.types)) {
								console.log('set sorces');
								setSources((prev) => ({ ...prev, [name]: selectable.name }));
							}
						} else if (sourceDef.type === 'smartDashboardChooser') {
							if (isSmartDashboardChooser(selectable, isTopic))
								setSources((prev) => ({ ...prev, [name]: trail.join('/') }));
						}

						// Success close this tree
						close();
					}}
					selectable={(sub) => {
						if (sourceDef.type === 'topic') {
							return isTopic(sub);
						} else if (sourceDef.type === 'smartDashboardChooser') {
							return isSmartDashboardChooser(sub, isTopic);
						} else return true;
					}}
					filter={(sub) => {
						if (sourceDef.type === 'topic') {
							if (isTopic(sub)) return sourceDef.types.includes(sub.type);
							else return true;
						} else if (sourceDef.type === 'smartDashboardChooser') {
							return (!isTopic(sub) && isSmartDashboardChooser(sub, isTopic)) || true;
						} else return true;
					}}
				/>
			</Collapse>
		</Stack>
	);
};

export const SourcesForm = (props: Props) => {
	const [openedTree, setOpenedTree] = useState<string | undefined>();

	return (
		<Stack>
			{Object.entries(props.sourcesDefinitions).map(([sourceName, sourceDef]) => {
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
			})}
		</Stack>
	);
};
