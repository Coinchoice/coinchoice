import * as log from 'loglevel';

console.log('hello?', process.env.PLASMO_PUBLIC_LOG_LEVEL);

log.setLevel(
	process.env.PLASMO_PUBLIC_LOG_LEVEL
		? log.levels[process.env.PLASMO_PUBLIC_LOG_LEVEL.toUpperCase()]
		: log.levels.INFO
);

export { log };
