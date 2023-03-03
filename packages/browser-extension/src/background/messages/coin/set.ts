import type { PlasmoMessaging } from '@plasmohq/messaging';
import { Storage } from '@plasmohq/storage';
import type { Coin } from '~types';
import { storageKeyCoin } from '~utils/constants';

// Here we manage coin selection in local storage
// At the point there is a wallet interaction, this is used as the source of truth and wallets are updated accordingly.
// However, where a coin is not auto-selected, it will be fetched from the store
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
	const storage = new Storage();

	const coin = req.body as Coin;
	await storage.set(storageKeyCoin, coin);
	console.log('COIN BGSW: Successfully set coin', coin);

	return res.send({
		success: true,
		data: coin,
	});
};

export default handler;
