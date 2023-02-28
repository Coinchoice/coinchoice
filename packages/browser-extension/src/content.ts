import detectEthereumProvider from '@metamask/detect-provider';
import type { PlasmoCSConfig } from 'plasmo';

import { RPCProviderFacade } from './utils/RPCProviderFacade';

export const config: PlasmoCSConfig = {
	matches: ['<all_urls>'],
	world: 'MAIN',
};

console.log('CONTENT SCRIPT!');

(async () => {
	const provider = await detectEthereumProvider({ timeout: 10000 });
	if (provider) {
		console.log('Ethereum successfully detected!', provider);

		const facade = new RPCProviderFacade();
		facade.wrap(provider);
	}
})();
