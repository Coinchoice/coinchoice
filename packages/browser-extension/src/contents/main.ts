import detectEthereumProvider from '@metamask/detect-provider';
import type { PlasmoCSConfig } from 'plasmo';

// import { bus } from '../utils/bus';
import { RPCProviderFacade } from '../utils/RPCProviderFacade';

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

		// bus.emit('provider', {
		// 	provider: true,
		// });
	}
})();
