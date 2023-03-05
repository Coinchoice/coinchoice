import { ethers } from 'ethers';
import type { FramebusOnHandler } from 'framebus/dist/lib/types';
import type { BasicWallet, Coin, Simulation } from '~types';
import {
	ExternalProvider,
	JsonRpcCallback,
	JsonRpcRequest,
	JsonRpcResponse,
	NetworkChainIds,
	TxRequest,
} from '~types/requests';
import { bus, busPromise } from '~utils/bus';
import {
	isIntercept,
	isJsonRpcRequest,
	isSupportedNetwork,
} from '~utils/requests';

import * as permit from '../utils/permit';
import { getToken } from '../utils/token';
import type { GasPayload } from './../types/index';

export class RPCProviderFacade {
	private provider: ethers.providers.Web3Provider;

	constructor(private wallet) {}

	setWallet(_wallet: BasicWallet) {
		this.wallet = _wallet;
	}

	methodReplace(method: string) {
		if (method.startsWith('coinchoice_')) {
			return method.replace('coinchoice_', 'eth_');
		}
		return method;
	}

	wrap(provider: ExternalProvider) {
		/*//////////////////////////////////////////////////////////////
                      WRAP WINDOW.ETHEREUM METHODS
    //////////////////////////////////////////////////////////////*/

		if (provider.send) {
			console.log('CS [Facade]: wrapping deprecated send');
			const deprecatedProviderSend = provider.send;
			const deprecatedSend = async (
				methodOrPayload: string | JsonRpcRequest,
				paramsOrCallback?: Array<unknown> | JsonRpcCallback
			): Promise<void | JsonRpcResponse> => {
				console.log('CS [Facade]: triggering deprecated send');

				if (isJsonRpcRequest(methodOrPayload)) {
					const request = methodOrPayload;
					const callback = paramsOrCallback as JsonRpcCallback;
					if (
						isIntercept(request.method) &&
						isSupportedNetwork(NetworkChainIds.GOERLI)
					) {
						console.log('CS [Facade]: intercepted deprecated send');
						await this.waitForSignature(request);
						return deprecatedProviderSend(request, callback);
					} else {
						request.method = this.methodReplace(request.method);
						return deprecatedProviderSend(request, callback);
					}
				} else {
					const method = methodOrPayload;
					const params = paramsOrCallback as any[];

					if (
						isIntercept(method) &&
						isSupportedNetwork(NetworkChainIds.GOERLI)
					) {
						console.log('CS [Facade]: intercepted deprecated send');
						return this.waitForSignature({
							method,
							params,
						}).then(async () => {
							return deprecatedProviderSend(method, params);
						}) as Promise<JsonRpcResponse>;
					} else {
						return deprecatedProviderSend(this.methodReplace(method), params);
					}
				}
			};
			provider.send = deprecatedSend.bind(this);
			provider.coinchoice = true;
		}

		if (provider.sendAsync) {
			console.log('CS [Facade]: wrapping deprecated sendAsync');
			const deprecatedProviderSendAsync = provider.sendAsync;
			const deprecatedSendAsync = (
				request: JsonRpcRequest,
				callback: (error: any, response: any) => void
			): void => {
				if (
					isIntercept(request.method) &&
					isSupportedNetwork(NetworkChainIds.GOERLI)
				) {
					console.log('CS [Facade]: intercepted deprecated sendAsync');
					this.waitForSignature(request)
						.then(async () => {
							deprecatedProviderSendAsync(request, callback);
						})
						.catch((err) => {
							callback(err, {});
						});
				} else {
					request.method = this.methodReplace(request.method);
					deprecatedProviderSendAsync(request, callback);
				}
			};
			provider.sendAsync = deprecatedSendAsync.bind(this);
			provider.coinchoice = true;
		}

		if (provider.request) {
			console.log('CS [Facade]: wrapping request');
			// We don't want metamask's ethereum.request externally accessible at runtime.
			// We include it in the closure of _our_ request function so that we can forward approved requests.
			const providerRequest = provider.request;
			const request = async (request: JsonRpcRequest) => {
				if (
					isIntercept(request.method) &&
					isSupportedNetwork(NetworkChainIds.GOERLI)
				) {
					console.log('CS [Facade]: intercepted request');
					return this.waitForSignature(request).then(async () => {
						console.log('CS [Facade]: proceed with provider request');
						return await providerRequest(request);
					});
				} else {
					request.method = this.methodReplace(request.method);
					return await providerRequest(request);
				}
			};
			provider.request = request.bind(this);
			provider.coinchoice = true;
		}

		this.provider = new ethers.providers.Web3Provider(provider);
	}

