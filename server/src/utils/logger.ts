const PREFIX = '[FasalRakshak]';

const logger = {
  info: (...args: unknown[]): void => {
    console.info(PREFIX, ...args);
  },
  warn: (...args: unknown[]): void => {
    console.warn(PREFIX, ...args);
  },
  error: (...args: unknown[]): void => {
    console.error(PREFIX, ...args);
  },
};

export default logger;
