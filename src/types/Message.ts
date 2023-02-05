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

export type Message = {
	topic_name: string;
	timestamp: number;
	type: Type;
	data: boolean | number | string | number[] | boolean[] | string[] | null;
};
