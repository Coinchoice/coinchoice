import React, { useState, useEffect } from 'react';
import { Flex, Button, Drawer, Title } from '@mantine/core';

import { bus } from '~utils/bus';

const Notification = () => {
	const [isOpened, setOpened] = useState(false);
	// true

	useEffect(() => {
		bus.on('open', () => {
			setOpened(true);
		});
	}, []);

	return (
		<Drawer
			opened={isOpened}
			onClose={() => setOpened(false)}
			padding="xl"
			size="xl"
			position="right"
			zIndex={9999}
		>
			<Flex gap="md" direction="column">
				<Title>CoinChoice</Title>
				<Flex
					gap="md"
					justify="space-between"
					align="center"
					direction="row"
					wrap="wrap"
				>
					<Button size="md" variant="outline">
						Cancel
					</Button>
					<Button size="md">Get Gas</Button>
				</Flex>
			</Flex>
		</Drawer>
	);
};

export default Notification;
