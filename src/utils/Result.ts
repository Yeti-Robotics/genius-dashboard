export type RawResult<T, E> = { ok: T } | { err: E };

export class Result<T, E> {
	private internal: RawResult<T, E>;

	constructor(raw: RawResult<T, E>);
	constructor(fn: () => T);
	constructor(from: (() => T) | RawResult<T, E>) {
		if (typeof from === 'function') {
			try {
				this.internal = { ok: from() };
			} catch (e) {
				this.internal = { err: e as E };
			}
		} else {
			this.internal = from;
		}
	}

	static async fromPromise<T, E>(promise: Promise<T>): Promise<Result<T, E>> {
		try {
			return new Result({ ok: await promise });
		} catch (e) {
			return new Result({ err: e as E });
		}
	}

	/** Result::map, works just like rust */
	map<U>(mapper: (t: T) => U): Result<U, E> {
		if ('ok' in this.internal) {
			return new Result({ ok: mapper(this.internal.ok) });
		}
		return new Result(this.internal);
	}

	/** Result::map_err, works just like rust  */
	mapErr<U>(mapper: (e: E) => U): Result<T, U> {
		if ('err' in this.internal) {
			return new Result({ err: mapper(this.internal.err) });
		}
		return new Result(this.internal);
	}

	unwrap(): T {
		if ('ok' in this.internal) {
			return this.internal.ok;
		}
		throw new Error(`Called unwrap on error variant: ${this.internal.err}`);
	}

	unwrapOr(or: T): T {
		if ('ok' in this.internal) {
			return this.internal.ok;
		}
		return or;
	}

	match<U>(okFn: (ok: T) => U, errFn: (err: E) => U): U {
		if ('ok' in this.internal) {
			return okFn(this.internal.ok);
		}
		return errFn(this.internal.err);
	}

	isOk() {
		return 'ok' in this.internal;
	}

	isErr() {
		return 'err' in this.internal;
	}

	onOk(handler: (ok: T) => void) {
		if ('ok' in this.internal) {
			handler(this.internal.ok);
		}
	}

	onErr(handler: (err: E) => void) {
		if ('err' in this.internal) {
			handler(this.internal.err);
		}
	}
}
