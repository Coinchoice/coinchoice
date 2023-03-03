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
		selectedCoin = coinList.find(
			(c) => c.networks[payload.wallet.network] === payload.sim.token
		);
	}
	const [isSignLoading, setSignLoading] = useState(false);
	const [newAccount, setNewAccount] = useState('');

	useEffect(() => {
		bus.on('open', (data: GasPayload) => {
			console.log('open-data', data);
			setOpened(true);
			setPayload(data);
		});

		// Executed once a signature is captured
		bus.on('sign-complete', () => {
			setSignLoading(false);
		});

		// On wallet connection, update the payload
		bus.on('mm:accountsChanged', ({ accounts }) => {
			setNewAccount(accounts[0]);
		});
	}, []);

	useEffect(() => {
		if (newAccount && payload !== null) {
			if (payload.wallet.address !== newAccount) {
				setPayload({
					...payload,
					wallet: {
						...payload.wallet,
						address: newAccount,
					},
				});
			}
		}
	}, [payload, newAccount]);

	const handleSign = useCallback(() => {
		setSignLoading(true);
		bus.emit('accept', {
			coin: selectedCoin,
			payload,
		});
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
						{payload !== null && payload.wallet.address && (
							<>
								<Flex
									align="center"
									justify="space-between"
									w="100%"
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
									sx={() => ({ borderBottom: `1px solid rgba(0, 0, 0, 0.1)` })}
								>
									<Text fz={12} fw={700} m={5} opacity="0.7">
										{selectedCoin.ticker} Balance
									</Text>
									<Text fz={12} m={5} opacity="0.7">
										{parseInt(payload.sim.balance.hex, 16).toFixed(6)}
									</Text>
								</Flex>
							</>
						)}
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
								{payload.sim.feeToken < 0.000001
									? `< 0.000001`
									: payload.sim.feeToken.toFixed(6)}{' '}
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
								{payload.sim.feeEth < 0.000001
									? `< 0.000001`
									: payload.sim.feeEth.toFixed(6)}{' '}
								<strong>ETH</strong>
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
						<ConnectButton w="100%" size="lg" />
					)}
				</Flex>
			</Flex>
		</Drawer>
	);
};

export default Notification;
