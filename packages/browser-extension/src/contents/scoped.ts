import { sendToBackground } from '@plasmohq/messaging';
import type { BasicWallet, GasPayload, Signature } from '~types';
import type { TxRequest } from '~types/requests';
import { bus } from '~utils/bus';

bus.on('connect-wallet', async ({ wallet }: { wallet: BasicWallet }) => {
	try {
		// console.log('SCOPED CS: connect-wallet', wallet);
		if (!wallet.address) {
			return null;
		}
		await sendToBackground({
			name: 'wallet/connect',
			body: {
				wallet,
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
		payload,
	}: {
		success: boolean;
		sig: Signature;
		payload: GasPayload;
	}) => {
		if (success) {
			// Submit meta-tx in API request for swap transaction
			await sendToBackground({
				name: 'tx/submit',
				body: {
					sig,
					payload,
				},
			});
		}
	}
);

bus.on('tx-validate', async () => {
	try {
		await sendToBackground({
			name: 'tx/validate',
		});
		bus.emit('resp:tx-validate', { err: null, resp: null });
	} catch (e) {
		bus.emit('resp:tx-validate', { err: e, resp: null });
	}
});

bus.on('tx-simulate', async ({ tx }: { tx: TxRequest }) => {
	try {
		console.log('SCOPED CS: Simulate', { tx });
		const simResp = await sendToBackground({
			name: 'tx/simulate',
			body: {
				tx,
			},
		});
		if (!simResp.success) {
			throw new Error('Cannot simulate tx');
		}
		bus.emit('resp:tx-simulate', {
			err: null,
			resp: simResp,
		});
	} catch (e) {
		console.log('SCOPED CS: Simulate Error', e);
		bus.emit('resp:tx-simulate', { err: e, resp: null });
	}
});
