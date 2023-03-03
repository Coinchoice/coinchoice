import { sendToBackground } from '@plasmohq/messaging';
import type { BasicWallet, Signature } from '~types';
import type { TxRequest } from '~types/requests';
import { bus } from '~utils/bus';

bus.on('connect-wallet', async ({ wallet }: { wallet: BasicWallet }) => {
	try {
		if (!wallet.address) {
			return null;
		}
		await sendToBackground({
			name: 'wallet',
			body: {
				type: 'connect',
				data: {
					wallet,
				},
			},
		});
		console.log('SCOPED CS: Wallet Set', wallet);
		bus.emit('resp:connect-wallet', { err: null, resp: null });
	} catch (e) {
		bus.emit('resp:connect-wallet', { err: e, resp: null });
	}
});

bus.on(
	'sign-complete',
	async ({
		success,
		sig,
		tx,
	}: {
		success: boolean;
		sig: Signature;
		tx: TxRequest;
	}) => {
		if (success) {
			// Submit meta-tx in API request for swap transaction
			await sendToBackground({
				name: 'wallet',
				body: {
					type: 'tx-submit',
					data: {
						tx,
						sig,
					},
				},
			});
		}
	}
);

bus.on('tx-validate', async () => {
	try {
		await sendToBackground({
			name: 'wallet',
			body: {
				type: 'tx-validate',
			},
		});
		bus.emit('resp:tx-validate', { err: null, resp: null });
	} catch (e) {
		bus.emit('resp:tx-validate', { err: e, resp: null });
	}
});

bus.on('tx-simulate', async ({ tx }: { tx: TxRequest }) => {
	try {
		const simResp = await sendToBackground({
			name: 'wallet',
			body: {
				type: 'tx',
				data: {
					tx,
				},
			},
		});
		bus.emit('resp:tx-simulate', {
			err: null,
			resp: simResp,
		});
	} catch (e) {
		bus.emit('resp:tx-simulate', { err: e, resp: null });
	}
});
