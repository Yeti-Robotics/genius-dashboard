import { isTopic } from '@/components/Dashboard/assertions';
import { Message, MessageType } from '@/types/Message';
import { Topic } from '@/types/Topic';
import { MapOrValue } from '@/types/utils';
import {
	getTopicFromName,
	publishValue,
	setTopicFromName,
} from '@/utils/topicUtils';
import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

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
			topicData: {
				...setTopicFromName(message.topic_name, message, topicData),
			},
		}));
	},
	setAnnouncedTopic: (topic) =>
		set(({ announcedTopics }) => {
			return {
				announcedTopics: {
					...setTopicFromName(topic.name, topic, announcedTopics),
				},
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
export const useTopicData = <T extends { [key: string]: string }>(names: T) => {
	return useTopicStore(
		(state) =>
			Object.fromEntries(
				Object.entries(names).map(([k, name]) => [
					k,
					getTopicFromName(name, state.topicData),
				])
			) as { [K in keyof T]: MapOrValue<Message> | undefined },
		shallow
	);
};

export const useAllTopicData = () => useTopicStore((state) => state.topicData);

export const useAnnouncedTopics = (): MapOrValue<Topic> =>
	useTopicStore((state) => state.announcedTopics);

export const useTopic = <T extends { [key: string]: string }>(names: T) => {
	return useTopicStore(
		(state) =>
			Object.fromEntries(
				Object.entries(names).map(([k, name]) => [
					k,
					getTopicFromName(name, state.announcedTopics),
				])
			) as { [K in keyof T]: MapOrValue<Topic> | undefined },
		shallow
	);
};

/**
 * Creates a function that changes the topic locally and sends the value off to the server
 * */
export const usePublishValue = (topic: string) => {
	const setTopic = useTopicStore((state) => state.setTopic);
	const { topicDef } = useTopic({ topicDef: topic });
	return (newValue: MessageType) => {
		if (!isTopic(topicDef))
			throw new Error('`usePublishValue` topic must not have children.');

		const prevData = getTopicFromName(
			topic,
			useTopicStore.getState().topicData
		) as Message;
		publishValue({
			topic,
			topicType: topicDef.type,
			value: newValue,
		}).then((res) => {
			if (!res.isOk()) {
				console.error(res);
				setTopic(prevData);
			}
		});

		// This will cause rerender 👍, optimistic update
		setTopic({
			topic_name: topic,
			data: newValue,
			timestamp: prevData.timestamp + 1,
			type: topicDef.type,
		});
	};
};
