import { useAnnouncedTopics, useTopicData } from '@/stores/topicsStore';
import { isSmartDashboardChooser, isMessage, isTopic } from '../assertions';
import { MapOrValue } from '@/types/utils';
import { Group } from '@mantine/core';
import { WIDGET_NAME_MAP } from '..';
import { WidgetExample } from './WidgetExample';
import { Board } from '@/stores/boardStore';

type Props = {
	board: Board;
};

export const SelectWidgetModal = ({ board }: Props) => {
	return (
		<Group>
			{Object.entries({ ...WIDGET_NAME_MAP }).map(([name, widget]) => (
				<WidgetExample name={name} widget={widget} board={board} key={name} />
			))}
		</Group>
	);
};
