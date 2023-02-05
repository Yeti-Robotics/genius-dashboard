import { MapOrValue } from '@/types/utils';
import { SimpleDisplay } from './widgets/SimpleDisplay';
import { Message, Type } from '@/types/Message';

export { Dashboard } from './Dashboard';

type CreateOption<T extends { type: string }> = T & {
	required?: boolean;
	default?: OptionDefToType<T>;
	description: string;
};

export type Option =
	| CreateOption<{
			type: 'int';
	  }>
	| CreateOption<{ type: 'float' }>
	| CreateOption<{ type: 'string' }>
	| CreateOption<{ type: 'enum'; options: string[] }>;

export type OptionDefToType<O extends { type: string }> = 'int' extends O['type']
	? number
	: 'float' extends O['type']
	? number
	: 'string' extends O['type']
	? string
	: 'enum' extends O['type']
	? string
	: never;

type CreateSource<T extends { type: string }> = T & {
	description: string;
	required: boolean;
};

export type Source =
	| CreateSource<{
			type: 'topic';
			types: Type[];
	  }>
	| CreateSource<{ type: 'smartDashboardChooser' }>;

export type WidgetComponent<
	S extends { [key: string]: Source } = {},
	O extends { [key: string]: Option } = {}
> = {
	Component: (props: {
		data: { [K in keyof S]: MapOrValue<Message> | undefined };
		options: { [K in keyof O]: OptionDefToType<O[K]> };
	}) => JSX.Element;
	description: string;
	sources: S;
	options: O;
};

export const WIDGET_NAME_MAP: Record<
	string,
	WidgetComponent<Record<string, Source>, Record<string, Option>>
> = {
	/*
	casting to any here because users of this map don't care about specific options/sources
	of any WidgetComponent
	*/
	simple: SimpleDisplay as any,
};
