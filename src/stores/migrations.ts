import { WIDGET_NAME_MAP } from '@/components/Dashboard';
import { BoardStore } from './boardStore';

type OmitNonPersisted<T> = Omit<T, '_hasHydrated' | 'actions'>;

export const migrateBoardStore = (current: unknown, version: number): any => {
	if (version === 0) current = migrateBoardFromV0ToV1(current as V0BoardStore);
	return current;
};

export type V0Widget = {
	x: number;
	y: number;
	width: number;
	height: number;
	name: string;
	locked: boolean;
	sources: Record<string, string>;
	options: Record<string, any>;
	display: keyof typeof WIDGET_NAME_MAP;
};

export type V0Board = {
	name: string;
	widgets: V0Widget[];
	settings: object;
};

export type V0BoardStore = {
	boards: Record<string, V0Board>;
	currentBoard: string;
};

export const migrateBoardFromV0ToV1 = (store: V0BoardStore): OmitNonPersisted<BoardStore> => {
	const newStore: OmitNonPersisted<BoardStore> = {
		boards: Object.fromEntries(
			Object.entries(store.boards).map(([boardName, board]) => [
				boardName,
				{
					...board,
					widgets: board.widgets.map((widget) => ({
						...widget,
						state: {},
						autoSize: true,
						lockSize: true,
					})),
				},
			])
		),
		currentBoard: store.currentBoard,
	};

	return newStore;
};
