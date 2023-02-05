import { Type } from "./Message";

export type Topic = {
	name: string;
	id: number;
	pubuid?: number;
	type: Type;
	properties?: {
		persistent?: boolean;
		retained?: boolean;
		[key: string]: unknown;
	};
};
