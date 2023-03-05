import type { PlasmoMessaging } from '@plasmohq/messaging';
import { Storage } from '@plasmohq/storage';
import { useState } from 'react';
import type { BasicWallet, Coin, StoredWallet } from '~types';
import type { WalletDBModel } from '~types/db';
import { api, handleReqErr } from '~utils/api';
import { storageKeyCoin, storageKeyWallet } from '~utils/constants';

import { useCeramicContext } from '../../../context';

// On wallet connection, we store the wallet, or create it.
// On wallet interaction, we update the wallet
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
	const storage = new Storage();
	const clients = useCeramicContext();
	const { ceramic, composeClient } = clients;
	const [userWallet, setUserWallet] = useState({});

	const { wallet }: { wallet: BasicWallet } = req.body;

	const coin = (await storage.get(storageKeyCoin)) as Coin;
	console.log('WALLET BGSW: coin fetched', coin);

	const createWallet = async (
		address: string,
		token: string,
		network: number
	) => {
		console.log('createWallet');
		if (ceramic.did !== undefined) {
			// const profile = await composeClient.executeQuery(`
			// 	query {
			// 	viewer {
			// 		basicProfile {
			// 		id
			// 		}
			// 	}
			// 	}
			// `);
			const wallet = await composeClient.executeQuery(`
				mutation {
					createWallets(input: {
						content: {
						address: "${address}"
						token: "${token}"
						network: "${network}"
						created: "${new Date().toISOString()}"
						ownerId:  "${ceramic.did}"
						}
					})
					{
						document {
						body
						}
					}
				}
			`);
			console.log(wallet);
			await getWallet(address);
		}
	};

	const getWallet = async (address: string) => {
		console.log('getWallet');
		// const profile = await composeClient.executeQuery(`
		// query {
		//   viewer {
		// 	basicProfile {
		// 	  id
		// 	}
		//   }
		// }
		// `);
		// const wallets = await composeClient.executeQuery(`
		// 	query {
		// 		node (id: "${profile.data.viewer.basicProfile.id}") {
		// 		... on BasicProfile {
		// 			id
		// 			wallets (last:5) {
		// 			edges {
		// 				node {
		// 				address
		// 				token
		// 				network
		// 				created
		// 				}
		// 			}
		// 			}
		// 		}
		// 		}
		// `);
		const wallet = await composeClient.executeQuery(`
			query {
				node(address:"$${address}"){
					...on Wallets{
					address
					token
					network
					created
					}
				}
			}
	  	`);
		console.log(wallet.data);
		if (wallet.data?.node !== null)
			setUserWallet({
				address: wallet.data?.node.address,
				token: wallet.data?.node.token,
				network: wallet.data?.node.network,
				created: wallet.data?.node.created,
			});
	};

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

	// Test ceramic
	await createWallet(
		wallet.address,
		coin.networks[wallet.network],
		wallet.network
	);

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
				clientId: wallet.clientId,
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
			const putParams = {
				clientId: wallet.clientId,
				network: wallet.network, // This will constantly update the same wallet's network
				token,
				amount: 0,
			};
			const sWallet: StoredWallet = {
				id: foundWallet._id,
				address: wallet.address,
				...putParams,
			};
			await api
				.put(`wallet/${foundWallet._id}`, {
					json: putParams,
				})
				.json();

			// const fWallet: WalletDBModel = await api
			// 	.get(`wallet/${wallet.address}`)
			// 	.json();
			// console.log('WALLET BGSW: Updated Wallet', fWallet);

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
