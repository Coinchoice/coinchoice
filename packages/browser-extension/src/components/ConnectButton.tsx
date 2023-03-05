import React, { useEffect, useState } from 'react';
import { Button } from '@mantine/core';
import { IconWallet } from '@tabler/icons-react';
import { useCeramicContext } from '../context';
import type { CeramicApi } from '@ceramicnetwork/common';
import type { ComposeClient } from '@composedb/client';
import { DIDSession } from 'did-session';

import { bus } from '~utils/bus';

export default function ConnectButton({ ...props }) {
	const [loading, setLoading] = useState(false);
	const clients = useCeramicContext();
	const { ceramic, composeClient } = clients;

	useEffect(() => {
		const authenticateCeramic = async (
			ceramic: CeramicApi,
			compose: ComposeClient
		) => {
			const sessionStr = localStorage.getItem('did');
			let session;
			if (sessionStr) {
				session = await DIDSession.fromSession(sessionStr);
			}
			if (session) {
				compose.setDID(session.did);
				ceramic.did = session.did;
			}
		};

		bus.on('connected', async () => {
			await authenticateCeramic(ceramic, composeClient);
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
			{...props}
		>
			Connect Wallet
		</Button>
	);
}
