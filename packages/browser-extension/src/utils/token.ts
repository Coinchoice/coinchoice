import { ethers } from 'ethers';

import ERC20 from '../abi/erc20.json';
import type { ERC20MockWithPermit } from '../types/ERC20MockWithPermit';

export const getToken = (
	provider: ethers.providers.Web3Provider,
	chainId: number,
	tokenAddress: string
) => {
	const signer = provider.getSigner();
	try {
		return new ethers.Contract(
			tokenAddress,
			new ethers.utils.Interface(ERC20),
			signer
		) as ERC20MockWithPermit;
	} catch (e) {
		console.log(e);
		try {
			return new ethers.Contract(
				tokenAddress,
				new ethers.utils.Interface(ERC20),
				provider
			) as ERC20MockWithPermit;
		} catch (e2) {
			console.log('signer', chainId, signer, tokenAddress);
			console.log('Provider', provider);
			return null;
		}
	}
};
