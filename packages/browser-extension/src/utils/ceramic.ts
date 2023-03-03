import type { CeramicApi } from '@ceramicnetwork/common';
import type { ComposeClient } from '@composedb/client';
import { EthereumWebAuth, getAccountId } from '@didtools/pkh-ethereum';
import { DIDSession } from 'did-session';
import type { JsonRpcRequest } from '~types/requests';

/**
 * Checks localStorage for a stored DID Session. If one is found we authenticate it, otherwise we create a new one.
 * @returns Promise<DID-Session> - The User's authenticated sesion.
 */
export const authenticateCeramic = async (
	ceramic: CeramicApi,
	compose: ComposeClient
) => {
	const sessionStr = localStorage.getItem('did'); // for production you will want a better place than localStorage for your sessions.
	let session;

	if (sessionStr) {
		session = await DIDSession.fromSession(sessionStr);
	}

	if (!session || (session.hasSession && session.isExpired)) {
		if (window.ethereum === null || window.ethereum === undefined) {
			throw new Error('No injected Ethereum provider found.');
		}

		// We enable the ethereum provider to get the user's addresses.
		const ethProvider = window.ethereum;
		// request ethereum accounts.
		const req = { method: 'eth_requestAccounts' } as JsonRpcRequest;
		const addresses = await window.ethereum.request(req);

		const accountId = await getAccountId(ethProvider, addresses[0]);
		const authMethod = await EthereumWebAuth.getAuthMethod(
			ethProvider,
			accountId
		);

		/**
		 * Create DIDSession & provide capabilities that we want to access.
		 * @NOTE: Any production applications will want to provide a more complete list of capabilities.
		 *        This is not done here to allow you to add more datamodels to your application.
		 */
		session = await DIDSession.authorize(authMethod, {
			resources: ['ceramic://*'],
		});
		// Set the session in localStorage.
		localStorage.setItem('did', session.serialize());
	}

	// Set our Ceramic DID to be our session DID.
	compose.setDID(session.did);
	ceramic.did = session.did;
	return;
};
