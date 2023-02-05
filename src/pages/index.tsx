import { Dashboard } from '@/components/Dashboard';
import { useBoardActions } from '@/stores/boardStore';
import { invokeResult } from '@/utils/invokeResult';
import { Button } from '@mantine/core';
import { useEffect } from 'react';
import { useState } from 'react';

const App = () => {
	return (
		<>
			<Dashboard />
		</>
	);
};

export default App;
