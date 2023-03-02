import React, { useEffect } from 'react';
import { MantineProvider } from '@mantine/core';
import {
	getDefaultWallets,
	RainbowKitProvider,
	darkTheme,
} from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import * as chain from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { ProviderRpcError } from '@wagmi/core';
import detectEthereumProvider from '@metamask/detect-provider';
import type { PlasmoCSConfig, PlasmoGetStyle } from 'plasmo';
// import type { BaseProvider } from '@metamask/providers';

import { ETH_GOERLI_ENDPOINT, POLYGON_MUMBAI_ENDPOINT } from '../utils/env';

// import { bus } from '../utils/bus';
import Notification from '../components/Notification';

import styleText from 'data-text:@rainbow-me/rainbowkit/styles.css';

export const config: PlasmoCSConfig = {
	matches: ['<all_urls>'],
	// world: 'MAIN',
};

export const getStyle: PlasmoGetStyle = () => {
	const style = document.createElement('style');
	style.textContent = styleText;
	return style;
};

const { chains, provider } = configureChains(
	[
		// chain.mainnet, chain.polygon, chain.polygonMumbai,
		chain.goerli,
	],
	[
		jsonRpcProvider({
			rpc(chain) {
				switch (chain.id) {
					// case (137):
					//   return { http: POLYGON_MAINNET_ENDPOINT }
					// case (1):
					//   return { http: ETH_MAINNET_ENDPOINT }
					case 5:
						return { http: ETH_GOERLI_ENDPOINT };
					default: // mumbai
						return { http: POLYGON_MUMBAI_ENDPOINT };
				}
			},
		}),
		publicProvider(),
	]
);

const { connectors } = getDefaultWallets({
	appName: 'CoinChoice',
	chains,
});

const wagmiClient = createClient({
	autoConnect: true,
	connectors,
	// connectors: [
	// 	new MetaMaskConnector({
	// 		chains: [
	// 			// chain.mainnet,
	// 			// chain.polygon,
	// 			// chain.polygonMumbai,
	// 			chain.goerli,
	// 		],
	// 		options: {
	// 			shimChainChangedDisconnect: false,
	// 		},
	// 	}),
	// 	// connectors,
	// ],
	provider,
});

const ContentUI = () => {
	useEffect(() => {
		console.log('window.eth', window.ethereum);
	}, []);
	// const [account, setAccount] = useState<string>('');

	// useEffect(() => {
	// 	(async () => {
	// 		// const ep = await detectEthereumProvider({ timeout: 10000 });
	// 		// console.log('providers-cs:', ep, provider);
	// 		// console.log('window-eth-cs:', window.ethereum);
	// 		// console.log('window-cs:', window);
	// 	})();
	// }, []);

	// useEffect(() => {
	// 	(async () => {
	// 		console.log('HELLO WORLD!');
	// 		const provider = (await detectEthereumProvider({
	// 			timeout: 10000,
	// 		})) as BaseProvider;
	// 		console.log(
	// 			'provider',
	// 			provider,
	// 			provider.isConnected,
	// 			provider.isConnected() ? 'connected!' : 'no connection'
	// 		);
	// 		provider.on('connect', (connectInfo) => {
	// 			console.log('connect', connectInfo);
	// 		});
	// 		provider.on('disconnect', (err: ProviderRpcError) => {
	// 			console.log('disconnect', err);
	// 		});
	// 		provider.on('accountsChanged', (accounts: Array<string>) => {
	// 			console.log('accountsChanged', accounts);
	// 		});
	// 		provider.on('chainChanged', (chainId: string) => {
	// 			console.log('chainChanged', chainId);
	// 		});
	// 		if (provider.isConnected()) {
	// 			if (provider?.selectedAddress) {
	// 				// setAccount(provider.selectedAddress);
	// 				console.log('address', provider.selectedAddress);
	// 			}
	// 		}
	// 	})();
	// }, []);

	return (
		<WagmiConfig client={wagmiClient}>
			<MantineProvider>
				<RainbowKitProvider chains={[chain.goerli]}>
					<Notification />
				</RainbowKitProvider>
			</MantineProvider>
		</WagmiConfig>
	);
};

export default ContentUI;
