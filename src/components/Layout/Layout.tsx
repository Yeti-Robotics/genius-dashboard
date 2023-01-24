import { Stack } from '@mantine/core';
import { ReactNode } from 'react';
import { Header } from './Header';
import { useDisclosure } from '@mantine/hooks';
type Props = {
	children: ReactNode;
};

export const Layout = ({ children }: Props) => {
	const [opened, { close, toggle }] = useDisclosure(false);

	return (
		<Stack h='100vh' spacing={0}>
			<Header opened={opened} toggle={toggle} close={close} />
			<Stack sx={{ flexGrow: 1 }} p='md'>{children}</Stack>
		</Stack>
	);
};
