import { NumberInput, NumberInputProps } from '@mantine/core';
import { Control, FieldValues, Path, useController } from 'react-hook-form';

type Props<T extends FieldValues> = NumberInputProps & {
	name: Path<T>;
	control: Control<T>;
};

export const ControlledNumberInput = <T extends FieldValues>({
	name,
	control,
	...props
}: Props<T>) => {
	const {
		field,
		fieldState: { error },
	} = useController({ name, control, rules: { required: props.required } });

	return (
		<NumberInput
			value={field.value}
			onChange={field.onChange}
			onBlur={field.onBlur}
			name={field.name}
			ref={field.ref}
			error={error?.message}
			withAsterisk={props.required}
			{...props}
		/>
	);
};
