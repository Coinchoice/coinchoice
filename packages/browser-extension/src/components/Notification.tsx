import React, { useState, useEffect, useCallback } from 'react';
import { Flex, Button, Drawer, Title } from '@mantine/core';

// import type { Wallet } from 'ethers';
// import {
// 	useAccount,
// 	useSignMessage,
// 	useNetwork,
// 	useProvider,
// 	useConnect,
// } from 'wagmi';
// import { useSign } from '../hooks/useSignMessage';
// import { useToken } from '../hooks/useToken';
// import { fetchSigner, ProviderRpcError } from '@wagmi/core';
import { usePort } from '@plasmohq/messaging/hook';
import { coinList } from '~utils/constants';
import { bus } from '~utils/bus';

// import '@rainbow-me/rainbowkit/styles.css';

// import detectEthereumProvider from '@metamask/detect-provider';
// import type { BaseProvider } from '@metamask/providers';

// const spender = '0x7E64d52D285E47b088f7b1df2438C1782099101a';
const defaultCoin = coinList.find((coin) => !!coin.default);

// Steps required?
// enum Steps {
// 	Primary,
// }

const Notification = () => {
	const [isOpened, setOpened] = useState(
		// false
		true
	);
	// const [step, setStep] = useState(Steps.Primary);

	// const { account } = wallet;
	// const account = useAccount();
	// console.log('account', account, account.address);
	const coinPort = usePort('coin');
	let defCoin = defaultCoin;
	if (coinPort?.data?.ticker) {
		defCoin = coinPort.data;
	}
	// TODO: Use selected coin for UI -- indicate how much will be transfered.
	const [selectedCoin, setSelectedCoin] = useState(defCoin);

	useEffect(() => {
		bus.on('open', (data) => {
			console.log('open facade', data);
		});
	}, []);

	useEffect(() => {
		(async () => {
			coinPort.send({
				type: 'get',
			});
		})();
	}, [isOpened]);

	useEffect(() => {
		console.log('coin', coinPort);
		if (coinPort?.data?.ticker) {
			setSelectedCoin(coinPort.data);
		}
	}, [coinPort]);

	const handleSign = useCallback(() => {
		bus.emit('sign', { amount: '1000' });
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
					{true ? (
						<>
							<Button size="md" variant="outline">
								Cancel
							</Button>
							<Button size="md" onClick={handleSign}>
								Get Gas
							</Button>
						</>
					) : (
						<div>Connect wallet please</div>
					)}
				</Flex>
			</Flex>
		</Drawer>
	);
};

export default Notification;
