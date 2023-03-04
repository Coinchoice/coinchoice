import type { PlasmoMessaging } from '@plasmohq/messaging';
import { Storage } from '@plasmohq/storage';
import type { Coin, StoredWallet } from '~types';
import type { Simulation } from '~types';
import type { TxRequest } from '~types/requests';
import { api, handleReqErr } from '~utils/api';
import { storageKeyCoin, storageKeyWallet } from '~utils/constants';

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
	const storage = new Storage();

	const coin = (await storage.get(storageKeyCoin)) as Coin;
	console.log('TX:SIMULATE BGSW: coin fetched', coin);

	const wallet = (await storage.get(storageKeyWallet)) as StoredWallet;
	console.log('TX:SIMULATE BGSW: wallet fetched', wallet);
	if (!coin.networks[wallet.network]) {
		throw new Error(
			`No coin address exists for network -- Coin: ${coin.ticker}, Network: ${wallet.network}`
		);
	}

	// Update the wallet with the selected coin at the point of simuilating the request.
	try {
		await api
			.put(`wallet/${wallet.id}`, {
				json: {
					// address: wallet.address,
					network: wallet.network,
					token: coin.networks[wallet.network],
					amount: 0,
				},
			})
			.json();
	} catch (e) {
		console.log('TX:SIMULATE BGSW ERROR: Cannot update wallet');
		await handleReqErr(e);
		return res.send({
			success: false,
			data: {},
		});
	}

	const { tx }: { tx: TxRequest } = req.body;
	const [txParams] = tx.params || [{}];
	// Proceed to simulate the transaction with Backend API
	const simParams = {
		value: txParams.value,
		from: txParams.from,
		to: txParams.to,
		input: txParams.data,
	};
	console.log('TX:SIMULATE BGSW: Simulate with params', simParams);
	try {
		const resp: Simulation = await api
			.post(`simulation`, {
				json: simParams,
			})
			.json();
		return res.send({
			success: true,
			data: resp,
		});
	} catch (e) {
		console.log('TX:SIMULATE BGSW ERROR: Cannot simulate tx');
		await handleReqErr(e);
	}

	return res.send({
		success: false,
		data: {},
	});
};

export default handler;
