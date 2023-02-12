import { Stack } from '@mantine/core';
import { WIDGET_NAME_MAP } from '..';
import { WidgetExample } from './WidgetExample';
import { Board } from '@/stores/boardStore';

type Props = {
	board: Board;
};

export const SelectWidgetModal = ({ board }: Props) => {
	return (
		<Stack>
			{Object.entries({ ...WIDGET_NAME_MAP }).map(([name, widget]) => (
				<WidgetExample name={name} widget={widget} board={board} key={name} />
			))}
		</Stack>
	);
};
