import { useContext } from 'react';

import { context } from '../context';

function useEvmProvider(): EvmProviderContext {
	const evmProviderContext = useContext(context);
	if(!evmProviderContext) {
		throw new Error('You should call useETHProvider inside of EvmProviderProvider context ');
	}

	return evmProviderContext;

}

export default useEvmProvider;
