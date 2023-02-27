import * as log from 'loglevel';

log.setLevel(
	process.env.LOG_LEVEL
		? log.levels[process.env.LOG_LEVEL.toUpperCase()]
		: log.levels.INFO
);

export { log };
