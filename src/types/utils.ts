export type MapOrValue<T> = T | { [key: string]: MapOrValue<T> };
