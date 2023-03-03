import type { PlasmoMessaging } from '@plasmohq/messaging';
import { Storage } from '@plasmohq/storage';
import type { Coin, StoredWallet } from '~types';
// import type { Simulation } from '~types';
// import type { TxRequest } from '~types/requests';
// import { api, handleReqErr } from '~utils/api';
import { storageKeyCoin, storageKeyWallet } from '~utils/constants';

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
	const storage = new Storage();

	const coin = (await storage.get(storageKeyCoin)) as Coin;
	console.log('TX:SUBMIT BGSW: coin fetched', coin);

	const wallet = (await storage.get(storageKeyWallet)) as StoredWallet;

	const { tx } = req.body.data;

	// Proceed to execute transaction submission to Backend API
	return res.send({
		success: true,
		data: {
			wallet,
			coin,
		},
	});
};

export default handler;
