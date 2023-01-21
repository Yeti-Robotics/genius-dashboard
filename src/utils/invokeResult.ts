import { Result } from './Result';
import { invoke, InvokeArgs } from '@tauri-apps/api/tauri';

/** Same as invoke from tauri, except if there is an error, return it in a result */
export const invokeResult = async <T, E>(
	cmd: string,
	args?: InvokeArgs
): Promise<Result<T, E>> => Result.fromPromise<T, E>(invoke(cmd, args));
