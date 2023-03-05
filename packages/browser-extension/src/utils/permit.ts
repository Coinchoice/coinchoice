import { _TypedDataEncoder } from '@ethersproject/hash';
import { ethers } from 'ethers';

// import { splitSignature } from 'ethers/lib/utils';
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

// const permitVersion = '1';

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
	console.log('permit: build data process', {
		nonce,
		token: token.address,
	});
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

const signTypedData = async (
	provider: ethers.providers.Web3Provider,
	from: string,
	msgParams: string
) => {
	const params = [from, msgParams];
	// const method = 'eth_signTypedData_v4';
	const method = 'coinchoice_signTypedData_v4';

	const result = await provider.send(method, params);
	// if (err) return console.dir(err);
	// 		if (result.error) {
	// 			alert(result.error.message);
	// 		}
	// 		if (result.error) return console.error('ERROR', result);
	console.log('TYPED SIGNED');
	console.log(result);

	// const recovered = sigUtil.recoverTypedSignature({
	// 	data: JSON.parse(msgParams),
	// 	signature: result.result,
	// 	version: sigUtil.
	// });

	// if (
	// 	ethUtil.toChecksumAddress(recovered) === ethUtil.toChecksumAddress(from)
	// ) {
	// 	alert('Successfully recovered signer as ' + from);
	// } else {
	// 	alert(
	// 		'Failed to verify signer when comparing ' + result + ' to ' + from
	// 	);
	// }

	return result;
};

export const Sign = async (
	provider: ethers.providers.Web3Provider,
	chainId: number,
	userAddress: string,
	token: ERC20MockWithPermit,
	amount: string,
	spender: string,
	deadline: string
) => {
	console.log(
		'permit: build data params',
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
	console.log('permit: data', data);

	const populated = await _TypedDataEncoder.resolveNames(
		data.domain,
		data.types,
		data.message,
		(name: string) => {
			return provider.resolveName(name);
		}
	);

	// Example Reference: https://codesandbox.io/s/335wo
	const digest = await signTypedData(
		provider,
		userAddress.toLowerCase(),
		JSON.stringify(
			_TypedDataEncoder.getPayload(
				populated.domain,
				data.types,
				populated.value
			)
		)
	);
	const { v, r, s } = ethers.utils.splitSignature(digest);
	return { signature: digest, split: { v, r, s } };
};
