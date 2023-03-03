import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import Logo from 'data-base64:~assets/icon.png';

import { ETH_GOERLI_ENDPOINT } from './env';

const injected = injectedModule();

const onboard = Onboard({
	wallets: [injected],
	chains: [
		{
			id: '0x5',
			label: 'Goerli',
			token: 'ETH',
			rpcUrl: ETH_GOERLI_ENDPOINT,
		},
	],
	appMetadata: {
		name: 'CoinChoice',
		description: 'CoinChoice',
		icon: Logo,
		// icon: UsherIcon
		// icon: "https://app.usher.so/_next/static/media/Logo-Icon.d0dcf2d1.svg"
	},
	connect: { showSidebar: false },
	accountCenter: {
		desktop: {
			enabled: false,
		},
		mobile: {
			enabled: false,
		},
	},
});

export { onboard };
