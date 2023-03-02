import detectEthereumProvider from '@metamask/detect-provider';
import { sendToBackground } from '@plasmohq/messaging';
import type { PlasmoCSConfig } from 'plasmo';
import { coinList } from '~utils/constants';

import { bus } from '../utils/bus';
import { RPCProviderFacade } from '../utils/RPCProviderFacade';

export const config: PlasmoCSConfig = {
	matches: ['<all_urls>'],
	world: 'MAIN',
};

const defaultCoin = coinList.find((coin) => !!coin.default);

let coin = defaultCoin;
chrome.runtime.onMessage.addListener((req) => {
	console.log('COIN RELAY');
	console.log(req.body);
	if (req.body?.data?.ticker) {
		coin = req.body.data;
	}
});

async function connectWallet(wallet: BasicWallet) {
	if (!wallet.address) {
		return null;
	}
	return sendToBackground({
		name: 'wallet',
		body: {
			type: 'connect',
			data: {
				wallet,
			},
		},
	});
}

async function onProvider(provider) {
	console.log('Ethereum successfully detected!', provider);

	const chainId = window.ethereum.chainId
		? parseInt(window.ethereum.chainId, 16)
		: 1;
	const wallet = {
		address: window.ethereum.selectedAddress,
		network: chainId,
	};

	const facade = new RPCProviderFacade(wallet);
	facade.wrap(provider);

	// Add mm listeners
	provider.on('connect', (connectInfo) => {
		bus.emit('mm:connect', { connectInfo });
	});
	provider.on('disconnect', (err) => {
		bus.emit('mm:disconnect', err);
	});
	provider.on('accountsChanged', async (accounts: Array<string>) => {
		wallet.address = accounts[0];
		facade.setWallet(wallet);
		await connectWallet(wallet);
		bus.emit('mm:accountsChanged', { accounts });
	});
	provider.on('chainChanged', async (chainId: string) => {
		wallet.network = chainId ? parseInt(chainId, 16) : 1;
		facade.setWallet(wallet);
		await connectWallet(wallet);
		bus.emit('mm:chainChanged', { chainId });
	});

	try {
		console.log('Setup Timeout');
		setTimeout(() => {
			// 2. Present the signature request to the end-user
			bus.emit('open', {
				feeEth: 0.00018012,
				feeToken: 0.000034,
				price: 0.19,
				token: 'USDC',
				balance: '1',
				chainId: 5,
			});
		}, 2000);

		// On provider connected, we will need send a request to background to ensure storage is hydrated.
		await connectWallet(wallet);
		console.log('CS: wallet hydrated', wallet);
	} catch (e) {
		console.log('CS: ERROR');
		console.error(e);
	}
}

(async () => {
	const provider = await detectEthereumProvider({
		timeout: 10000,
	});
	if (provider) {
		return onProvider(provider);
	}

	// If no wallet provider is detected, we will need to inject and await a wallet connection
})();
