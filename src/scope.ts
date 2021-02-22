import { getCurrentInstance } from 'vue';
import { HOST_PROVIDERS, HOST_INSTANCE_MAP, PROVIDER_TOKEN, PROVIDER_CONSTRUCTOR } from './constants';
import { Constructor, error, hasOwn, Infer, Provider } from './helper';

type ScopeToken = {
	[HOST_PROVIDERS]?: ScopeProvides;
	[HOST_INSTANCE_MAP]?: ScopeInstancesMap;
};

type Scope = ScopeToken & Record<string, any>;

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
	provider[PROVIDER_TOKEN] = Symbol(provider.name);

	return provider;
};

export const getProviderToken = (provider: Provider): symbol => {
	const token = provider[PROVIDER_TOKEN];
	if (!token) error(`${provider.name} without provide`);

	return token!;
};

export const getIsConstructor = (provider: Provider): provider is Constructor => {
	return !!provider[PROVIDER_CONSTRUCTOR];
};

type ScopeProvides = Set<Provider>;

export const defineScopeProviders = (providers: Provider[], scope: Scope): ScopeProvides => {
	const scopeProviders = getScopeProviders(scope);

	//will cover proto
	return (scope[HOST_PROVIDERS] = new Set([...scopeProviders, ...providers]));
};

export const getScopeProviders = (scope: Scope): ScopeProvides => scope[HOST_PROVIDERS] || new Set();

type ScopeInstancesMap = Map<Provider, Infer<Provider>>;

const initInstance = (provider: Provider) => (getIsConstructor(provider) ? new provider() : provider());

const getScopeInstanceMap = (scope: Scope) => {
	const mapper: ScopeInstancesMap = scope[HOST_INSTANCE_MAP] || new Map();

	return hasOwn(scope, HOST_INSTANCE_MAP) ? mapper : new Map([...mapper]);
};

export const defineScopeInstance = <P extends Provider>(provider: P, scope: Scope): Infer<P> => {
	const instance = initInstance(provider);

	const token: any = getProviderToken(provider);
	scope[token] = instance;

	//will cover proto
	const mapper = getScopeInstanceMap(scope);
	scope[HOST_INSTANCE_MAP] = mapper.set(provider, instance);

	return instance;
};

export const getScopeInstance = <P extends Provider>(provider: P, scope: Scope): Infer<P> | undefined => {
	const mapper = getScopeInstanceMap(scope);

	return mapper?.get(provider);
};

export const initProvider = <P extends Provider>(provider: P, scope: Scope) => {
	const has = getScopeProviders(scope).has(provider);
	if (!has) error(`${provider.name} without provide`);

	return getScopeInstance<P>(provider, scope) || defineScopeInstance<P>(provider, scope);
};
