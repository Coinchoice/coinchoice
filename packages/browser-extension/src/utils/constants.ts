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
