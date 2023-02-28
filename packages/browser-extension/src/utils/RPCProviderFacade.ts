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

export class RPCProviderFacade {
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
		console.log(request);
		// 1. Create a request to backend with request data -- include wallet address for review
		// 2. Receives repsonse with gas price in the chosen currency
		// 3. Submit API request with signature for swap transaction
	}

	async waitForDecision(request: any) {
		// const rpcRequestId = uuidv4();
		const rpcRequestId = 'DUMMY';
		const event = new CustomEvent('COINCHOICE', {
			detail: {
				rpcRequestId,
				...request,
				userAddress: window.ethereum.selectedAddress,
			},
		});
		window.dispatchEvent(event);
		return new Promise((res, rej) => {
			window.addEventListener('message', (event) => {
				if (
					event.data.origin === 'coinchoice' &&
					event.data.rpcRequestId === rpcRequestId
				) {
					event.data.approval
						? res(undefined)
						: rej({ message: 'Rejected in CoinChoice' });
				}
			});
		});
	}
}
