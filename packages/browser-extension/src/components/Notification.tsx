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

import { coinList } from '~utils/constants';
import { bus } from '~utils/bus';
import type { GasPayload, Coin } from '~types';
import { truncate } from '~utils/truncate';
import LogoWhite from 'data-base64:~assets/LogoWhite.png';
import ConnectButton from './ConnectButton';

const Notification = () => {
	const [isOpened, setOpened] = useState(
		false
		// true
	);
	const [payload, setPayload] = useState<GasPayload | null>(null);
	let selectedCoin: Coin | null = null;
	if (payload !== null) {
		console.log(payload);
		selectedCoin = coinList.find(
			(c) => c.networks[payload.wallet.network] === payload.swap.token
		);
	}
	const [isSignLoading, setSignLoading] = useState(false);

	useEffect(() => {
		bus.on('open', (data: GasPayload) => {
			console.log('open-data', data);
			setOpened(true);
			setPayload(data);
		});

		// Executed once a signature is captured
		bus.on('sign_complete', () => {
			setSignLoading(false);
		});
	}, []);

	const handleSign = useCallback(() => {
		setSignLoading(true);
		bus.emit('accept', { coin: selectedCoin, amount: payload.swap.feeToken });
	}, [selectedCoin, payload]);

	return (
		<Drawer
			opened={isOpened}
			onClose={() => setOpened(false)}
			padding="xl"
			size="lg"
			position="right"
			zIndex={9999}
			closeOnClickOutside={false}
			// className={classes.body}
			sx={() => ({
				'&  .mantine-Drawer-body': {
					marginTop: '-50px',
				},
			})}
		>
			<Flex
				gap="sm"
				direction="column"
				sx={() => ({
					overflowY: 'auto',
				})}
			>
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
							pb={5}
							sx={() => ({ borderBottom: `1px solid rgba(0, 0, 0, 0.1)` })}
						>
							<Text fz={12} fw={700} m={5} opacity="0.7">
								Wallet
							</Text>
							<Text fz={12} m={5} opacity="0.7">
								{truncate(payload.wallet.address, 6, 4)}
							</Text>
						</Flex>
						<Flex
							align="center"
							justify="space-between"
							w="100%"
							pb={5}
							sx={() => ({ borderBottom: `1px solid rgba(0, 0, 0, 0.1)` })}
						>
							<Text fz={12} fw={700} m={5} opacity="0.7">
								Balance
							</Text>
							<Text fz={12} m={5} opacity="0.7">
								{payload.swap.balance}
							</Text>
						</Flex>
						<Flex
							align="center"
							justify="space-between"
							w="100%"
							pb={5}
							sx={() => ({ borderBottom: `1px solid rgba(0, 0, 0, 0.1)` })}
						>
							<Text fz={14} fw={700} m={5}>
								Gas to pay
							</Text>
							<Text fz={14} m={5}>
								{payload.swap.feeToken}{' '}
								<strong>{selectedCoin.ticker.toUpperCase()}</strong>
							</Text>
						</Flex>
						<Flex
							align="center"
							justify="space-between"
							w="100%"
							pb={5}
							sx={() => ({ borderBottom: `1px solid rgba(0, 0, 0, 0.1)` })}
						>
							<Text fz={14} fw={700} m={5}>
								Native gas
							</Text>
							<Text fz={14} m={5}>
								{payload.swap.feeEth} <strong>ETH</strong>
							</Text>
						</Flex>
					</>
				)}
				<Flex gap="sm" align="center" direction="column">
					{payload !== null && payload.wallet.address ? (
						<>
							<Button
								size="lg"
								onClick={handleSign}
								w="100%"
								loading={isSignLoading}
							>
								Get Gas
							</Button>
							<Button
								size="lg"
								variant="subtle"
								w="100%"
								onClick={() => setOpened(false)}
							>
								Cancel
							</Button>
						</>
					) : (
						<ConnectButton />
					)}
				</Flex>
			</Flex>
		</Drawer>
	);
};

export default Notification;
