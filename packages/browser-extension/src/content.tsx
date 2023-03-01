import React, { FC } from 'react';
import { MantineProvider } from '@mantine/core';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import * as chain from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import '@rainbow-me/rainbowkit/styles.css';

import { ETH_GOERLI_ENDPOINT, POLYGON_MUMBAI_ENDPOINT } from './utils/env';

import Notification from './components/Notification';

const { chains, provider } = configureChains(
	[chain.mainnet, chain.polygon, chain.polygonMumbai, chain.goerli],
	[
		jsonRpcProvider({
			rpc(chain) {
				switch (chain.id) {
					// case (137):
					//   return { http: 'https://rpc.ankr.com/polygon' }
					// case (1):
					//   return { http: 'https://rpc.ankr.com/eth' }
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
	provider,
});

const ContentUI = () => {
	return (
		<MantineProvider>
			<WagmiConfig client={wagmiClient}>
				<RainbowKitProvider chains={chains}>
					<Notification />
				</RainbowKitProvider>
			</WagmiConfig>
		</MantineProvider>
	);
};

export default ContentUI;