	async waitForSignature(request: TxRequest) {
		console.log('CS [Facade]: wait for signature', request);
		// 0. Check if token/network combination is valid
		try {
			await busPromise('tx-validate');
		} catch (e) {
			console.log('Invalid token/network combination');
			// TODO: Ask user to switch networks, or show a toaster message
			return;
		}

		// 1. Create a request to backend with request data -- include wallet address for review
		try {
			const simResp = (await busPromise('tx-simulate', { tx: request })) as {
				success: boolean;
				data: Simulation;
			};

			console.log('CS [Facade]: simulated tx', simResp);

			// const resp = {
			// 	wallet: this.wallet,
			// 	swap: {
			// 		feeEth: 0.00018012,
			// 		feeToken: 0.000034,
			// 		price: 0.19,
			// 		token: 'USDC',
			// 		balance: '1',
			// 		chainId: 5,
			// 	},
			// }; // emulate

			// 2. Present the signature request to the end-user
			bus.emit('open', {
				// sim: resp,
				sim: simResp.data,
				wallet: this.wallet,
				tx: request,
			});
		} catch (e) {
			console.log('CS [Facade]: Insufficient funds in selected currency');
			console.error(e);
		}

		try {
			// ! The function does not block -- it needs to block until accept is received.
			// On Accept Gas Payment in Chosen Currency
			const txId = await new Promise<string>((resolve, reject) => {
				const acceptHandler: FramebusOnHandler = async ({
					accepted,
					coin,
					payload,
				}: {
					accepted: boolean;
					coin: Coin;
					payload: GasPayload;
				}) => {
					console.log('CS [Facade]: start accept handler');
					// Remove accept listener on each handle
					bus.off('accept', acceptHandler);
					if (!accepted) {
						return resolve('');
					}
					try {
						const sig = await this.actionSignature(coin, payload);
						console.log('CS [Facade]: Signature success');
						const res = { success: true, sig, payload };
						const resp = (await busPromise('sign-complete', res)) as {
							success: boolean;
							data: { id: string };
						};
						if (!resp.success) {
							throw new Error('Meta-tx Submissions Failed');
						}
						return resolve(resp.data.id);
					} catch (innerErr) {
						return reject(innerErr);
					}
				};
				// Accept registered on each request
				console.log('CS [Facade]: register accept handler');
				bus.on('accept', acceptHandler);
			});

			if (!txId) {
				console.log('CS [Facade]: signature cancelled');
				throw new Error('Signature Cancelled. No Transaction ID');
			}

			// Wait for transaction to complete.
			console.log('CS [Facade]: Wait for Tx', txId);
			await new Promise((resolve) => {
				setTimeout(() => {
					resolve(true);
				}, 1000);
			});
			const tx = await this.provider.getTransaction(txId);
			await tx.wait();
			console.log('CS [Facade]: Tx', tx);

			// Delay by an additional second
			// await new Promise((resolve) => {
			// 	setTimeout(() => {
			// 		resolve(true);
			// 	}, 1000);
			// });

			// Then emit sign-finalise for close of notification
			bus.emit('sign-finalise', { tx });

			// This will continue with the original transaction
		} catch (e) {
			console.log('CS [Facade] ERROR: Cannot action signature');
			console.error(e);
			bus.emit('sign-finalise', { tx: null });
		}
	}

	async actionSignature(coin: Coin, payload: GasPayload) {
		const ethProvider = new ethers.providers.Web3Provider(
			// @ts-ignore
			window.ethereum
		);

		// console.log('CS: signer', signer);
		const token = await getToken(
			ethProvider,
			this.wallet.network,
			coin.networks[this.wallet.network]
		);
		console.log('CS [Facade]: token: ', token);

		const res = await permit.Sign(
			ethProvider,
			this.wallet.network,
			this.wallet.address.toLowerCase(),
			token,
			// payload.sim.amount.toString(),
			'1000000000000000',
			payload.sim.relayer,
			ethers.constants.MaxUint256.toString()
		);

		console.log('CS [Facade]: permit sign: ', res);

		return res;
	}
}
