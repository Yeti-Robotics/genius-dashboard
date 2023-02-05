import { Control, UseFormRegister } from 'react-hook-form';
import { Option } from '.';
import { Select, Stack, TextInput } from '@mantine/core';
import { ControlledNumberInput } from '../Form/ControlledNumberInput';

export const OptionsForm = ({
	register,
	control,
	optionsDefinition,
}: {
	register: UseFormRegister<Record<string, any>>;
	control: Control<Record<string, any>>;
	optionsDefinition: Record<string, Option>;
}) => {
	return (
		<Stack>
			{Object.entries(optionsDefinition).map(([optionName, optionDefinition]) => {
				if (optionDefinition.type === 'int') {
					return (
						<ControlledNumberInput
							name={optionName}
							control={control}
							label={optionName}
							key={optionName}
							precision={0}
						/>
					);
				}

				if (optionDefinition.type === 'float') {
					return (
						<ControlledNumberInput
							name={optionName}
							control={control}
							label={optionName}
							key={optionName}
							precision={2}
						/>
					);
				}

				if (optionDefinition.type === 'string') {
					return (
						<TextInput
							label={optionName}
							description={optionDefinition.description}
							key={optionName}
							{...register(optionName, { required: optionDefinition.required })}
						/>
					);
				}

				if (optionDefinition.type === 'enum') {
					return (
						<Select
							label={optionName}
							description={optionDefinition.description}
							data={optionDefinition.options}
							key={optionName}
						/>
					);
				}

				return null;
			})}
		</Stack>
	);
};
