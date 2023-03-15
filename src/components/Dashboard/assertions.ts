import { ButtonHelper, Camera, Command, Message, SmartDashboardChooser, Type } from '@/types/Message';
import { Topic } from '@/types/Topic';
import { Option } from '.';

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
): o is SmartDashboardChooser => {
	if (o === undefined || o === null) return false;
	if (isKeyType(o)) return false;
	if (!(typeof o === 'object')) return false;
	if (!('.controllable' in o) || !isKeyType(o['.controllable'], ['boolean']))
		return false;
	if (!('.instance' in o) || !isKeyType(o['.instance'], ['int'])) return false;
	if (!('.name' in o) || !isKeyType(o['.name'], ['string'])) return false;
	if (!('.type' in o) || !isKeyType(o['.type'], ['string'])) return false;
	if (!('active' in o) || !isKeyType(o.active, ['string'])) return false;
	if (!('default' in o) || !isKeyType(o.default, ['string'])) return false;
	if (
		!('options' in o) ||
		!isKeyType(o.options, [
			'boolean[]',
			'double[]',
			'float[]',
			'int[]',
			'string[]',
		])
	)
		return false;

	return true;
};

export const isCamera = (
	o: unknown,
	isKeyType: (o: unknown, allowedTypes?: Type[]) => boolean
): o is Camera => {
	if (o === null) return false;
	if (isKeyType(o)) return false;
	if (!(typeof o === 'object')) return false;
	if (!('connected' in o) || !isKeyType(o.connected, ['boolean'])) return false;
	if (!('description' in o) || !isKeyType(o.description, ['string']))
		return false;
	if (!('mode' in o) || !isKeyType(o.mode, ['string'])) return false;
	if (!('modes' in o) || !isKeyType(o.modes, ['string[]'])) return false;
	if (!('source' in o) || !isKeyType(o.source, ['string'])) return false;
	if (!('streams' in o) || !isKeyType(o.streams, ['string[]'])) return false;

	return true;
};

export const isCommand = (
	o: unknown,
	isKeyType: (o: unknown, allowedTypes?: Type[]) => boolean
): o is Command => {
	if (o === null) return false;
	if (isKeyType(o)) return false;
	if (!(typeof o === 'object')) return false;
	if (!('.controllable' in o) || !isKeyType(o['.controllable'], ['boolean']))
		return false;
	if (!('.isParented' in o) || !isKeyType(o['.isParented'], ['boolean']))
		return false;
	if (!('.name' in o) || !isKeyType(o['.name'], ['string'])) return false;
	if (!('.type' in o) || !isKeyType(o['.type'], ['string'])) return false;
	if (
		!('interruptBehavior' in o) ||
		!isKeyType(o.interruptBehavior, ['string'])
	)
		return false;
	if (!('running' in o) || !isKeyType(o.running, ['boolean'])) return false;
	if (!('runsWhenDisabled' in o) || !isKeyType(o.runsWhenDisabled, ['boolean']))
		return false;

	return true;
};

export const isButtonHelper = (
	o: unknown,
	isKeyType: (o: unknown, allowedTypes?: Type[]) => boolean
): o is ButtonHelper => {
	if (o === null) return false;
	if (typeof o !== 'object') return false;
	if (!('buttonHelper' in o) || !isKeyType(o.buttonHelper, ['boolean'])) return false;
	return true;
};

export const isTopic = (o: unknown, allowedTypes?: Type[]): o is Topic => {
	if (o === null) return false;
	if (typeof o !== 'object') return false;
	if (!('name' in o) || typeof o.name !== 'string') return false;
	if (!('id' in o) || typeof o.id !== 'number') return false;
	if (!('type' in o)) return false;
	if (allowedTypes !== undefined && !allowedTypes.includes(o.type as Type))
		return false;
	// TODO fix type serialization so i can check it here

	return true;
};

export const getOptionErrors = (
	options: Record<string, any>,
	defs: Record<string, Option>
) =>
	Object.fromEntries(
		Object.entries(options).map(([name, value]) => {
			const def = defs[name];

			if (def.type === 'int') {
				if (def.required) {
					if (typeof value !== 'number') return [name, 'Must be an integer.'];
				}

				if (typeof value === 'number') {
					if (def.min && value < def.min)
						return [name, `Must be greater than or equal to ${def.min}`];
					if (def.max && value > def.max)
						return [name, `Must be less than or equal to ${def.max}`];
				}
			} else if (def.type === 'float') {
				if (def.required) {
					if (typeof value !== 'number') return [name, 'Must be an integer.'];
				}

				if (typeof value === 'number') {
					if (def.min && value < def.min)
						return [name, `Must be greater than or equal to ${def.min}`];
					if (def.max && value > def.max)
						return [name, `Must be less than or equal to ${def.max}`];
				}
			} else if (def.type === 'string') {
				if (def.required) {
					if (typeof value !== 'string' || value === '')
						return [name, 'Must be a non-empty string.'];
				}
			} else if (def.type === 'enum') {
				if (def.required) {
					if (!def.options.includes(value))
						return [name, 'Value must be a part of the enum.'];
				}
			}

			return [name, undefined];
		})
	);
