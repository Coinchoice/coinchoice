import { JsonRpcSigner } from '@ethersproject/providers';
import { ethers, Wallet } from 'ethers';
import { ERC20MockWithPermit } from 'src/types/ERC20MockWithPermit';

const structure = (
	name: string,
	version: string,
	chainId: number,
	tokenAddress: string,
	nonce: string,
	value: string,
	owner: string,
	spender: string,
	deadline: string,
) => {
	return {
		types: {
			Permit: [
				{
					name: 'owner',
					type: 'address',
				},
				{
					name: 'spender',
					type: 'address',
				},
				{
					name: 'value',
					type: 'uint256',
				},
				{
					name: 'nonce',
					type: 'uint256',
				},
				{
					name: 'deadline',
					type: 'uint256',
				},
			],
		},
		primaryType: 'Permit',
		domain: {
			name: name,
			version: version,
			chainId: chainId,
			verifyingContract: tokenAddress,
		},
		message: {
			owner: owner,
			spender: spender,
			value: value,
			nonce: nonce,
			deadline: deadline,
		},
	};
};

const buildData = async (
	amount: string,
	owner: string,
	spender: string,
	chainId: any,
	token: ERC20MockWithPermit,
	deadline: string,
) => {
	const _name = await token.name();
	const version = '1';
	const value = amount;
	const nonce = await token.nonces(owner);
	return structure(
		_name,
		version,
		chainId,
		token.address,
		nonce.toString(),
		value,
		owner,
		spender,
		deadline,
	);
};

export const Sign = async (
	chainId: number,
	token: ERC20MockWithPermit,
	signer: JsonRpcSigner | Wallet,
	address: string,
	amount: string,
	spender: string,
	deadline: string,
) => {
	const data = await buildData(
		amount,
		address,
		spender,
		chainId,
		token,
		deadline,
	);
	console.log('data', data);
	const digest = await signer._signTypedData(
		data.domain,
		data.types,
		data.message,
	);
	const { v, r, s } = ethers.utils.splitSignature(digest);
	return { signature: digest, split: { v, r, s } };
};
