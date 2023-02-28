// Check type of RPC request
import type {
	JsonRpcRequest,
	NetworkChainIds,
	SignMethod,
	TxMethod,
} from '~types/requests';

import { interceptMethods, signMethods, txMethods } from './constants';

/**
 * HOF generates predicate to determine membership of list
 * @param list List of strings
 * @returns (el: string) => boolean
 */
function isMember<T extends readonly string[]>(
	list: T
): (el: string | undefined) => boolean {
	return (el: string | undefined) => {
		if (typeof el == 'undefined') return false;
		return list.includes(el);
	};
}
export const isIntercept = isMember(interceptMethods);

export const isTxMethod = (x: string): x is TxMethod => {
	return txMethods.includes(x as TxMethod);
};

export const isSignMethod = (x: string): x is SignMethod => {
	return signMethods.includes(x as SignMethod);
};

export const isJsonRpcRequest = (
	methodOrPayload: string | JsonRpcRequest
): methodOrPayload is JsonRpcRequest => {
	return (methodOrPayload as JsonRpcRequest)?.jsonrpc !== undefined;
};

export const isSupportedNetwork = (id: NetworkChainIds | NetworkChainIds[]) => {
	let ids = id;
	if (!Array.isArray(ids)) {
		ids = [ids];
	}
	return !!ids.find((id) => window.ethereum.chainId === `0x${id.toString(16)}`);
};
