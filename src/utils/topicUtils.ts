import { Message } from '@/types/Message';
import { MapOrValue } from '@/types/utils';

// Essentially this replaces the keys which are in the message topic name with copies
// of the original up until the last key, where it puts the new message
export const setTopicFromName = (message: Message, o: MapOrValue<Message>): MapOrValue<Message> => {
	const topics = message.topic_name.slice(1).split('/');
	const newTopics: MapOrValue<Message> = {};
	let nestLevel = o;
	let mutate = newTopics;

	for (let i = 0; i < topics.length; i += 1) {
		const isLast = i === topics.length - 1;
		const topic = topics[i];

		if (isLast) {
			mutate[topic] = message;
		} else {
			if (!(topic in nestLevel)) {
				(nestLevel as Record<string, MapOrValue<Message>>)[topic] = {};
				nestLevel = (nestLevel as Record<string, MapOrValue<Message>>)[topic];
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

export const getTopicFromName = (
	name: string,
	o: MapOrValue<Message>
): MapOrValue<Message> | undefined => {
	const topics = name.slice(1).split('/');
	let nestLevel = o;

	for (let i = 0; i < topics.length; i += 1) {
		const topic = topics[i];
		nestLevel = (nestLevel as Record<string, MapOrValue<Message>>)?.[topic];
		if (!nestLevel) return;
	}

	return nestLevel;
};
