import { Provider } from "./helper";
import { defineScopeProviders, getScope, initProvider, defineProviderToken } from "./scope";

export const provideService = (...providers: Provider[]) => {
    const scope = getScope(true);

    defineScopeProviders(providers, scope);
    providers.map(defineProviderToken).forEach((provider) => initProvider(provider, scope));
};

export const injectService = <T extends Provider>(provider: T) => {
    const scope = getScope(false);

    return initProvider(provider, scope);
};
