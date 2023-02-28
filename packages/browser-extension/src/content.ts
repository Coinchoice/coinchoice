import detectEthereumProvider from '@metamask/detect-provider';
import type { PlasmoCSConfig } from 'plasmo';

import { bus } from './utils/bus';
import { RPCProviderFacade } from './utils/RPCProviderFacade';

export const config: PlasmoCSConfig = {
	matches: ['<all_urls>'],
	world: 'MAIN',
};

(async () => {
	const provider = await detectEthereumProvider({ timeout: 10000 });
	if (provider) {
		console.log('Ethereum successfully detected!', provider);

		const facade = new RPCProviderFacade();
		facade.wrap(provider);

		console.log('setup CONTENT');
		bus.on('message', (msg) => {
			console.log('CONTENT: on message', msg);
			// setOpened(true);
		});

		setTimeout(() => {
			bus.emit('message', { insta: 'CONTENT: message' });
		}, 1000);
	}
})();
