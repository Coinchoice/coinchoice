import React, { useEffect, useState } from 'react';
import { Button } from '@mantine/core';
import { IconWallet } from '@tabler/icons-react';

import { bus } from '~utils/bus';

export default function ConnectButton() {
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		bus.on('connected', () => {
			setLoading(false);
		});
	}, []);

	async function onClick() {
		setLoading(true);
		bus.emit('connect');
	}

	return (
		<Button
			onClick={onClick}
			leftIcon={<IconWallet size={24} />}
			loading={loading}
		>
			Connect Wallet
		</Button>
	);
}
