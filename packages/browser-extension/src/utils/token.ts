import { ethers, Wallet } from 'ethers';

import ERC20 from '../abi/erc20.json';
import type { ERC20MockWithPermit } from '../types/ERC20MockWithPermit';

const TOKEN_META = {
	USDC: { decimals: 6, symbol: 'USDC', name: 'USD Coin' },
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
	provider: any,
	signer: Wallet,
	chainId: number,
	id: string
) => {
	try {
		return new ethers.Contract(
			TOKEN_DICT[id][chainId],
			new ethers.utils.Interface(ERC20),
			signer
		) as ERC20MockWithPermit;
	} catch (e) {
		console.log(e);
		try {
			return new ethers.Contract(
				TOKEN_DICT[id][chainId],
				new ethers.utils.Interface(ERC20),
				provider
			) as ERC20MockWithPermit;
		} catch (e2) {
			console.log('signer', chainId, signer, TOKEN_DICT[id][chainId]);
			console.log('Provider', provider);
			return null;
		}
	}
};
