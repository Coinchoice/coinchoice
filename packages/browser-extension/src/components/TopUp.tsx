import { useMessage } from '@plasmohq/messaging/hook';
import { useEffect, useState } from 'react';
import type { TopUp } from '~types';

import { bus } from '~utils/bus';

export default function TopUp() {
	const [topUp, setTopUp] = useState<TopUp | null>(null);
	useMessage<TopUp, string>(async (req, res) => {
		console.log('TOPUP onMessage');
		console.log(req);
		if (req.name === 'topup') {
			setTopUp(req.body);
		}
		return res.send('');
	});

	useEffect(() => {
		if (topUp !== null) {
			bus.emit('topup', topUp);
			setTopUp(null);
		}
	}, [topUp]);

	return null;
}
