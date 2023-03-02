import React, { useState, useEffect, useCallback } from 'react';
import {
	Flex,
	Button,
	Drawer,
	Title,
	Image,
	ThemeIcon,
	Text,
} from '@mantine/core';

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
// import { usePort } from '@plasmohq/messaging/hook';
// import { IconArrowRightCircle } from '@tabler/icons-react';
import { coinList } from '~utils/constants';
import { bus } from '~utils/bus';
import type { GasPayload, Coin } from '~types';
import LogoWhite from 'data-base64:~assets/LogoWhite.png';

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
		false
		// true
	);
	const [payload, setPayload] = useState<GasPayload | null>(null);
	let selectedCoin: Coin | null = null;
	if (payload !== null) {
		selectedCoin = coinList.find(
			(c) => c.networks[payload.wallet.network] === payload.swap.token
		);
	}

	// const { account } = wallet;
	// const account = useAccount();
	// console.log('account', account, account.address);
	// const coinPort = usePort('coin');
	// let defCoin = defaultCoin;
	// if (coinPort?.data?.ticker) {
	// 	defCoin = coinPort.data;
	// }
	// TODO: Use selected coin for UI -- indicate how much will be transfered.
	// const [selectedCoin, setSelectedCoin] = useState(defCoin);

	useEffect(() => {
		bus.on('open', (data: GasPayload) => {
			console.log('open-data', data);
			setPayload(data);
		});
	}, []);

	// useEffect(() => {
	// 	// console.log('coin', coinPort);
	// 	if (coinPort?.data?.ticker) {
	// 		setSelectedCoin(coinPort.data);
	// 	}
	// }, [coinPort]);

	const handleSign = useCallback(() => {
		bus.emit('sign', { amount: payload.swap.feeToken });
	}, [payload]);

	return (
		<Drawer
			opened={isOpened}
			onClose={() => setOpened(false)}
			padding="xl"
			size="lg"
			position="right"
			zIndex={9999}
			closeOnClickOutside={false}
		>
			<Flex gap="md" direction="column">
				<Flex direction="row" mb={20}>
					<ThemeIcon
						size="xl"
						variant="gradient"
						gradient={{ from: 'indigo', to: 'cyan' }}
						mr={10}
					>
						<Image src={LogoWhite} maw={28} />
					</ThemeIcon>
					<Title
						size="h2"
						fw={400}
						sx={() => ({
							lineHeight: `38px`,
						})}
					>
						CoinChoice
					</Title>
				</Flex>
				{payload !== null && (
					<>
						<Flex
							direction="row"
							align="center"
							mb={20}
							p={10}
							sx={() => ({
								borderRadius: 100,
								backgroundColor: `rgba(0, 0, 0, 0.05)`,
							})}
						>
							<Image src={selectedCoin.icon} maw={50} mr={10} />
							<Title size="h3" fw={400}>
								Pay gas in {selectedCoin.name}
							</Title>
						</Flex>
						<Flex
							align="center"
							justify="space-between"
							w="100%"
							pb={10}
							sx={() => ({ borderBottom: `1px solid rgba(0, 0, 0, 0.1)` })}
						>
							<Text fz={16} fw={700} m={5}>
								Gas to pay
							</Text>
							<Text fz={16} m={5}>
								{payload.swap.feeToken}{' '}
								<strong>{selectedCoin.ticker.toUpperCase()}</strong>
							</Text>
						</Flex>
						<Flex
							align="center"
							justify="space-between"
							w="100%"
							pb={10}
							sx={() => ({ borderBottom: `1px solid rgba(0, 0, 0, 0.1)` })}
						>
							<Text fz={16} fw={700} m={5}>
								Native gas
							</Text>
							<Text fz={16} m={5}>
								{payload.swap.feeEth} <strong>ETH</strong>
							</Text>
						</Flex>
					</>
				)}
				<Flex gap="sm" align="center" direction="column">
					{true ? (
						<>
							<Button size="lg" onClick={handleSign} w="100%">
								Get Gas
							</Button>
							<Button size="lg" variant="subtle" w="100%">
								Cancel
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
