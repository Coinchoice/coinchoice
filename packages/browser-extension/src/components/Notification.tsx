import React, { useState, useEffect } from 'react';
import { Flex, Button, Drawer, Title } from '@mantine/core';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { Wallet } from 'ethers';
import {
	useAccount,
	useSignMessage,
	useNetwork,
	useProvider,
	useConnect,
} from 'wagmi';
import { useSign } from '../hooks/useSignMessage';
import { useToken } from '../hooks/useToken';
import { fetchSigner, ProviderRpcError } from '@wagmi/core';
import { usePort } from '@plasmohq/messaging/hook';
import { coinList } from '~utils/constants';
import { bus } from '~utils/bus';

// import detectEthereumProvider from '@metamask/detect-provider';
// import type { BaseProvider } from '@metamask/providers';

// const spender = '0x7E64d52D285E47b088f7b1df2438C1782099101a';
const defaultCoin = coinList.find((coin) => !!coin.default);

// Steps required?
enum Steps {
	Primary,
}

const Notification = () => {
	const [isOpened, setOpened] = useState(
		// false
		true
	);
	// const [step, setStep] = useState(Steps.Primary);

	// const provider = useProvider();
	// console.log('provider', provider, provider.network);
	const account = useAccount();
	// console.log('account', account, account.address);
	const [signer, setSigner] = useState<any>(null);
	const coinPort = usePort('coin');
	let defCoin = defaultCoin;
	if (coinPort?.data?.ticker) {
		defCoin = coinPort.data;
	}
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

	useEffect(() => {
		(async () => {
			// const address = provider?.selectedAddress;
			const address = '';
			if (address && !signer) {
				const _signer = await fetchSigner();
				setSigner(_signer);
			}
		})();
	}, [signer]);

	// const { chain } = useNetwork();
	// const chainId = chain?.id ?? 1;
	// if (!Object.keys(selectedCoin.networks).includes(`${chainId}`)) {
	// 	console.log(`Unsupported chain ${chain} -> ${chainId}`);
	// 	// TODO: If chainId is not supported, show message to switch networks
	// }
	// const token = useToken(signer as Wallet, chainId, selectedCoin.ticker);
	// const { handleSign } = useSign(
	// 	account.address,
	// 	chainId,
	// 	token,
	// 	signer,
	// 	'10000',
	// 	spender
	// );

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
					{!!account.address ? (
						<>
							<Button size="md" variant="outline">
								Cancel
							</Button>
							<Button
								size="md"
								// onClick={handleSign}
							>
								Get Gas
							</Button>
						</>
					) : (
						<ConnectButton.Custom>
							{({
								account,
								chain,
								openAccountModal,
								openChainModal,
								openConnectModal,
								authenticationStatus,
								mounted,
							}) => {
								// Note: If your app doesn't use authentication, you
								// can remove all 'authenticationStatus' checks
								const ready = mounted && authenticationStatus !== 'loading';
								const connected =
									ready &&
									account &&
									chain &&
									(!authenticationStatus ||
										authenticationStatus === 'authenticated');

								return (
									<div
										{...(!ready && {
											'aria-hidden': true,
											style: {
												opacity: 0,
												pointerEvents: 'none',
												userSelect: 'none',
											},
										})}
									>
										{(() => {
											if (!connected) {
												return (
													<button onClick={openConnectModal} type="button">
														Connect Wallet
													</button>
												);
											}

											if (chain.unsupported) {
												return (
													<button onClick={openChainModal} type="button">
														Wrong network
													</button>
												);
											}

											return (
												<div style={{ display: 'flex', gap: 12 }}>
													<button
														onClick={openChainModal}
														style={{ display: 'flex', alignItems: 'center' }}
														type="button"
													>
														{chain.hasIcon && (
															<div
																style={{
																	background: chain.iconBackground,
																	width: 12,
																	height: 12,
																	borderRadius: 999,
																	overflow: 'hidden',
																	marginRight: 4,
																}}
															>
																{chain.iconUrl && (
																	<img
																		alt={chain.name ?? 'Chain icon'}
																		src={chain.iconUrl}
																		style={{ width: 12, height: 12 }}
																	/>
																)}
															</div>
														)}
														{chain.name}
													</button>

													<button onClick={openAccountModal} type="button">
														{account.displayName}
														{account.displayBalance
															? ` (${account.displayBalance})`
															: ''}
													</button>
												</div>
											);
										})()}
									</div>
								);
							}}
						</ConnectButton.Custom>
					)}
				</Flex>
			</Flex>
		</Drawer>
	);
};

export default Notification;
