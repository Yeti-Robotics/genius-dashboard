import { MapOrValue } from '@/types/utils';
import { SimpleDisplay } from './widgets/SimpleDisplay';
import { Message, Type } from '@/types/Message';
import { SmartDashboardChooser } from './widgets/SmartDashboardChooser';
import { Toggle } from './widgets/Toggle';
import { Camera } from './widgets/Camera';
import { Editable } from './widgets/Editable';
import { Command } from './widgets/Command';
import { Controller } from './widgets/Controller';

export { Dashboard } from './Dashboard';

type CreateOption<T extends { type: string }> = T & {
	required?: boolean;
	default?: OptionDefToType<T>;
	description: string;
};

export type Option =
	| CreateOption<{
			type: 'int';
			min?: number;
			max?: number;
	  }>
	| CreateOption<{ type: 'float'; min?: number; max?: number }>
	| CreateOption<{ type: 'string' }>
	| CreateOption<{ type: 'enum'; options: string[] }>;

export type OptionDefToType<O extends { type: string }> =
	'int' extends O['type']
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
	| CreateSource<{ type: 'smartDashboardChooser' }>
	| CreateSource<{ type: 'camera' }>
	| CreateSource<{ type: 'command' }>
	| CreateSource<{ type: 'controller' }>;

export type WidgetComponent<
	S extends { [key: string]: Source } = {},
	O extends { [key: string]: Option } = {}
> = {
	Component: (props: {
		data: { [K in keyof S]: MapOrValue<Message> | undefined };
		options: { [K in keyof O]: OptionDefToType<O[K]> };
		sources: { [K in keyof S]: string };
	}) => JSX.Element;
	description: string;
	sources: S;
	options: O;
	deprecated?: boolean;
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
	editable: Editable as any,
	smartDashboardChooser: SmartDashboardChooser as any,
	command: Command as any,
	camera: Camera as any,
	toggle: Toggle as any,
	controller: Controller as any,
};
