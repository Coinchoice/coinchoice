import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

import manifest from './manifest.json';

export default defineConfig({
	build: {
		rollupOptions: {
			input: {
				inspector: resolve(__dirname, 'src/index.html'),
				appCode: resolve(__dirname, 'src/Root.tsx'),
			},
		},
	},
	plugins: [react(), crx({ manifest })],
});
