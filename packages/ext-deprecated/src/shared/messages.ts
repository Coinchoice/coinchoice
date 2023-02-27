// // messages.js, used in both the background and content script
// import { getMessage } from '@extend-chrome/messages';

// export const COINCHOICE_REQUEST_STREAM = 'COINCHOICE_REQUEST';
// export const COINCHOICE_DECISION_STREAM = 'COINCHOICE_DECISON';

// /**
//  * wrap sendMessage such that it can send to contentScripts
//  * @param f a send function created by the getMessage helper
//  * @returns a function that will send a message to all tabs (We will need to narrow this).
//  */
// export const forwardMessageToContentScript = function <
// 	Fn extends F.Function<any, any>
// >(f: Fn) {
// 	return (data: [F.Parameters<Fn>[0], chrome.runtime.MessageSender]) => {
// 		chrome.tabs.query({ windowType: 'normal' }, function (tabs) {
// 			tabs.forEach((t) => {
// 				if (!t.id) return;
// 				f(data[0], { tabId: t.id });
// 			});
// 		});
// 	};
// };

// /**
//  * Sets up message passing can be shared between content-script, service-worker & pop-up
//  * Can't be used by EthereumWrapper
//  */
// export const [sendRequest, requestStream, waitForRequest] =
// 	getMessage<CoinChoiceRequest>(COINCHOICE_REQUEST_STREAM);

// export const [sendDecision, decisionStream] = getMessage<TxDecision>(
// 	COINCHOICE_DECISION_STREAM
// );
// export const sendDecisionToCS = forwardMessageToContentScript(sendDecision);
