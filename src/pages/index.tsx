import { invokeResult } from '@/utils/invokeResult';
import { Button, Stack, TextInput } from '@mantine/core';
import { useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import { Message } from '@/types/Message';

listen<Message>('message', ({ payload }) => {
	console.log(payload);
});

const App = () => {
	const [teamNumber, setTeamNumber] = useState('');

	const startClient = async () => {
		const result = await invokeResult('start_client', {
			addr: process.env.NODE_ENV === 'development' ? '127.0.0.1:5810' : '10.35.6.2:5810',
		});
	};

	return (
		<div>
			<Stack>
				<TextInput value={teamNumber} onChange={(e) => setTeamNumber(e.target.value)} />
				<Button onClick={startClient}>Create client</Button>
			</Stack>
		</div>
	);
};

export default App;
