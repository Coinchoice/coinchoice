import { useState } from 'react';
import { useWallet } from 'use-wallet';

export default function CustomButton() {
	const [loading, setLoading] = useState(false);
	const wallet = useWallet();
	const label = wallet.isConnected() ? 'Disconnect' : 'Connect Custom';

	async function onClick() {
		setLoading(true);
		if (wallet.isConnected()) {
			await wallet.reset();
		} else {
			await wallet.connect();
		}
		setLoading(false);
	}

	return (
		<button onClick={onClick} disabled={loading}>
			{loading ? 'Loading...' : label}
		</button>
	);
}
