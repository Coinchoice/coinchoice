// @ts-ignore
import ethereumWrapper from './injected/index?script&module';

// import { decisionStream, sendRequest } from './shared/messages';

const script = document.createElement('script');

script.src = chrome.runtime.getURL(ethereumWrapper);

script.async = false;
script.type = 'module';
const node = document.head || document.documentElement;
node.prepend(script);

/**
 * Used to listen for events emitted by the injected ethereumWrapper script
 * Probably redundant but haven't found a satisfying alternative.
 */
// window.addEventListener('COINCHOICE', (stuff) => {
// 	//@ts-ignore
// 	const request = stuff.detail;
// 	sendRequest(request);
// });

// decisionStream.subscribe(async (data) => {
// 	const newData = {
// 		...data[0],
// 		origin: 'coinchoice',
// 	};
// 	window.postMessage(newData);
// });
