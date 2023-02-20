import { Control, UseFormRegister } from 'react-hook-form';
import { Option } from '.';
import { Stack, TextInput } from '@mantine/core';
import { ControlledNumberInput } from '../Form/ControlledNumberInput';
import { ControlledSelect } from '../Form/ControllableSelect';

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
			{Object.entries(optionsDefinition).map(
				([optionName, optionDefinition]) => {
					if (optionDefinition.type === 'int') {
						return (
							<ControlledNumberInput
								name={optionName}
								control={control}
								label={optionName}
								key={optionName}
								precision={0}
								required={optionDefinition.required}
								min={optionDefinition.min}
								max={optionDefinition.max}
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
								required={optionDefinition.required}
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
								required={optionDefinition.required}
								{...register(optionName, {
									required: optionDefinition.required,
								})}
							/>
						);
					}

					if (optionDefinition.type === 'enum') {
						return (
							<ControlledSelect
								control={control}
								name={optionName}
								label={optionName}
								description={optionDefinition.description}
								data={optionDefinition.options}
								required={optionDefinition.required}
								clearable={!optionDefinition.required}
								key={optionName}
							/>
						);
					}

					return null;
				}
			)}
		</Stack>
	);
};
