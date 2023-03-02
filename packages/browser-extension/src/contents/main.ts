import detectEthereumProvider from '@metamask/detect-provider';
import { sendToBackground } from '@plasmohq/messaging';
import { ethers } from 'ethers';
import type { PlasmoCSConfig } from 'plasmo';
import { coinList } from '~utils/constants';

import { bus } from '../utils/bus';
import * as permit from '../utils/permit';
import { RPCProviderFacade } from '../utils/RPCProviderFacade';
import { getToken } from '../utils/token';

export const config: PlasmoCSConfig = {
	matches: ['<all_urls>'],
	world: 'MAIN',
};

const defaultCoin = coinList.find((coin) => !!coin.default);
const spender = '0x7E64d52D285E47b088f7b1df2438C1782099101a';

let coin = defaultCoin;
chrome.runtime.onMessage.addListener((req) => {
	console.log('COIN RELAY');
	console.log(req.body);
	if (req.body?.data?.ticker) {
		coin = req.body.data;
	}
});

async function onProvider(provider) {
	console.log('Ethereum successfully detected!', provider);

	const facade = new RPCProviderFacade();
	facade.wrap(provider);

	// Add mm listeners
	provider.on('connect', (connectInfo) => {
		bus.emit('mm:connect', { connectInfo });
	});
	provider.on('disconnect', (err) => {
		bus.emit('mm:disconnect', err);
	});
	provider.on('accountsChanged', (accounts: Array<string>) => {
		bus.emit('mm:accountsChanged', { accounts });
	});
	provider.on('chainChanged', (chainId: string) => {
		bus.emit('mm:chainChanged', { chainId });
	});

	try {
		const ethProvider = new ethers.providers.Web3Provider(
			// @ts-ignore
			window.ethereum
		);
		const signer = ethProvider.getSigner();
		// console.log('CS: signer', signer);

		const chainId = window.ethereum.chainId
			? parseInt(window.ethereum.chainId, 16)
			: 1;
		const wallet = {
			address: window.ethereum.selectedAddress,
			network: chainId,
		};

		bus.on('sign', async ({ amount }: { amount: string }) => {
			if (!Object.keys(coin.networks).includes(`${chainId}`)) {
				console.log(`Unsupported chain ${chainId}`);
				// TODO: If chainId is not supported, show message to switch networks
				bus.emit('ui:sign', {
					success: false,
					msg: `Unsupported chain: ${chainId}`,
				});
				return;
			}

			const token = await getToken(provider, signer, chainId, coin.ticker);
			const res = await permit.Sign(
				chainId,
				window.ethereum.selectedAddress,
				token,
				signer,
				amount,
				spender,
				ethers.constants.MaxUint256.toString()
			);

			console.log(res);
			bus.emit('ui:sign', { success: true });
		});

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
		await sendToBackground({
			name: 'wallet',
			body: {
				wallet,
			},
		});
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

	// If no wallet provider is detected, we will need to await a wallet connection
})();
