export const getNetworkExplorer = (chainId: number, txId: string) => {
	switch (chainId) {
		case 5: {
			return `https://goerli.etherscan.io/tx/${txId}`;
		}
		case 80001: {
			return `https://mumbai.polygonscan.com/tx/${txId}`;
		}
		default: {
			return `https://etherscan.io/tx/${txId}`;
		}
	}
};
