import fetch from 'isomorphic-fetch';
import ky from 'ky-universal';

import { API_HOST } from './env';

console.log('API_HOST', API_HOST);
export const api = ky.create({ prefixUrl: API_HOST, fetch });
