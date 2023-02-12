import { MessageType, Type } from '@/types/Message';
import { MapOrValue } from '@/types/utils';
import { invokeResult } from './invokeResult';

// Essentially this replaces the keys which are in the message topic name with copies
// of the original up until the last key, where it puts the new message
export const setTopicFromName = <T extends object>(
	topic: string,
	value: T,
	o: MapOrValue<T>
): MapOrValue<T> => {
	const topics = topic.slice(1).split('/');
	const newTopics: MapOrValue<T> = {};
	let nestLevel = o;
	let mutate = newTopics;

	for (let i = 0; i < topics.length; i += 1) {
		const isLast = i === topics.length - 1;
		const topic = topics[i];

		if (isLast) {
			Object.assign(mutate, nestLevel);
			mutate[topic] = value;
		} else {
			if (!(topic in nestLevel)) {
				Object.assign(mutate, nestLevel);
				(nestLevel as Record<string, MapOrValue<T>>)[topic] = {};
				nestLevel = (nestLevel as Record<string, MapOrValue<T>>)[topic];
				mutate[topic] = {};
				(mutate as any) = mutate[topic];
			} else {
				Object.assign(mutate, nestLevel);
				mutate[topic] = { ...(nestLevel as any)[topic] };
				(mutate as any) = mutate[topic];
				nestLevel = (nestLevel as any)[topic];
			}
		}
	}

	return newTopics;
};

export const getTopicFromName = <T extends object>(
	name: string,
	o: MapOrValue<T>
): MapOrValue<T> | undefined => {
	const topics = name.slice(1).split('/');
	let nestLevel = o;

	for (let i = 0; i < topics.length; i += 1) {
		const topic = topics[i];
		nestLevel = (nestLevel as Record<string, MapOrValue<T>>)?.[topic];
		if (!nestLevel) return;
	}

	return nestLevel;
};

export const publishValue = (params: { topic: string; topicType: Type; value: MessageType }) =>
	invokeResult<void, string>('publish_value', params);
