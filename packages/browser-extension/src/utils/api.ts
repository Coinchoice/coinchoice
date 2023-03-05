import fetch from 'isomorphic-fetch';
import ky from 'ky-universal';

import { API_HOST } from './env';

export const api = ky.create({ prefixUrl: API_HOST, fetch, timeout: 30000 });

export const handleReqErr = async (e: any) => {
	if (e.name === 'HTTPError') {
		const eJson = await e.response.json();
		console.error(eJson);
	} else {
		console.error(e);
	}
};
