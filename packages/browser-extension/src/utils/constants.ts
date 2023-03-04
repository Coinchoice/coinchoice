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
	},
	{
		ticker: 'USDC',
		name: 'USD Coin',
		icon: USDCIcon,
		networks: {
			[NetworkChainIds.GOERLI]: '0x07865c6E87B9F70255377e024ace6630C1Eaa37F',
		},
		default: false,
		permit: true,
	},
	{
		ticker: 'DAI',
		name: 'Dai',
		icon: DAIIcon,
		networks: {
			[NetworkChainIds.GOERLI]: '',
		},
		default: false,
		permit: true,
	},
	{
		ticker: 'USDT',
		name: 'Tether USD',
		icon: USDTIcon,
		networks: {
			[NetworkChainIds.GOERLI]: '',
		},
		default: false,
		permit: true,
	},
];

export const storageKeyCoin = 'coinchoice_storage__coin';
export const storageKeyWallet = 'coinchoice_storage__wallet';

export const relayerSpenderContractAddress = {
	[NetworkChainIds.GOERLI]: '0x7E64d52D285E47b088f7b1df2438C1782099101a',
};
