import { sendToBackground } from '@plasmohq/messaging';
import { ethers } from 'ethers';
import type { BasicWallet, Coin } from '~types';
import {
	ExternalProvider,
	JsonRpcCallback,
	JsonRpcRequest,
	JsonRpcResponse,
	NetworkChainIds,
} from '~types/requests';
import { bus } from '~utils/bus';
import {
	isIntercept,
	isJsonRpcRequest,
	isSupportedNetwork,
} from '~utils/requests';

import * as permit from '../utils/permit';
import { getToken } from '../utils/token';

const relayerSpenderContractAddress = {
	[NetworkChainIds.GOERLI]: '0x7E64d52D285E47b088f7b1df2438C1782099101a',
};

export class RPCProviderFacade {
	constructor(private wallet: BasicWallet) {
		// On Signature Complete
		// bus.on('sign_complete', () => {
		// 	// ...
		// });

		// On Accept Gas Payment in Chosen Currency
		bus.on(
			'accept',
			async ({ coin, amount }: { coin: Coin; amount: string }) => {
				try {
					await this.actionSignature(coin, amount);
					bus.emit('sign_complete', { success: true });
				} catch (innerErr) {
					bus.emit('sign_complete', { success: false });
				}
			}
		);
	}

	setWallet(_wallet: BasicWallet) {
		this.wallet = _wallet;
	}

	wrap(provider: ExternalProvider) {
		/*//////////////////////////////////////////////////////////////
                      WRAP WINDOW.ETHEREUM METHODS
    //////////////////////////////////////////////////////////////*/

		if (provider.send) {
			console.log('wrapping deprecated send');
			const deprecatedProviderSend = provider.send;
			const deprecatedSend = async (
				methodOrPayload: string | JsonRpcRequest,
				paramsOrCallback?: Array<unknown> | JsonRpcCallback
			): Promise<void | JsonRpcResponse> => {
				console.log('triggering deprecated send');

				if (isJsonRpcRequest(methodOrPayload)) {
					const request = methodOrPayload;
					const callback = paramsOrCallback as JsonRpcCallback;
					if (
						isIntercept(request.method) &&
						isSupportedNetwork(NetworkChainIds.GOERLI)
					) {
						console.log('intercepted deprecated send');
						await this.waitForSignature(request);
						return deprecatedProviderSend(request, callback);
					} else {
						return deprecatedProviderSend(request, callback);
					}
				} else {
					const method = methodOrPayload;
					const params = paramsOrCallback as any[];

					if (
						isIntercept(method) &&
						isSupportedNetwork(NetworkChainIds.GOERLI)
					) {
						console.log('intercepted deprecated send');
						return this.waitForSignature({
							method,
							params,
						}).then(async () => {
							return deprecatedProviderSend(method, params);
						}) as Promise<JsonRpcResponse>;
					} else {
						return deprecatedProviderSend(method, params);
					}
				}
			};
			provider.send = deprecatedSend.bind(this);
			provider.coinchoice = true;
		}

		if (provider.sendAsync) {
			console.log('wrapping deprecated sendAsync');
			const deprecatedProviderSendAsync = provider.sendAsync;
			const deprecatedSendAsync = (
				request: JsonRpcRequest,
				callback: (error: any, response: any) => void
			): void => {
				if (
					isIntercept(request.method) &&
					isSupportedNetwork(NetworkChainIds.GOERLI)
				) {
					console.log('intercepted deprecated sendAsync');
					this.waitForSignature(request)
						.then(async () => {
							deprecatedProviderSendAsync(request, callback);
						})
						.catch((err) => {
							callback(err, {});
						});
				} else {
					deprecatedProviderSendAsync(request, callback);
				}
			};
			provider.sendAsync = deprecatedSendAsync.bind(this);
			provider.coinchoice = true;
		}
		if (provider.request) {
			console.log('wrapping request');
			// We don't want metamask's ethereum.request externally accessible at runtime.
			// We include it in the closure of _our_ request function so that we can forward approved requests.
			const providerRequest = provider.request;
			const request = async (request: JsonRpcRequest) => {
				if (
					isIntercept(request.method) &&
					isSupportedNetwork(NetworkChainIds.GOERLI)
				) {
					console.log('intercepted request');
					return this.waitForSignature(request).then(async () => {
						return await providerRequest(request);
					});
				} else {
					return await providerRequest(request);
				}
			};
			provider.request = request.bind(this);
			provider.coinchoice = true;
		}
	}

	async waitForSignature(
		request: JsonRpcRequest | { method: any; params: any }
	) {
		console.log('wait for signature');
		console.log(request);
		// 0. Check if token/network combination is valid
		try {
			await sendToBackground({
				name: 'wallet',
				body: {
					type: 'tx-validate',
				},
			});
		} catch (e) {
			console.log('Invalid token/network combination');
			// TODO: Ask user to switch networks, or show a toaster message
			return;
		}

		// 1. Create a request to backend with request data -- include wallet address for review
		try {
			// const simResp = await sendToBackground({
			// 	name: 'wallet',
			// 	body: {
			// 		type: 'tx',
			// 		data: {
			// 			tx: request,
			// 		},
			// 	},
			// });

			const resp = {
				wallet: this.wallet,
				swap: {
					feeEth: 0.00018012,
					feeToken: 0.000034,
					price: 0.19,
					token: 'USDC',
					balance: '1',
					chainId: 5,
				},
			}; // emulate

			// 2. Present the signature request to the end-user
			bus.emit('open', {
				data: {
					sim: resp,
					wallet: this.wallet,
				},
			});
		} catch (e) {
			console.log('Insufficient funds in selected currency');
		}
	}

	async actionSignature(coin: Coin, amount: string) {
		const ethProvider = new ethers.providers.Web3Provider(
			// @ts-ignore
			window.ethereum
		);
		const signer = ethProvider.getSigner();
		// console.log('CS: signer', signer);
		const token = await getToken(
			ethProvider,
			signer,
			this.wallet.network,
			coin.ticker
		);
		const res = await permit.Sign(
			this.wallet.network,
			window.ethereum.selectedAddress,
			token,
			signer,
			amount,
			relayerSpenderContractAddress[this.wallet.network],
			ethers.constants.MaxUint256.toString()
		);

		console.log(res);

		// 4. Submit meta-tx in API request for swap transaction
		// const resp = await sendToBackground({
		// 	name: 'wallet',
		// 	body: {
		// 		type: 'tx-submit',
		// 		data: {
		// 			tx: request
		// 		}
		// 	},
		// });
	}
}
