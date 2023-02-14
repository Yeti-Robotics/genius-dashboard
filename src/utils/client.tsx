import { SettingsForm } from '@/components/Layout/Menu/SettingsForm';
import { useAllBoards, useBoardActions } from '@/stores/boardStore';
import {
	getSettings,
	useServerAddr,
	useTeamNumber,
} from '@/stores/settingsStore';
import { Button, Stack, Text, TextInput } from '@mantine/core';
import { closeAllModals, openModal } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { invokeResult } from './invokeResult';
import { openSettingsModal } from './modals';
import { Result } from './Result';
import { teamNumberToIP } from './teamNumberToIP';

const IntroModal = () => {
	const boards = useAllBoards();
	const { setBoard, setCurrentBoard } = useBoardActions();
	const [boardName, setBoardName] = useState('');
	const [error, setError] = useState<string | undefined>();
	const teamNumber = useTeamNumber();
	const serverAddr = useServerAddr();

	return (
		<Stack>
			<Text>Name Your First Board</Text>
			<TextInput
				value={boardName}
				onChange={(e) => {
					setBoardName(e.target.value);
				}}
				error={error}
			/>
			<Text>Configure</Text>
			<SettingsForm />
			<Button
				onClick={() => {
					if (boardName === '') return setError('Board name cannot be empty');
					if (boards[boardName]) return setError('Board name must be unique.');
					if (teamNumber === 0 || serverAddr === '') return;
					setBoard(boardName, { name: boardName, settings: {}, widgets: [] });
					setCurrentBoard(boardName);
					closeAllModals();
				}}
			>
				Finish
			</Button>
		</Stack>
	);
};

/**  Starts client if it isn't running, restarts if it is running */
export const startClient = async () => {
	const { teamNumber, serverAddr } = getSettings();

	if (teamNumber === 0 && serverAddr === '') {
		// This is their first time in da program, open up a intro modal to create first board & set up settings
		return openModal({
			title: 'Welcome to Genius Dashboard! 😁',
			children: <IntroModal />,
			withCloseButton: false,
			closeOnClickOutside: false,
			closeOnEscape: false,
			onClose: startClient,
		});
	}

	if (teamNumber <= 0 || serverAddr === '') {
		// One of them are invalid, open the normal settings modal
		return openSettingsModal();
	}

	let result: Result<undefined, string>;
	if (serverAddr === 'real') {
		// They want to connect to a real robot, use their team number
		result = await invokeResult('start_client', {
			addr: teamNumberToIP(teamNumber),
		});
	} else if (serverAddr === 'sim') {
		// Connect to the local server of a simulated robot
		result = await invokeResult('start_client', {
			addr: '127.0.0.1:5810',
		});
	} else {
		// Connect to whatever they put in
		result = await invokeResult('start_client', {
			addr: serverAddr,
		});
	}

	result.match(
		() => {
			notifications.hide('clientError');
		},
		(err) => {
			notifications.show({
				id: 'clientError',
				title: 'An error ocurred 😭',
				message: `Failed to connect to server with error: ${err}. Check your settings.`,
				autoClose: 7000,
			});
		}
	);
};
