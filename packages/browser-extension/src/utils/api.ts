import ky from 'ky-universal';

import { API_HOST } from './env';

export const api = ky.create({ prefixUrl: API_HOST });
