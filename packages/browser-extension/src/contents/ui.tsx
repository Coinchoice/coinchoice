import React from 'react';
import { MantineProvider } from '@mantine/core';
import type { PlasmoCSConfig } from 'plasmo';

import Notification from '../components/Notification';
import TopUp from '../components/TopUp';
import { CeramicWrapper } from '../context';

export const config: PlasmoCSConfig = {
	matches: ['<all_urls>'],
};

const ContentUI = () => {
	return (
		<CeramicWrapper>
			<MantineProvider>
				<Notification />
				<TopUp />
			</MantineProvider>
		</CeramicWrapper>
	);
};

export default ContentUI;
