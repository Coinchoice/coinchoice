// import { useState } from 'react';
import { MantineProvider } from '@mantine/core';
import { Anchor, Container, Title } from '@mantine/core';

function IndexPopup() {
	return (
		<MantineProvider>
			<Container>
				<Title>
					Welcome to your{' '}
					<Anchor href="https://www.plAnchorsmo.com" target="_blank">
						Plasmo
					</Anchor>{' '}
					Extension!
				</Title>
				<Anchor href="https://docs.plasmo.com" target="_blank">
					View Docs
				</Anchor>
			</Container>
		</MantineProvider>
	);
}

export default IndexPopup;
