import type { PlasmoMessaging } from '@plasmohq/messaging';
import { Storage } from '@plasmohq/storage';
import { storageKeyCoin } from '~utils/constants';

const handler: PlasmoMessaging.PortHandler = async (req, res) => {
	// Get coin here
	const storage = new Storage();
	const coin = await storage.get(storageKeyCoin);

	res.send({
		data: coin,
	});
};

export default handler;
