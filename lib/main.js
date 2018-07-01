'use babel';

import coreProvider from './core-provider';
import pseudovariablesProvider from './pseudovariables-provider';
import transformationsProvider from './transformations-provider';
import selectsProvider from './selects-provider';

export default {
    getProvider() {
        return [coreProvider, pseudovariablesProvider, transformationsProvider, selectsProvider];
    }
};
