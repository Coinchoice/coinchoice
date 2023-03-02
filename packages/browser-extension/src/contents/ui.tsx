import React from 'react';
import { MantineProvider } from '@mantine/core';
import type { PlasmoCSConfig } from 'plasmo';

import Notification from '../components/Notification';

export const config: PlasmoCSConfig = {
	matches: ['<all_urls>'],
};

const ContentUI = () => {
	return (
		<MantineProvider>
			<Notification />
		</MantineProvider>
	);
};

export default ContentUI;
