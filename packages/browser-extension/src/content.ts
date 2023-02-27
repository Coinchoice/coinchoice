import detectEthereumProvider from '@metamask/detect-provider';
import type { PlasmoCSConfig } from 'plasmo';

// import { RPCProviderFacade } from './RPCProviderFacade';

export const config: PlasmoCSConfig = {
	matches: ['<all_urls>'],
	world: 'MAIN',
};

// @ts-ignore
// import ethereumWrapper from './injected/index?script&module';

// const script = document.createElement('script');

// script.src = chrome.runtime.getURL('injected/index.js');

// script.async = false;
// script.type = 'module';
// const node = document.head || document.documentElement;
// node.prepend(script);

console.log('CONTENT SCRIPT!');

// new RPCProviderFacade();

(async () => {
	const provider = await detectEthereumProvider({ timeout: 10000 });
	if (provider) {
		console.log('Ethereum successfully detected!', provider);

		// From now on, this should always be true:
		// provider === window.ethereum

		// Access the decentralized web!

		// Legacy providers may only have ethereum.sendAsync
		// const chainId = await provider.request({
		// 	method: 'eth_chainId'
		// })
	} else {
		// if the provider is not detected, detectEthereumProvider resolves to null
		console.error('Please install MetaMask!');
	}
})();

/**
 * Used to listen for events emitted by the injected ethereumWrapper script
 * Probably redundant but haven't found a satisfying alternative.
 */
// window.addEventListener('COINCHOICE', (stuff) => {
// 	//@ts-ignore
// 	const request = stuff.detail;
// 	sendRequest(request);
// });

// decisionStream.subscribe(async (data) => {
// 	const newData = {
// 		...data[0],
// 		origin: 'coinchoice',
// 	};
// 	window.postMessage(newData);
// });
