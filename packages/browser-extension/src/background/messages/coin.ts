import type { PlasmoMessaging } from '@plasmohq/messaging';
import { Storage } from '@plasmohq/storage';
import type { Coin } from '~types';
import { storageKeyCoin } from '~utils/constants';

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
	const storage = new Storage();

	let data = {};
	if (req.body.type === 'set') {
		// Set selected coin in backend
		const coin = req.body?.data as Coin;
		await storage.set(storageKeyCoin, coin);
		data = coin;
	}
	if (req.body.type === 'get') {
		const coin = (await storage.get(storageKeyCoin)) as Coin;
		// Fetch selected coin from backend
		// const coin = {} as Coin;
		// storage.set(storageKeyCoin, coin);
		data = coin;
	}

	res.send({
		success: true,
		data,
	});
};

export default handler;
