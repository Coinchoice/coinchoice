import React, { useState, useEffect } from 'react';
import { Flex, Button, Drawer, Title } from '@mantine/core';

import { bus } from '~utils/bus';

const Notification = () => {
	const [isOpened, setOpened] = useState(
		// false
		true
	);

	useEffect(() => {
		bus.on('open', () => {
			setOpened(true);
		});
	}, []);

	return (
		<>
			<div>hello world</div>
		</>
	);
};

export default Notification;
