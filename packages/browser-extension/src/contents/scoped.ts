import { sendToBackground } from '@plasmohq/messaging';
import type { BasicWallet } from '~types';
import { bus } from '~utils/bus';

async function connectWallet(wallet: BasicWallet) {
	if (!wallet.address) {
		return null;
	}
	return sendToBackground({
		name: 'wallet',
		body: {
			type: 'connect',
			data: {
				wallet,
			},
		},
	});
}

bus.on('connect-wallet', async ({ wallet }) => {
	try {
		await connectWallet(wallet as BasicWallet);
		console.log('SCOPED CS: Wallet Set', wallet);
	} catch (e) {
		console.log('SCOPED CS ERROR:');
		console.error(e);
	}
});
