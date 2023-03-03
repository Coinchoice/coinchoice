import type { PlasmoMessaging } from '@plasmohq/messaging';
import { Storage } from '@plasmohq/storage';
import type { Coin, StoredWallet } from '~types';
import type { Swap } from '~types';
import type { TxRequest } from '~types/requests';
import { api, handleReqErr } from '~utils/api';
import { storageKeyCoin, storageKeyWallet } from '~utils/constants';

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
	const storage = new Storage();

	const coin = (await storage.get(storageKeyCoin)) as Coin;
	console.log('WALLET BGSW: coin fetched', coin);

	const wallet = (await storage.get(storageKeyWallet)) as StoredWallet;
	if (!coin.networks[wallet.network]) {
		throw new Error(
			`No coin address exists for network -- Coin: ${coin.ticker}, Network: ${wallet.network}`
		);
	}

	// Update the wallet with the selected coin at the point of simuilating the request.
	try {
		await api.put(`wallet/${wallet.address}`, {
			json: {
				token: coin.networks[wallet.network],
			},
		});
	} catch (e) {
		console.log('WALLET BGSW ERROR: Cannot update wallet');
		await handleReqErr(e);
	}

	const { tx }: { tx: TxRequest } = req.body;

	// Proceed to simulate the transaction with Backend API
	const resp: Swap = await api
		.post(`/simulation`, {
			json: {
				value: tx.params!.value,
				from: tx.params!.from,
				to: tx.params!.to,
				input: tx.params!.input,
			},
		})
		.json();

	return res.send({
		success: true,
		data: resp,
	});
};

export default handler;
