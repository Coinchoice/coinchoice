import React, { useState, useEffect } from 'react';
import { Flex, Button, Modal, Image, Text } from '@mantine/core';

import { bus } from '~utils/bus';
import { coinList } from '~utils/constants';

const CurrencySelect = () => {
	const [isOpened, setOpened] = useState(
		// false
		true
	);

	useEffect(() => {
		console.log('setup select currency listener');
		bus.on('select', () => {
			console.log('on select currency');
			setOpened(true);
		});
		bus.on('message', (msg) => {
			console.log('on message', msg);
			// setOpened(true);
		});

		setTimeout(() => {
			bus.emit('message', { insta: 'message' });
		}, 1000);
	}, []);

	return (
		<Modal
			opened={isOpened}
			onClose={() => setOpened(false)}
			title="Select a Gas Coin"
			zIndex={9999}
		>
			{coinList.map((coin) => (
				<Button
					sx={() => ({ width: '100%' })}
					variant="subtle"
					leftIcon={
						<Image
							src={coin.icon}
							bgsz="contain"
							sx={() => ({
								width: 50,
								maxHeight: 50,
							})}
						/>
					}
				>
					<Flex direction="column">
						<Text fs="lg" fw={700}>
							{coin.ticker}
						</Text>
						<Text fs="md" opacity={0.8}>
							{coin.name}
						</Text>
					</Flex>
				</Button>
			))}
		</Modal>
	);
};

export default CurrencySelect;
