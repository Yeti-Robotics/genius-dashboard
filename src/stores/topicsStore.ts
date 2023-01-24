import { Message } from '@/types/Message';
import { MapOrValue } from '@/types/utils';
import { getTopicFromName, setTopicFromName } from '@/utils/topicUtils';
import { create } from 'zustand';


type TopicStore = {
	topics: MapOrValue<Message>;
	setTopic: (message: Message) => void;
};


const useTopicStore = create<TopicStore>((set) => ({
	topics: {},
	setTopic: (message) => {
		set(({ topics }) => ({ topics: { ...setTopicFromName(message, topics) } }));
	},
}));

/** Only for use outside of react code, be careful */
export const getTopicStore = () => useTopicStore.getState();

/**
 * Subscribe to changes on a topic
 * @param name Topic name
 * @returns Updates to this topic or its sub-topics if it has any
 */
export const useTopic = (name: string): MapOrValue<Message> | undefined => {
	return useTopicStore((state) => getTopicFromName(name, state.topics));
};
