import { useEffect } from 'react';
import { RPCProviderFacade } from './injected/RPCProviderFacade';

const PlasmoOverlay = () => {
	useEffect(() => {
		new RPCProviderFacade();
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
