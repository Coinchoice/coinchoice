import type { NetworkChainIds } from './requests';

export type Coin = {
	ticker: string;
	name: string;
	icon: string;
	networks: NetworkChainIds[];
	default?: boolean;
};
