import Framebus from 'framebus';
import type { FramebusOnHandler } from 'framebus/dist/lib/types';

export const bus = new Framebus({ channel: 'COINCHOICE' });

// This method will emit an event and resolve a promise ONCE the bus topic has been responded to
export const busPromise = (topic: string, params?: any) => {
	return new Promise((resolve, reject) => {
		const handler: FramebusOnHandler = ({ err, resp }) => {
			bus.off(`resp:${topic}`, handler);

			if (err) {
				return reject(err);
			}
			return resolve(resp);
		};
		bus.on(`resp:${topic}`, handler);
		bus.emit(topic, params);
	});
};
