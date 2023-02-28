import type { NetworkChainIds } from './requests';

export type Coin = {
	ticker: string;
	name: string;
	icon: string;
	networks: Partial<Record<NetworkChainIds, string | null>>;
	permit: boolean;
	default: boolean;
};
