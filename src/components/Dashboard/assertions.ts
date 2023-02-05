import { Message, Type } from '@/types/Message';
import { Topic } from '@/types/Topic';

export const isMessage = (o: unknown, allowedTypes?: Type[]): o is Message =>
	o !== undefined &&
	o !== null &&
	typeof o === 'object' &&
	'topic_name' in o &&
	'type' in o &&
	(allowedTypes === undefined || allowedTypes.includes(o.type as Type)) &&
	'timestamp' in o &&
	'data' in o;

export const isSmartDashboardChooser = (
	o: unknown,
	isKeyType: (o: unknown, allowedTypes?: Type[]) => boolean
): o is {
	['.controllable']: Message;
	['.instance']: Message;
	['.name']: Message;
	['.type']: Message;
	active: Message;
	default: Message;
	options: Message;
} => {
	if (o === undefined || o === null) return false;
	if (isKeyType(o)) return false;
	if (!(typeof o === 'object')) return false;
	if (!('.controllable' in o) || !isKeyType(o['.controllable'], ['boolean'])) return false;
	if (!('.instance' in o) || !isKeyType(o['.instance'], ['int'])) return false;
	if (!('.name'! in o) || !isKeyType(o['.name'], ['string'])) return false;
	if (!('.type' in o) || !isKeyType(o['.type'], ['string'])) return false;
	if (!('active' in o) || !isKeyType(o.active, ['string'])) return false;
	if (!('default' in o) || !isKeyType(o.default, ['string'])) return false;
	if (
		!('options' in o) ||
		!isKeyType(o.options, ['boolean[]', 'double[]', 'float[]', 'int[]', 'string[]'])
	)
		return false;

	return true;
};

export const isTopic = (o: unknown, allowedTypes?: Type[]): o is Topic => {
	if (o === undefined || o === null) return false;
	if (typeof o !== 'object') return false;
	if (!('name' in o) || typeof o.name !== 'string') return false;
	if (!('id' in o) || typeof o.id !== 'number') return false;
	if (!('type' in o)) return false;
	if (allowedTypes !== undefined && !allowedTypes.includes(o.type as Type)) return false;
	// TODO fix type serialization so i can check it here

	return true;
};
