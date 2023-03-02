import { ethers } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import * as ERC20 from './erc20.json';
import { ERC20MockWithPermit } from '../types/ERC20MockWithPermit';

const TOKEN_META = {
	USDC: { decimals: 6, symbol: 'USDC', name: 'USD Coin' },
	DAI: { decimals: 18, symbol: 'DAI', name: 'DAI Stablecoin' },
	WBTC: { decimals: 8, symbol: 'WBTC', name: 'Wrapped Bitcoin' },
};

export const TOKEN_DICT: { [id: string]: { [chainId: number]: string } } = {
	USDC: {
		1: '0xe9DcE89B076BA6107Bb64EF30678efec11939234',
		5: '0x65aFADD39029741B3b8f0756952C74678c9cEC93',
		80001: '0xe9DcE89B076BA6107Bb64EF30678efec11939234',
		137: '0xe9DcE89B076BA6107Bb64EF30678efec11939234',
	},
	DAI: {},
	WETH: {
		5: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
		80001: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
	},
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
