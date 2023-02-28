import ky from 'ky';
import { API_HOST } from './env';

export const api = ky.create({prefixUrl: API_HOST});
