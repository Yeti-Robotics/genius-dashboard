import {
	Board,
	useBoard,
	useBoardActions,
	useCurrentBoard,
	useWidget,
	Widget,
} from '@/stores/boardStore';
import { Button, Center, Stack, Text, TextInput, Title } from '@mantine/core';
import { useValidatedState } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Option, Source, WidgetComponent, WIDGET_NAME_MAP } from '.';
import { OptionsForm } from './OptionsForm';
import { SourcesForm } from './SourcesForm';

type Props = {
	widgetName: string;
	boardName: string;
	component: WidgetComponent<Record<string, Source>, Record<string, Option>>;
};

export const EditWidgetModal = ({
	widgetName,
	boardName,
	component,
}: Props) => {
	const board = useBoard(boardName);
	const validateName = (newName: string) =>
		newName === widgetName ||
		// Invalid if empty
		(newName !== '' &&
			// Invalid if any widget has the same name
			!board.widgets.some((w) => newName === w.name));
	const [
		{ value: name, lastValidValue: lastValidName, valid: nameIsValid },
		setName,
	] = useValidatedState(widgetName, validateName);
	const widget = useWidget(board.name, lastValidName);
	const { control, register } = useForm({
		defaultValues: widget?.options ?? {},
	});
	const { setWidget } = useBoardActions();

	if (!widget)
		return (
			<Center>
				<Text>
					Widget with name: {name} doesn't exist on board: {boardName}
				</Text>
			</Center>
		);

	return (
		<Stack>
			<TextInput
				value={name}
				label='Widget Name'
				onChange={(e) => {
					setName(e.target.value);
					validateName(e.target.value) &&
						setWidget(board.name, lastValidName, { name: e.target.value });
				}}
				error={!nameIsValid && 'Name must be unique to this board'}
			/>
			<Button
				onClick={() => {
					setName(widgetName);
					setWidget(board.name, lastValidName, { name: widgetName });
				}}
			>
				Reset To Original
			</Button>
			{Object.keys(widget.options).length > 0 && (
				<>
					<Title order={1}>Options</Title>
					<OptionsForm
						control={control}
						register={register}
						optionsDefinition={component.options}
					/>
				</>
			)}
			{Object.keys(widget.sources).length > 0 && (
				<>
					<Title order={1}>Sources</Title>
					<SourcesForm
						sources={widget.sources}
						setSources={(setStateAction) => {
							if (typeof setStateAction === 'function') {
								setWidget(board.name, widget.name, {
									sources: setStateAction(widget.sources),
								});
							} else {
								setWidget(board.name, widget.name, {
									sources: setStateAction,
								});
							}
						}}
						sourcesDefinitions={WIDGET_NAME_MAP[widget.display].sources}
					/>
				</>
			)}
		</Stack>
	);
};
