import type {
	interceptMethods,
	signMethods,
	txMethods,
} from '~utils/constants';

export type SignMethod = (typeof signMethods)[number];

export type TxMethod = (typeof txMethods)[number];

export type InterceptMethods = (typeof interceptMethods)[number];

export enum NetworkChainIds {
	MAINNET = 1,
	GOERLI = 5,
}

export interface JsonRpcRequest {
	id: string | undefined;
	jsonrpc: '2.0';
	method: string;
	params?: Array<any>;
}

export interface JsonRpcResponse {
	id: string | undefined;
	jsonrpc: '2.0';
	method: string;
	result?: unknown;
	error?: Error;
}

export type JsonRpcCallback = (
	error: Error,
	response: JsonRpcResponse
) => unknown;

export type ExternalProvider = {
	coinchoice?: boolean;
	providers?: ExternalProvider[];
	isMetaMask?: boolean;
	chainId?: string;
	isStatus?: boolean;
	host?: string;
	path?: string;
	selectedAddress?: string;
	sendAsync?: (request: JsonRpcRequest, callback: JsonRpcCallback) => void;
	send?: (
		methodOrPayload: string | JsonRpcRequest,
		paramsOrCallback?: Array<unknown> | JsonRpcCallback
	) => Promise<JsonRpcResponse> | void;
	request?: (request: JsonRpcRequest) => Promise<any>;
};

export type TxRequest = JsonRpcRequest | { method: any; params: any };

declare global {
	interface Window {
		ethereum: ExternalProvider;
		web3: {
			eth: any;
			__isMetaMaskShim__?: boolean;
		};
	}
}
