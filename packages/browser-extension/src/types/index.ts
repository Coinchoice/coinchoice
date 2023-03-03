import type { NetworkChainIds, TxRequest } from './requests';

export type Coin = {
	ticker: string;
	name: string;
	icon: string;
	networks: Partial<Record<NetworkChainIds, string | null>>;
	permit: boolean;
	default: boolean;
};

export type Swap = {
	feeEth: number;
	feeToken: number;
	price: number;
	token: string;
	balance: string;
	chainId: number;
};

export type BasicWallet = {
	network: NetworkChainIds;
	address: string;
};

export type GasPayload = {
	swap: Swap;
	wallet: BasicWallet;
	tx: TxRequest;
};

export type StoredWallet = BasicWallet & {
	token: string;
	amount: number;
};

export type Signature = {
	signature: string;
	split: {
		v: number;
		r: string;
		s: string;
	};
};
