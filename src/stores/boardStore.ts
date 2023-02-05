import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { WIDGET_NAME_MAP } from '@/components/Dashboard';

export type Widget = {
	x: number;
	y: number;
	width: number;
	height: number;
	name: string;
	sources: Record<string, string>;
	options: Record<string, any>;
	display: keyof typeof WIDGET_NAME_MAP;
};

export type Board = {
	name: string;
	widgets: Widget[];
	settings: object;
};

type BoardStore = {
	boards: Record<string, Board>;
	currentBoard: string;
	_hasHydrated: boolean;
	actions: Actions;
};

type Actions = {
	setCurrentBoard: (name: string) => void;
	setBoard: (name: string, newBoard: Partial<Board>) => void;
	/** Adds new widget, replacing widget with `widgetName` */
	addWidget: (boardName: string, widgetName: string, newWidget: Widget) => void;
	/** Moves the dragging widget to the start of widgets array */
	onDragStart: (boardName: string, widgetName: string) => void;
	/** Call when dragging ends */
	onDragEnd: (boardName: string, widgetName: string, newPos: { x: number; y: number }) => void;
	setHasHydrated: (newHydrated: boolean) => void;
};

const moveWidgetToFront = (widgetName: string, currentWidgets: Widget[]): Widget[] => {
	const widgetIndex = currentWidgets.findIndex((w) => w.name === widgetName);
	if (widgetIndex <= 0) return currentWidgets;
	// Put the item at widget index at the front of new array
	return [currentWidgets.splice(widgetIndex, 1)[0], ...currentWidgets];
};

const useBoardStore = create<BoardStore>()(
	persist(
		(set) => ({
			boards: {},
			currentBoard: '',
			_hasHydrated: false as boolean,
			actions: {
				setCurrentBoard: (name: string) => set({ currentBoard: name }),
				setBoard: (name: string, newBoard: Partial<Board>) =>
					set(({ boards }) => ({
						boards: { ...boards, [name]: { ...boards[name], ...newBoard } },
					})),
				onDragStart: (boardName, widgetName) =>
					set(({ boards }) => ({
						boards: {
							...boards,
							[boardName]: {
								...boards[boardName],
								widgets: moveWidgetToFront(widgetName, boards[boardName].widgets),
							},
						},
					})),
				onDragEnd: (boardName, widgetName, { x, y }) =>
					set(({ boards }) => ({
						boards: {
							...boards,
							[boardName]: {
								...boards[boardName],
								widgets: boards[boardName].widgets.map((w) =>
									w.name === widgetName ? { ...w, x, y } : w
								),
							},
						},
					})),
				addWidget: (boardName, widgetName, newWidget) =>
					set(({ boards }) => ({
						boards: {
							...boards,
							[boardName]: {
								...boards[boardName],
								widgets: [
									newWidget,
									...boards[boardName].widgets.filter(
										(w) => w.name !== widgetName
									),
								],
							},
						},
					})),
				setHasHydrated: (newHasHydrated) =>
					set({
						_hasHydrated: newHasHydrated,
					}),
			},
		}),
		{
			name: 'boards',
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({ boards: state.boards, currentBoard: state.currentBoard }),
			onRehydrateStorage: () => (state, err) => {
				console.log('hydration', state, err);
				state?.actions.setHasHydrated(true);
				console.log(state?._hasHydrated);
			},
		}
	)
);

export const useBoardActions = () => useBoardStore(({ actions }) => actions);

export const useBoard = (name: string) => useBoardStore(({ boards }) => boards[name]);

export const useAllBoards = () => useBoardStore(({ boards }) => boards);

export const useCurrentBoard = () =>
	useBoardStore(({ boards, currentBoard }) => boards[currentBoard]);

export const useCurrentBoardName = () => useBoardStore(({ currentBoard }) => currentBoard);

export const useBoardsHydrated = () => useBoardStore((state) => state._hasHydrated);
