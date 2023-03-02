import type { NetworkChainIds } from './requests';

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
};

export type StoredWallet = BasicWallet & {
	token: string;
	amount: number;
};
