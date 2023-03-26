import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { WIDGET_NAME_MAP } from '@/components/Dashboard';
import { shallow } from 'zustand/shallow';
import { migrateBoardStore } from './migrations';

export type Widget = {
	x: number;
	y: number;
	width: number;
	height: number;
	name: string;
	locked: boolean;
	sources: Record<string, string>;
	options: Record<string, any>;
	state: Record<string, string>;
	autoSize: boolean;
	lockSize: boolean;
	display: keyof typeof WIDGET_NAME_MAP;
};

export type Board = {
	name: string;
	widgets: Widget[];
	settings: object;
};

export type BoardStore = {
	boards: Record<string, Board>;
	currentBoard: string;
	_hasHydrated: boolean;
	actions: Actions;
};

type Actions = {
	setCurrentBoard: (name: string) => void;
	setBoard: (name: string, newBoard: Partial<Board>) => void;
	renameBoard: (oldName: string, newName: string) => void;
	removeBoard: (name: string) => void;
	/** Adds new widget, replacing widget with `widgetName` */
	addWidget: (boardName: string, widgetName: string, newWidget: Widget) => void;
	/** Updates widget with the new properties */
	setWidget: (
		boardName: string,
		widgetName: string,
		newWidget: Partial<Widget>
	) => void;
	removeWidget: (boardName: string, widgetName: string) => void;
	/** Call when dragging ends */
	onDragEnd: (
		boardName: string,
		widgetName: string,
		newPos: { x: number; y: number }
	) => void;
	setHasHydrated: (newHydrated: boolean) => void;
	moveWidgetToFront: (boardName: string, widgetName: string) => void;
};

const moveWidgetToFront = (
	widgetName: string,
	currentWidgets: Widget[]
): Widget[] => {
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
			_hasHydrated: false,
			actions: {
				setCurrentBoard: (name: string) => set({ currentBoard: name }),
				setBoard: (name: string, newBoard: Partial<Board>) =>
					set(({ boards }) => ({
						boards: { ...boards, [name]: { ...boards[name], ...newBoard } },
					})),
				renameBoard: (oldName, newName) =>
					set((state) => {
						return {
							// If renaming current board, set current board to the new name
							currentBoard:
								oldName === state.currentBoard ? newName : state.currentBoard,
							boards: {
								// Make new boards object, filtering out the target
								...Object.fromEntries(
									Object.entries(state.boards).filter(
										([name]) => name !== oldName
									)
								),
								// Add the new name using the old name's values
								[newName]: { ...state.boards[oldName], name: newName },
							},
						};
					}),
				removeBoard: (removeName) =>
					set(({ boards }) => ({
						boards: Object.fromEntries(
							Object.entries(boards).filter(([name]) => name !== removeName)
						),
					})),
				moveWidgetToFront: (boardName, widgetName) =>
					set(({ boards }) => ({
						boards: {
							...boards,
							[boardName]: {
								...boards[boardName],
								widgets: moveWidgetToFront(
									widgetName,
									boards[boardName].widgets
								),
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
				setWidget: (boardName, widgetName, newProps) =>
					set(({ boards }) => ({
						boards: {
							...boards,
							[boardName]: {
								...boards[boardName],
								widgets: boards[boardName].widgets.map((w) =>
									w.name === widgetName ? { ...w, ...newProps } : w
								),
							},
						},
					})),
				removeWidget: (boardName, widgetName) =>
					set(({ boards }) => ({
						boards: {
							...boards,
							[boardName]: {
								...boards[boardName],
								widgets: boards[boardName].widgets.filter(
									(w) => w.name !== widgetName
								),
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
			partialize: (state) => ({
				boards: state.boards,
				currentBoard: state.currentBoard,
			}),
			migrate: (store, version) => migrateBoardStore(store, version) as BoardStore,
			version: 1,
			onRehydrateStorage: (state) => {
				console.log('Hydrating with:', state);
				return (state, err) => {
					state?.actions.setHasHydrated(true);
					if (err)
						console.error('Error while hydrating from localStorage:', err);
				};
			},
		}
	)
);

export const useBoardActions = () => useBoardStore(({ actions }) => actions);

export const useBoard = (name: string) =>
	useBoardStore(({ boards }) => boards[name], shallow);

export const useAllBoards = () => useBoardStore(({ boards }) => boards);

export const useCurrentBoard = () =>
	useBoardStore(({ boards, currentBoard }) => boards[currentBoard], shallow);

export const useCurrentBoardName = () =>
	useBoardStore(({ currentBoard }) => currentBoard);

export const useBoardsHydrated = () =>
	useBoardStore((state) => state._hasHydrated);

export const useWidget = (boardName: string, widgetName: string) =>
	useBoardStore((state) =>
		state.boards[boardName]?.widgets.find((w) => w.name === widgetName)
	);

/** For use outside of react code only, be careful */
export const getBoardStore = () => useBoardStore.getState();
