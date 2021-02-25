import { getCurrentInstance } from 'vue';
import { SCOPE_PROVIDERS, PROVIDER_TOKEN, PROVIDER_CONSTRUCTOR } from './constants';
import { Constructor, error, Infer, Provider } from './helper';

type ScopeProvides = Set<Provider>;
type Scope = Record<string, any> & {
	[SCOPE_PROVIDERS]?: ScopeProvides;
};

export const getScope = (cover = true): Scope => {
	//instance.provides is internal
	const instance: any = getCurrentInstance();
	if (!instance) error('should inside setup()');

	const scope = instance.provides;

	if (cover) {
		const parent = instance.parent && instance.parent.provides;
		return parent === scope ? (instance.provides = Object.create(parent)) : scope;
	}

	return scope;
};

export const defineProviderToken = (provider: Provider) => {
	if (!getProviderToken(provider)) {
		provider[PROVIDER_TOKEN] = Symbol(provider.name);
	}

	return provider;
};

export const getProviderToken = (provider: Provider) => {
	return provider[PROVIDER_TOKEN];
};

export const getScopeProviders = (scope: Scope) => scope[SCOPE_PROVIDERS];

export const defineScopeProviders = (providers: Provider[], scope: Scope): ScopeProvides => {
	const scopeProviders = getScopeProviders(scope) || new Set();

	//will cover proto
	return (scope[SCOPE_PROVIDERS] = new Set([...scopeProviders, ...providers]));
};

const getIsConstructor = (provider: Provider): provider is Constructor => {
	return !!provider[PROVIDER_CONSTRUCTOR];
};

const initInstance = (provider: Provider) => {
	return getIsConstructor(provider) ? new provider() : provider();
};

export const initProvider = <P extends Provider>(provider: P, scope: Scope): Infer<P> => {
	//ts不支持symbol为索引
	const token: any = getProviderToken(provider);
	const has = getScopeProviders(scope)?.has(provider);

	if (!token || !has) error(`${provider.name} without provide`);

	return scope[token] || (scope[token] = initInstance(provider));
};
