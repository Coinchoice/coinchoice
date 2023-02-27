// import { EthersRequest, isIntercept } from 'shared_types';
// import { v4 as uuidv4 } from 'uuid';
import {
	ExternalProvider,
	isJsonRpcRequest,
	JsonRpcCallback,
	JsonRpcRequest,
	JsonRpcResponse,
} from '../types/injected';
import { log } from '../utils/logger';

const isMainnet = () => {
	return window.ethereum.chainId === '0x1';
};

const isIntercept = (method: string) => true;

export class RPCProviderFacade {
	constructor() {
		if (window.ethereum) {
			log.debug('wrapping window.ethereum');
			this.wrap(window.ethereum);
			if (window.ethereum?.providers?.length) {
				window.ethereum?.providers.forEach(this.wrap.bind(this));
			}
		} else {
			log.debug('adding ethereum#initialized event listener ');
			window.addEventListener('ethereum#initialized', () => {
				log.debug('ethereum#initialized: wrapping window.ethereum');
				this.wrap(window.ethereum);
			});
		}
	}
	wrap(provider: ExternalProvider) {
		/*//////////////////////////////////////////////////////////////
                      WRAP WINDOW.ETHEREUM METHODS
    //////////////////////////////////////////////////////////////*/

		if (provider.send) {
			log.debug('wrapping deprecated send');
			const deprecatedProviderSend = provider.send;
			const deprecatedSend = async (
				methodOrPayload: string | JsonRpcRequest,
				paramsOrCallback?: Array<unknown> | JsonRpcCallback
			): Promise<void | JsonRpcResponse> => {
				log.debug('triggering deprecated send');

				if (isJsonRpcRequest(methodOrPayload)) {
					const request = methodOrPayload;
					const callback = paramsOrCallback as JsonRpcCallback;
					if (isIntercept(request.method) && isMainnet()) {
						log.debug('intercepted deprecated send');
						await this.waitForDecision(request);
						return deprecatedProviderSend(request, callback);
					} else {
						return deprecatedProviderSend(request, callback);
					}
				} else {
					const method = methodOrPayload;
					const params = paramsOrCallback as any[];

					if (isIntercept(method) && isMainnet()) {
						log.debug('intercepted deprecated send');
						return this.waitForDecision({
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
			log.debug('wrapping deprecated sendAsync');
			const deprecatedProviderSendAsync = provider.sendAsync;
			const deprecatedSendAsync = (
				request: JsonRpcRequest,
				callback: (error: any, response: any) => void
			): void => {
				if (isIntercept(request.method) && isMainnet()) {
					log.debug('intercepted deprecated sendAsync');
					this.waitForDecision(request)
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
			log.debug('wrapping request');
			// We don't want metamask's ethereum.request externally accessible at runtime.
			// We include it in the closure of _our_ request function so that we can forward approved requests.
			const providerRequest = provider.request;
			const request = async (request: JsonRpcRequest) => {
				if (isIntercept(request.method) && isMainnet()) {
					log.debug('intercepted request');
					return this.waitForDecision(request).then(async () => {
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
