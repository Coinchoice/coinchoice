import type { PlasmoMessaging } from '@plasmohq/messaging';
import { Storage } from '@plasmohq/storage';
import type { Coin, StoredWallet } from '~types';
import { storageKeyCoin, storageKeyWallet } from '~utils/constants';

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
	const storage = new Storage();

	const coin = (await storage.get(storageKeyCoin)) as Coin;
	console.log('TX:VALIDATE BGSW: coin fetched', coin);

	const wallet = (await storage.get(storageKeyWallet)) as StoredWallet;
	if (!Object.keys(coin.networks).includes(`${wallet.network}`)) {
		throw new Error(`Unsupported chain ${wallet.network}`);
	}
	if (!coin.networks[wallet.network]) {
		throw new Error(`No valid token selected`);
	}

	return res.send({
		success: true,
		data: {
			wallet,
			coin,
		},
	});
};

export default handler;
