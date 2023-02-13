import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type TopicStore = {
	teamNumber: number;
	serverAddr: string;
	actions: Actions;
};

type Actions = {
	setTeamNumber: (newTeamNumber: number) => void;
	setServerAddr: (newServerAddr: string) => void;
};

const useSettingsStore = create<TopicStore>()(
	persist(
		(set) => ({
			teamNumber: 0,
			serverAddr: '',
			actions: {
				setTeamNumber: (newTeamNumber) => set({ teamNumber: newTeamNumber }),
				setServerAddr: (newServerAddr) => set({ serverAddr: newServerAddr }),
			},
		}),
		{
			name: 'settings',
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				teamNumber: state.teamNumber,
				serverAddr: state.serverAddr,
			}),
			onRehydrateStorage: (state) => {
				console.log('Hydrating with:', state);
				return (state, err) => {
					if (err)
						console.error('Error while hydrating from localStorage:', err);
				};
			},
		}
	)
);

export const useTeamNumber = () =>
	useSettingsStore((state) => state.teamNumber);
export const useServerAddr = () =>
	useSettingsStore((state) => state.serverAddr);
export const useSettingsActions = () =>
	useSettingsStore((state) => state.actions);
