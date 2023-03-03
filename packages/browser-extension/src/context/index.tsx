import { definition } from '../composites/__generated__/definition.js';
import { CERAMIC_CLIENT } from '../utils/env';
import { CeramicClient } from '@ceramicnetwork/http-client';
import { ComposeClient } from '@composedb/client';
import type { RuntimeCompositeDefinition } from '@composedb/types';
import { createContext, useContext } from 'react';

/**
 * Configure ceramic Client & create context.
 */
const ceramic = new CeramicClient(CERAMIC_CLIENT);

const composeClient = new ComposeClient({
	ceramic: CERAMIC_CLIENT,
	// cast our definition as a RuntimeCompositeDefinition
	definition: definition as RuntimeCompositeDefinition,
});

const CeramicContext = createContext({
	ceramic: ceramic,
	composeClient: composeClient,
});

export const CeramicWrapper = ({ children }: any) => {
	return (
		<CeramicContext.Provider value={{ ceramic, composeClient }}>
			{children}
		</CeramicContext.Provider>
	);
};

/**
 * Provide access to the Ceramic & Compose clients.
 * @example const { ceramic, compose } = useCeramicContext()
 * @returns CeramicClient
 */

export const useCeramicContext = () => useContext(CeramicContext);
