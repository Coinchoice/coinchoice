import type { PlasmoMessaging } from '@plasmohq/messaging';
import { Storage } from '@plasmohq/storage';
import type { BasicWallet, Coin } from '~types';
import { api, handleReqErr } from '~utils/api';
import { storageKeyCoin, storageKeyWallet } from '~utils/constants';

import { useCeramicContext } from '../../../context';

// On wallet connection, we store the wallet, or create it.
// On wallet interaction, we update the wallet
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
	const storage = new Storage();
	const clients = useCeramicContext();
	const { ceramic, composeClient } = clients;

	const coin = (await storage.get(storageKeyCoin)) as Coin;
	console.log('WALLET BGSW: coin fetched', coin);

	// const createWallet = async (
	// 	address: string,
	// 	token: string,
	// 	network: number
	// ) => {
	// 	if (ceramic.did !== undefined) {
	// 		const wallet = await composeClient.executeQuery(`
	// 		mutation {
	// 		  createWallets(input: {
	// 			content: {
	// 			  address: "${address}"
	// 			  token: "${token}"
	// 			  network: "${network}"
	// 			  created: "${new Date().toISOString()}"
	// 			  owner: "${ceramic.did.id}"
	// 			}
	// 		  })
	// 		  {
	// 			document {
	// 			  body
	// 			}
	// 		  }
	// 		}
	// 	  `);
	// 	}
	// };

	// const getWallet = async (address: string) => {
	// 	const wallet = await composeClient.executeQuery(`
	// 	query {
	// 	  postsIndex(last:300) {
	// 		edges {
	// 		  node {
	// 			id
	// 			body
	// 			created
	// 			profile{
	// 			  id
	// 			  name
	// 			  username
	// 			}
	// 		  }
	// 		}
	// 	  }
	// 	}
	//   `);
	// };

	const { wallet }: { wallet: BasicWallet } = req.body;
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
};

export default handler;