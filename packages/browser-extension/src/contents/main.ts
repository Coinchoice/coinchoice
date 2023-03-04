import detectEthereumProvider from '@metamask/detect-provider';
import ky from 'ky';
import type { PlasmoCSConfig } from 'plasmo';
import { io } from 'socket.io-client';
import type { Coin, TopUp } from '~types';
import type { JsonRpcRequest } from '~types/requests';
import { bus, busPromise } from '~utils/bus';
import { API_HOST } from '~utils/env';
import { RPCProviderFacade } from '~utils/RPCProviderFacade';

export const config: PlasmoCSConfig = {
	matches: ['<all_urls>'],
	world: 'MAIN',
};

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
		console.log('CS: Connect Info', connectInfo);
		bus.emit('mm:connect', { connectInfo });
	});

	provider.on('disconnect', (err) => {
		console.log('CS: Disconnect', err);
		bus.emit('mm:disconnect', err);
	});

	provider.on('accountsChanged', async (accounts: Array<string>) => {
		console.log('CS: accountsChanged', accounts);
		wallet.address = accounts[0];
		facade.setWallet(wallet);
		try {
			await busPromise('connect-wallet', { wallet });
		} catch (e) {
			console.log('CS ERROR: accountsChanged');
			console.error(e);
		}
		bus.emit('mm:accountsChanged', { accounts });
	});

	provider.on('chainChanged', async (chainId: string) => {
		console.log('CS: chainChanged', chainId);
		wallet.network = chainId ? parseInt(chainId, 16) : 1;
		facade.setWallet(wallet);
		try {
			await busPromise('connect-wallet', { wallet });
		} catch (e) {
			console.log('CS ERROR: chainChanged');
			console.error(e);
		}
		bus.emit('mm:chainChanged', { chainId });
	});

	// Add UI listeners
	bus.on('connect', async () => {
		console.log('CS: Connect Wallet');
		const req = { method: 'eth_requestAccounts' } as JsonRpcRequest;
		const accounts = await window.ethereum.request(req);
		console.log('CS: Wallet Connected', accounts);
		bus.emit('connected', {
			address: accounts[0],
		});
	});

	try {
		// console.log('Setup Timeout');
		// setTimeout(() => {
		// 	// 2. Present the signature request to the end-user
		// 	bus.emit('open', {
		// 		wallet,
		// 		swap: {
		// 			feeEth: 0.00018012,
		// 			feeToken: 0.000034,
		// 			price: 0.19,
		// 			token: '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
		// 			balance: '1',
		// 			chainId: 5,
		// 		},
		// 	});
		// }, 2000);

		// On provider connected, we will need send a request to background to ensure storage is hydrated.
		await busPromise('connect-wallet', { wallet });
		console.log('CS: wallet hydrated', wallet);
	} catch (e) {
		console.log('CS: ERROR');
		console.error(e);
	}

	// Setup Socket for Extra Gas inside of Snap
	const socket = io(API_HOST);
	socket.on('connect', function () {
		console.log('Connected');

		// socket.emit('events', { test: 'hello' });
		// socket.emit('identity', 0, response =>
		// 	console.log('identity', response),
		// );
		// socket.emit('identity', 1, response =>
		// 	console.log('identity', response),
		// );
	});
	socket.on('events', function (data) {
		console.log('event', data);
	});
	// socket.on('exception', function(data) {
	// 	console.log('event', data);
	// });
	// socket.on('disconnect', function() {
	// 	console.log('Disconnected');
	// });

	// Register topup event handler
	const scriptId = 'coinchoice-topup-script';
	const loadTopUp = (topUp: TopUp) => {
		// Load topup ui
		// @ts-ignore
		window.Cypher({
			address: wallet.address,
			targetChainIdHex: '0x5', // Eth - Goreli
			requiredTokenBalance: topUp.amount,
			requiredTokenContractAddress: topUp.coin.networks[5],
			isTestnet: true,
			callBack: () => {
				console.log('topup exchange cypher loaded');
			},
		});
	};
	bus.on('topup', async (topUp: TopUp) => {
		console.log('CS: Topup', topUp);

		if (!document.getElementById(scriptId)) {
			// Check if cypher script already loaded.
			const script = document.createElement('script');
			// use local file
			// script.src = 'script.js';
			// script.src = ;
			script.innerHTML = topUp.sdk;
			script.async = true;
			script.setAttribute('id', scriptId);
			script.onerror = () => {
				console.log('TOPUP: Error occurred while loading script');
			};
			script.onload = () => {
				loadTopUp(topUp);
			};
			document.body.appendChild(script);
		} else {
			loadTopUp(topUp);
		}
	});
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
