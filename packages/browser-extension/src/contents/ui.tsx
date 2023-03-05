import React from 'react';
import { MantineProvider } from '@mantine/core';
import type { PlasmoCSConfig } from 'plasmo';
import { Notifications } from '@mantine/notifications';

import Notification from '../components/Notification';
import TopUp from '../components/TopUp';

export const config: PlasmoCSConfig = {
	matches: ['<all_urls>'],
};

const ContentUI = () => {
	return (
		<MantineProvider>
			<Notification />
			<TopUp />
			<Notifications />
		</MantineProvider>
	);
};

export default ContentUI;
