import detectEthereumProvider from '@metamask/detect-provider';
import { getPort } from '@plasmohq/messaging/port';
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

(async () => {
	const provider = await detectEthereumProvider({
		timeout: 10000,
	});
	if (provider) {
		console.log('Ethereum successfully detected!', provider);

		const facade = new RPCProviderFacade();
		facade.wrap(provider);

		try {
			const ethProvider = new ethers.providers.Web3Provider(
				// @ts-ignore
				window.ethereum
			);
			const signer = ethProvider.getSigner();
			console.log('signer', signer);

			const coinPort = getPort('coin');
			let coin = defaultCoin;
			coinPort.onMessage((msg) => {
				console.log('MAIN coinport', msg);
			});
			if (coinPort?.data?.ticker) {
				coin = coinPort.data;
			}

			const chainId = window.ethereum.chainId
				? parseInt(window.ethereum.chainId, 16)
				: 1;

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
		} catch (e) {
			console.log('error');
			console.error(e);
		}

		console.log('DETECTED DONE');
	}
})();
