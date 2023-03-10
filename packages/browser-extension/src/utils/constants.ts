import DAIIcon from 'cryptocurrency-icons/svg/color/dai.svg';
import ETHIcon from 'cryptocurrency-icons/svg/color/eth.svg';
import USDCIcon from 'cryptocurrency-icons/svg/color/usdc.svg';
import USDTIcon from 'cryptocurrency-icons/svg/color/usdt.svg';

import type { Coin } from '../types';
import { NetworkChainIds } from '../types/requests';

export const signMethods = [
	'eth_sign',
	'eth_signTypedData',
	'eth_signTypedData_v1',
	'eth_signTypedData_v3',
	'eth_signTypedData_v4',
	'personal_sign',
] as const;

export const txMethods = ['eth_sendTransaction'] as const;

// List of web3 provider methods we want to intercept
export const interceptMethods = [...txMethods, ...signMethods] as const;

export const coinList: Coin[] = [
	{
		ticker: 'ETH',
		name: 'Ethereum',
		icon: ETHIcon,
		networks: {
			[NetworkChainIds.GOERLI]: null,
		},
		default: true,
		permit: false,
		units: 18,
	},
	{
		ticker: 'USDC',
		name: 'USD Coin',
		icon: USDCIcon,
		networks: {
			[NetworkChainIds.GOERLI]: '0x3E5A43B9C9Ae77AFBfFa248C733524C5aBb8875c',
		},
		default: false,
		permit: true,
		units: 6,
	},
	{
		ticker: 'DAI',
		name: 'Dai',
		icon: DAIIcon,
		networks: {
			[NetworkChainIds.GOERLI]: '0xBa8DCeD3512925e52FE67b1b5329187589072A55',
		},
		default: false,
		permit: true,
		units: 18,
	},
	{
		ticker: 'USDT',
		name: 'Tether USD',
		icon: USDTIcon,
		networks: {
			[NetworkChainIds.GOERLI]: '0x2E8D98fd126a32362F2Bd8aA427E59a1ec63F780',
		},
		default: false,
		permit: true,
		units: 6,
	},
];

export const storageKeyCoin = 'coinchoice_storage__coin';
export const storageKeyWallet = 'coinchoice_storage__wallet';
