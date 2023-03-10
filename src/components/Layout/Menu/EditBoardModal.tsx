import { useAllBoards, useBoardActions } from '@/stores/boardStore';
import { Button, Stack, TextInput } from '@mantine/core';
import { useValidatedState } from '@mantine/hooks';

type Props = {
	boardName: string;
};

export const EditBoardModal = ({ boardName }: Props) => {
	const boards = useAllBoards();
	const validateName = (newName: string) =>
		// valid if is the og name or if not an empty string and doesn't already exist
		newName === boardName || (newName !== '' && !boards[newName]);
	const [
		{ value: name, lastValidValue: lastValidName, valid: nameIsValid },
		setName,
	] = useValidatedState(boardName, validateName);
	const { renameBoard } = useBoardActions();

	return (
		<Stack>
			<TextInput
				value={name}
				label='Board Name'
				onChange={(e) => {
					setName(e.target.value);
					validateName(e.target.value) &&
						renameBoard(lastValidName, e.target.value);
				}}
				error={!nameIsValid && 'Name must be unique to all boards'}
			/>
			<Button
				onClick={() => {
					setName(boardName);
					renameBoard(lastValidName, boardName);
				}}
			>
				Reset To Original
			</Button>
		</Stack>
	);
};
