import type { PlasmoMessaging } from '@plasmohq/messaging';
import { Storage } from '@plasmohq/storage';
import pick from 'lodash/pick';
import type { BasicWallet, Coin, StoredWallet } from '~types';
import type { WalletDBModel } from '~types/db';
import { api, handleReqErr } from '~utils/api';
import { storageKeyCoin, storageKeyWallet } from '~utils/constants';

// On wallet connection, we store the wallet, or create it.
// On wallet interaction, we update the wallet
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
	const storage = new Storage();

	const { wallet }: { wallet: BasicWallet } = req.body;

	const coin = (await storage.get(storageKeyCoin)) as Coin;
	console.log('WALLET BGSW: coin fetched', coin);

	let token = '';
	if (coin) {
		if (coin.networks[wallet.network]) {
			token = coin.networks[wallet.network];
		} else {
			throw new Error(
				`No coin address exists for network -- Coin: ${coin.ticker}, Network: ${wallet.network}`
			);
		}
	}

	// TODO: We need to create an endpoint that searches for wallet by Wallet Address and Network -- as fetching all wallets will not scale
	// Fetch wallet from backend
	const foundWallet: WalletDBModel = await api
		.get(`wallet/${wallet.address}`)
		.json();
	console.log('WALLET BGSW: found wallet', foundWallet);

	console.log('WALLET BGSW: fetch wallet from store', foundWallet);
	if (!foundWallet) {
		// create the wallet
		try {
			const cWallet = {
				address: wallet.address,
				network: wallet.network,
				token,
				amount: 0,
			};
			const createWalletResp: WalletDBModel = await api
				.post(`wallet`, {
					json: cWallet,
				})
				.json();

			const sWallet: StoredWallet = {
				id: createWalletResp._id,
				...cWallet,
			};
			await storage.set(storageKeyWallet, sWallet);

			return res.send({
				success: true,
				data: {
					wallet: sWallet,
					coin,
				},
			});
		} catch (e) {
			console.log('WALLET BGSW ERROR: Cannot create wallet');
			await handleReqErr(e);
		}
	} else {
		// update the wallet network
		try {
			const sWallet: StoredWallet = {
				id: foundWallet._id,
				address: wallet.address,
				network: wallet.network, // This will constantly update the same wallet's network
				token,
				amount: 0,
			};
			await api
				.put(`wallet/${foundWallet._id}`, {
					json: pick(sWallet, ['network', 'token', 'amount']),
				})
				.json();

			await storage.set(storageKeyWallet, sWallet);

			return res.send({
				success: true,
				data: {
					wallet: sWallet,
					coin,
				},
			});
		} catch (e) {
			console.log('WALLET BGSW ERROR: Cannot update wallet');
			await handleReqErr(e);
		}
	}

	return res.send({
		success: false,
		data: {
			wallet: {},
			coin,
		},
	});
};

export default handler;
