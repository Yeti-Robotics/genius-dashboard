import { Message } from '@/types/Message';
import { Topic } from '@/types/Topic';
import { MapOrValue } from '@/types/utils';
import { getTopicFromName, setTopicFromName } from '@/utils/topicUtils';
import { create } from 'zustand';

type TopicStore = {
	topicData: MapOrValue<Message>;
	announcedTopics: MapOrValue<Topic>;
	setTopic: (message: Message) => void;
	setAnnouncedTopic: (topic: Topic) => void;
};

const useTopicStore = create<TopicStore>((set) => ({
	topicData: {},
	announcedTopics: {},
	setTopic: (message) => {
		set(({ topicData }) => ({
			topicData: { ...setTopicFromName(message.topic_name, message, topicData) },
		}));
	},
	setAnnouncedTopic: (topic) =>
		set(({ announcedTopics }) => {
			return {
				announcedTopics: { ...setTopicFromName(topic.name, topic, announcedTopics) },
			};
		}),
}));

/** Only for use outside of react code, be careful */
export const getTopicStore = () => useTopicStore.getState();

/**
 * Subscribe to changes on a topic
 * @param name Topic name
 * @returns Updates to this topic or its sub-topics if it has any
 */
export const useTopicData = <T extends { [key: string]: string }>(
	names: T
) => {
	return useTopicStore(
		(state) =>
			Object.fromEntries(
				Object.entries(names).map(([k, name]) => [
					k,
					getTopicFromName(name, state.topicData),
				])
			) as { [K in keyof T]: MapOrValue<Message> | undefined }
	);
};

export const useAnnouncedTopics = (): MapOrValue<Topic> =>
	useTopicStore((state) => state.announcedTopics);
