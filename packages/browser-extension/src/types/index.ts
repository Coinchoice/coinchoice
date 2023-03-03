import type { NetworkChainIds, TxRequest } from './requests';

export type Coin = {
	ticker: string;
	name: string;
	icon: string;
	networks: Partial<Record<NetworkChainIds, string | null>>;
	permit: boolean;
	default: boolean;
};

export type Simulation = {
	feeEth: number;
	feeToken: number;
	price: number;
	token: string;
	balance: {
		type: string;
		hex: string;
	};
};

export type BasicWallet = {
	network: NetworkChainIds;
	address: string;
};

export type GasPayload = {
	sim: Simulation;
	wallet: BasicWallet;
	tx: TxRequest;
};

export type StoredWallet = BasicWallet & {
	id: string; // The ID of the wallet in  DB
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
