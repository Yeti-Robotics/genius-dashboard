export type Type =
	| 'boolean'
	| 'double'
	| 'int'
	| 'float'
	| 'string'
	| 'raw'
	| 'boolean[]'
	| 'double[]'
	| 'int[]'
	| 'float[]'
	| 'string[]';

export type MessageType = boolean | number | string | number[] | boolean[] | string[] | null;

export type TypeToTSType<T extends Type> = 'boolean' extends T
	? boolean
	: 'double' extends T
	? number
	: 'int' extends T
	? number
	: 'float' extends T
	? number
	: 'string' extends T
	? string
	: 'raw' extends T
	? number[]
	: 'boolean[]' extends T
	? boolean[]
	: 'int[]' extends T
	? number[]
	: 'float[]' extends T
	? number[]
	: 'string[]' extends T
	? string[]
	: never;

export type Message<
	T extends boolean | number | string | number[] | boolean[] | string[] | null =
		| boolean
		| number
		| string
		| number[]
		| boolean[]
		| string[]
		| null
> = {
	topic_name: string;
	timestamp: number;
	type: Type;
	data: T;
};

export type SmartDashboardChooser = {
	['.controllable']: Message<boolean>;
	['.instance']: Message<number>;
	['.name']: Message<string>;
	['.type']: Message<string>;
	active: Message<string>;
	default: Message<string>;
	options: Message<string[]>;
};
