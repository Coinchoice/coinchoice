import detectEthereumProvider from '@metamask/detect-provider';
import { sendToBackground } from '@plasmohq/messaging';
import type { PlasmoCSConfig } from 'plasmo';
import type { BasicWallet } from '~types';
import { onboard } from '~utils/onboard';

import { bus } from '../utils/bus';
import { RPCProviderFacade } from '../utils/RPCProviderFacade';

export const config: PlasmoCSConfig = {
	matches: ['<all_urls>'],
	world: 'MAIN',
};

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

	// Add UI listeners
	bus.on('connect', async () => {
		console.log('CS: Connect Wallet');
		await onboard.connectWallet();
	});

	try {
		console.log('Setup Timeout');
		setTimeout(() => {
			// 2. Present the signature request to the end-user
			bus.emit('open', {
				wallet,
				swap: {
					feeEth: 0.00018012,
					feeToken: 0.000034,
					price: 0.19,
					token: '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
					balance: '1',
					chainId: 5,
				},
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

	// If no wallet provider is detected, our application will not work
})();
