import {
	useServerAddr,
	useSettingsActions,
	useTeamNumber,
} from '@/stores/settingsStore';
import { Autocomplete, NumberInput, Stack } from '@mantine/core';

/** Allows editing of global settings */
export const SettingsForm = () => {
	const { setServerAddr, setTeamNumber } = useSettingsActions();
	const teamNumber = useTeamNumber();
	const serverAddr = useServerAddr();

	return (
		<Stack>
			<NumberInput
				label='Team Number'
				value={teamNumber}
				onChange={setTeamNumber}
				min={0}
				max={9999}
			/>
			<Autocomplete
				label='Server Address'
				description='Use a preset or type it out yourself'
				data={[
					{
						value: 'real',
						label: 'Real Robot',
					},
					{ value: 'sim', label: 'Simulated Robot' },
				]}
				value={serverAddr}
				onChange={setServerAddr}
			/>
		</Stack>
	);
};
