import type { PlasmoMessaging } from '@plasmohq/messaging';
// import { sendToContentScript } from '@plasmohq/messaging';
import { Storage } from '@plasmohq/storage';
import type { Coin, StoredWallet } from '~types';
import { coinList, storageKeyCoin, storageKeyWallet } from '~utils/constants';

// Here we manage coin selection in local storage
// At the point there is a wallet interaction, this is used as the source of truth and wallets are updated accordingly.
// However, where a coin is not auto-selected, it will be fetched from the store
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
	const storage = new Storage();

	let data = {};
	if (req.body.type === 'set') {
		const coin = req.body?.data as Coin;
		await storage.set(storageKeyCoin, coin);
		data = coin;
	}
	if (req.body.type === 'get') {
		let coin = (await storage.get(storageKeyCoin)) as Coin;
		if (!coin) {
			// Get wallet from local storage
			const wallet = (await storage.get(storageKeyWallet)) as StoredWallet;
			if (wallet) {
				const coinFromWallet = coinList.find(
					(c) => c.networks[wallet.network] === wallet.token
				);
				if (coinFromWallet) {
					coin = coinFromWallet;
				}
			}
		}
		data = coin;
	}

	// await sendToContentScript({
	// 	name: 'coin',
	// 	body: {
	// 		data: {
	// 			hello: 'world',
	// 		},
	// 	},
	// });

	res.send({
		success: true,
		data,
	});
};

export default handler;
