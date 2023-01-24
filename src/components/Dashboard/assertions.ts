import { Message } from '@/types/Message';

export const isMessage = (o: object | undefined | null): o is Message =>
	o !== undefined && o !== null && 'topic_name' in o && 'type' in o && 'timestamp' in o && 'data' in o;
