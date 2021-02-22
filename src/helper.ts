import { PROVIDER_TOKEN, PROVIDER_CONSTRUCTOR } from './constants';

interface Token {
	[PROVIDER_TOKEN]?: symbol;
	[PROVIDER_CONSTRUCTOR]?: boolean;
}

export interface Constructor<T extends object = any> {
	new (): T;
}

export type Func<T = any> = (...args: any[]) => T;

//export type Func<T = any> = (...args: any[]) => T;
export type Infer<T extends Provider> = T extends Constructor<infer P> ? P : T extends Func<infer V> ? V : never;
export type Provider = (Constructor | Func) & Token;

export const error = (msg: string) => {
	throw new Error(msg);
};

const hasOwnProperty = Object.prototype.hasOwnProperty;
export const hasOwn = (val: object, key: string | symbol): key is keyof typeof val => hasOwnProperty.call(val, key);

export const isFunction = (val: unknown): val is Function => typeof val === 'function';
