import { useEffect } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
// import { RPCProviderFacade } from './injected/RPCProviderFacade';

const PlasmoOverlay = () => {
	useEffect(() => {
		(async () => {
			const provider = await detectEthereumProvider({ timeout: 10000 });
			if (provider) {
				console.log('Ethereum successfully detected!', provider);

				// From now on, this should always be true:
				// provider === window.ethereum

				// Access the decentralized web!

				// Legacy providers may only have ethereum.sendAsync
				// const chainId = await provider.request({
				// 	method: 'eth_chainId'
				// })
			} else {
				// if the provider is not detected, detectEthereumProvider resolves to null
				console.error('Please install MetaMask!');
			}
		})();
	}, []);

	useEffect(() => {
		// new RPCProviderFacade();
		console.log('HELLO FROM OVERLAY');
		if (window.ethereum) {
			console.log('wrapping window.ethereum');
			// this.wrap(window.ethereum);
			console.log('wrapping window.ethereum', window.ethereum);
			if (window.ethereum?.providers?.length) {
				// window.ethereum?.providers.forEach(this.wrap.bind(this));
				console.log('Providers: ', window.ethereum?.providers);
			}
		} else {
			console.log('adding ethereum#initialized event listener ');
			window.addEventListener('ethereum#initialized', () => {
				console.log('ethereum#initialized: wrapping window.ethereum');
				console.log('wrapping window.ethereum', window.ethereum);
				// this.wrap(window.ethereum);
			});
		}
	}, []);

	return (
		<span
			className="hw-top"
			style={{
				padding: 12,
			}}
		>
			HELLO WORLD TOP
		</span>
	);
};

export default PlasmoOverlay;
