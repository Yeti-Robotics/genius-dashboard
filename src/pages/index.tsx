import { Dashboard } from '@/components/Dashboard';
import { useBoardActions } from '@/stores/boardStore';
import { invokeResult } from '@/utils/invokeResult';
import { Button } from '@mantine/core';
import { useEffect } from 'react';
import { useState } from 'react';

const App = () => {
	const [teamNumber, setTeamNumber] = useState('');
	const { setBoard, setCurrentBoard } = useBoardActions();

	const startClient = async () => {
		await invokeResult('start_client', {
			addr: process.env.NODE_ENV === 'development' ? '127.0.0.1:5810' : '10.35.6.2:5810',
		});
	};

	useEffect(() => {
		startClient();
		setBoard('My Board', {
			name: 'My Board',
			settings: {},
			widgets: [
				{
					display: 'simple',
					height: 100,
					width: 100,
					x: 100,
					y: 100,
					name: 'RGB Green Value',
					topic: '/SmartDashboard/g',
				},
				{
					display: 'simple',
					height: 100,
					width: 100,
					x: 200,
					y: 200,
					name: 'RGB Red Value',
					topic: '/SmartDashboard/r',
				},
			],
		});
		setCurrentBoard('My Board');
	});

	return (
		<>
			<Dashboard />
		</>
	);
};

export default App;
