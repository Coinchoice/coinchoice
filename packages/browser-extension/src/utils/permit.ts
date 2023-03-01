import type { BigNumber, Signer, Wallet } from 'ethers';
import { ethers } from 'ethers';
import { splitSignature } from 'ethers/lib/utils';

import type { ERC20MockWithPermit } from '../types/ERC20MockWithPermit';

const EIP712_DOMAIN_TYPE = [
	{ name: 'name', type: 'string' },
	{ name: 'version', type: 'string' },
	{ name: 'chainId', type: 'uint256' },
	{ name: 'verifyingContract', type: 'address' },
];

const EIP2612_TYPE = [
	{ name: 'owner', type: 'address' },
	{ name: 'spender', type: 'address' },
	{ name: 'value', type: 'uint256' },
	{ name: 'nonce', type: 'uint256' },
	{ name: 'deadline', type: 'uint256' },
];

const structure = (
	name: string,
	version: string,
	chainId: number,
	tokenAddress: string,
	nonce: string,
	value: string,
	owner: string,
	spender: string,
	deadline: string
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

const permitVersion = '1';

const buildData = async (
	amount: string,
	owner: string,
	spender: string,
	chainId: any,
	token: ERC20MockWithPermit,
	deadline: string
) => {
	const _name = await token.name();
	const version = '1';
	const value = amount;
	const nonce = await token.nonces(owner);
	return structure(
		_name,
		version,
		chainId,
		// @ts-ignore
		token.address,
		nonce.toString(),
		value,
		owner,
		spender,
		deadline
	);
};

export const Sign = async (
	chainId: number,
	userAddress: string,
	token: ERC20MockWithPermit,
	user: Wallet,
	amount: string,
	spender: string,
	deadline: string
) => {
	console.log(
		'build data params',
		amount,
		userAddress,
		spender,
		chainId,
		token,
		deadline
	);
	const data = await buildData(
		amount,
		userAddress,
		spender,
		chainId,
		token,
		deadline
	);
	console.log('data', data);
	const digest = await user._signTypedData(
		data.domain,
		data.types,
		data.message
	);
	const { v, r, s } = ethers.utils.splitSignature(digest);
	return { signature: digest, split: { v, r, s } };
};
