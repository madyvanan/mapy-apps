import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp: ts, stack }) => {
  return `${ts as string} [${level}]: ${(stack as string | undefined) ?? (message as string)}`;
});

export const logger = winston.createLogger({
  level: process.env['NODE_ENV'] === 'production' ? 'info' : 'debug',
  format: combine(errors({ stack: true }), timestamp(), logFormat),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), timestamp(), logFormat),
    }),
  ],
});

export const morganStream = {
  write: (message: string): void => {
    logger.http(message.trim());
  },
};
