import type { PlasmoMessaging } from '@plasmohq/messaging';
import { Storage } from '@plasmohq/storage';
import type { Coin, StoredWallet } from '~types';
import { coinList, storageKeyCoin, storageKeyWallet } from '~utils/constants';

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
	const storage = new Storage();

	let coin = (await storage.get(storageKeyCoin)) as Coin;
	if (!coin) {
		console.log('COIN BGSW: No coin exists in storage');
		// Get wallet from local storage
		const wallet = (await storage.get(storageKeyWallet)) as StoredWallet;
		if (wallet) {
			const coinFromWallet = coinList.find(
				(c) =>
					(c.networks[wallet.network] || '').toLowerCase() ===
					(wallet.token || '').toLowerCase()
			);
			if (coinFromWallet) {
				console.log('COIN BGSW: Derived coin from wallet', coinFromWallet);
				coin = coinFromWallet;
			}
		}
	}

	res.send({
		success: true,
		data: coin,
	});
};

export default handler;
