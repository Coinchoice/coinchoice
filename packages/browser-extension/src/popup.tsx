import { useCallback } from 'react';
import { MantineProvider } from '@mantine/core';
import { Text, Container, Title, Button } from '@mantine/core';

import { bus } from './utils/bus';

function IndexPopup() {
	const onSelectCoin = useCallback(() => {
		bus.emit('select');
	}, []);

	return (
		<MantineProvider>
			<Container miw={400} mih={400}>
				<Title size="h2">Welcome to CoinChoice!</Title>
				<Text fz="xl" mb={40}>
					Take control over how your pay for gas
				</Text>
				<Container>
					<Button onClick={onSelectCoin}>Select Default Gas Currency</Button>
				</Container>
			</Container>
		</MantineProvider>
	);
}

export default IndexPopup;
