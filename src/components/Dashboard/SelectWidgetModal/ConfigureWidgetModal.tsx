import { Button, Stack, Text, TextInput, Title } from '@mantine/core';
import { WIDGET_NAME_MAP } from '..';
import { useState } from 'react';
import { OptionsForm } from '../OptionsForm';
import { useForm } from 'react-hook-form';
import { SourcesForm } from '../SourcesForm';
import { closeAllModals } from '@mantine/modals';
import { Board, useBoardActions } from '@/stores/boardStore';

type Props<K extends keyof typeof WIDGET_NAME_MAP> = {
	name: K;
	widget: typeof WIDGET_NAME_MAP[K];
	board: Board;
};

export const ConfigureWidgetModal = <K extends keyof typeof WIDGET_NAME_MAP>({
	name,
	widget,
	board,
}: Props<K>) => {
	const { addWidget } = useBoardActions();
	const [displayName, setDisplayName] = useState('');
	const [sources, setSources] = useState<Record<string, any>>({});
	const [submitting, setSubmitting] = useState(false);
	const { register, control, trigger, getValues } = useForm({
		// Use default from a option
		defaultValues: Object.fromEntries(
			Object.entries(widget.options).map(([optName, { default: def }]) => [optName, def])
		),
	});

	const displayNameValid = displayName && !board.widgets.some((w) => w.name === displayName);
	const needsConfig = Object.keys(widget.options).length > 0;
	// If a source is required, make sure it has bee filled out
	const sourcesFilled = Object.entries(widget.sources).every(
		([sourceName, sourceDef]) => !sourceDef.required || sources[sourceName] !== undefined
	);

	return (
		<Stack spacing={0}>
			<TextInput
				label='Display Name'
				value={displayName}
				error={!displayNameValid && 'Must not be empty or already used on the board.'}
				onChange={(e) => setDisplayName(e.target.value)}
			/>
			{needsConfig && (
				<Title mt='md' size={28} fw={600}>
					Configure the Widget
				</Title>
			)}
			{needsConfig && (
				<OptionsForm
					register={register}
					control={control}
					optionsDefinition={widget.options}
				/>
			)}
			<Title size={28} mt={needsConfig ? 'md' : undefined} fw={600}>
				Select Sources
			</Title>
			{!sourcesFilled && (
				<Text color='red' size='xl' fw={500}>
					Fill in required sources.
				</Text>
			)}
			<SourcesForm
				sources={sources}
				setSources={setSources}
				sourcesDefinitions={widget.sources}
			/>
			<Button
				mt='md'
				disabled={submitting}
				loading={submitting}
				onClick={async () => {
					if (displayName === '') return;
					setSubmitting(true);
					const optionsValid = await trigger();
					if (!optionsValid || !sourcesFilled) return setSubmitting(false);
					const options = getValues();
					addWidget(board.name, displayName, {
						name: displayName,
						display: name,
						options,
						sources,
						x: 100,
						y: 300,
						locked: false,
						height: 0,
						width: 0,
					});
					setSubmitting(false);
					closeAllModals();
				}}
			>
				Add To Board
			</Button>
		</Stack>
	);
};
