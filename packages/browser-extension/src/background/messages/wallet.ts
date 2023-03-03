import type { PlasmoMessaging } from '@plasmohq/messaging';
import { Storage } from '@plasmohq/storage';
import type { BasicWallet, Coin, StoredWallet } from '~types';
import type { Swap } from '~types';
import type { TxRequest } from '~types/requests';
import { api } from '~utils/api';
import { storageKeyCoin, storageKeyWallet } from '~utils/constants';

const handleReqErr = async (e: any) => {
	if (e.name === 'HTTPError') {
		const eJson = await e.response.json();
		console.error(eJson);
	} else {
		console.error(e);
	}
};

// On wallet connection, we store the wallet, or create it.
// On wallet interaction, we update the wallet
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
	const storage = new Storage();

	const coin = (await storage.get(storageKeyCoin)) as Coin;
	console.log('WALLET BGSW: coin fetched', coin);

	if (req.body?.type === 'connect') {
		const { wallet }: { wallet: BasicWallet } = req.body.data;
		if (!coin.networks[wallet.network]) {
			throw new Error(
				`No coin address exists for network -- Coin: ${coin.ticker}, Network: ${wallet.network}`
			);
		}
		// Fetch wallet from backend
		const storedWallet = await api.get(`wallet/${wallet.address}`).json();
		console.log('WALLET BGSW: fetch wallet from store', storedWallet);
		if (!storedWallet) {
			// create the wallet
			try {
				await api
					.post(`wallet`, {
						json: {
							address: wallet.address,
							network: wallet.network,
							token: coin.networks[wallet.network],
							amount: 0,
						},
					})
					.json();
			} catch (e) {
				console.log('WALLET BGSW ERROR: Cannot create wallet');
				await handleReqErr(e);
			}
		} else {
			// update the wallet network
			// TODO: wallets should be fetched by address & network
			try {
				await api
					.put(`wallet/${wallet.address}`, {
						json: {
							network: wallet.network,
							token: coin.networks[wallet.network],
						},
					})
					.json();
			} catch (e) {
				console.log('WALLET BGSW ERROR: Cannot update wallet');
				await handleReqErr(e);
			}
		}

		await storage.set(storageKeyWallet, storedWallet);

		return res.send({
			success: true,
			data: {
				wallet: storedWallet,
				coin,
			},
		});
	}

	if (req.body?.type === 'tx-validate') {
		const wallet = (await storage.get(storageKeyWallet)) as StoredWallet;
		if (!Object.keys(coin.networks).includes(`${wallet.network}`)) {
			throw new Error(`Unsupported chain ${wallet.network}`);
		}
		return res.send({
			success: true,
			data: {
				wallet,
				coin,
			},
		});
	}

	if (req.body?.type === 'tx-simulate') {
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

		const { tx }: { tx: TxRequest } = req.body.data;

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
	}

	if (req.body?.type === 'tx-submit') {
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
	}

	res.send({
		success: false,
		data: {},
	});
};

export default handler;
