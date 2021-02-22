import { Infer, Provider } from './helper';
import { defineScopeProviders, getScope, initProvider, getProviderToken, defineProviderToken } from './scope';

export const provideService = (...providers: Provider[]) => {
	const scope = getScope(true);

	defineScopeProviders(providers, scope);
	providers.map(defineProviderToken).forEach((provider) => initProvider(provider, scope));
};

export const injectService = <T extends Provider>(service: T): Infer<T> => {
	const scope = getScope(false);
	const token = getProviderToken(service);

	return scope[token as any] || initProvider(service, scope);
};
