import { ethers } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import ERC20 from './erc20.json';
import { ERC20MockWithPermit } from '../types/ERC20MockWithPermit';

const TOKEN_META = {
	USDC: { decimals: 6, symbol: 'USDC', name: 'USD Coin' },
	DAI: { decimals: 18, symbol: 'DAI', name: 'DAI Stablecoin' },
	WBTC: { decimals: 8, symbol: 'WBTC', name: 'Wrapped Bitcoin' },
};

const TOKEN_DICT: { [id: string]: { [chainId: number]: string } } = {
	USDC: {
		1: '0xe9DcE89B076BA6107Bb64EF30678efec11939234',
		5: '0xe9DcE89B076BA6107Bb64EF30678efec11939234',
		80001: '0xe9DcE89B076BA6107Bb64EF30678efec11939234',
		137: '0xe9DcE89B076BA6107Bb64EF30678efec11939234',
	},
	DAI: {},
};

export const getToken = (
	signer: JsonRpcSigner,
	chainId: number,
	id: string,
) => {
	return new ethers.Contract(
		TOKEN_DICT[id][chainId],
		new ethers.utils.Interface(ERC20.abi),
		signer,
	) as ERC20MockWithPermit;
};
