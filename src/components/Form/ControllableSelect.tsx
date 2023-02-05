import { Select, SelectProps } from '@mantine/core';
import { Control, FieldValues, Path, useController } from 'react-hook-form';

type Props<T extends FieldValues> = SelectProps & {
	name: Path<T>;
	control: Control<T>;
};

export const ControlledSelect = <T extends FieldValues>({ name, control, ...props }: Props<T>) => {
	const {
		field,
		fieldState: { error },
	} = useController({ name, control, rules: { required: props.required } });

	return (
		<Select
			value={field.value}
			onChange={field.onChange}
			onBlur={field.onBlur}
			name={field.name}
			ref={field.ref}
			error={error?.message}
			{...props}
		/>
	);
};
