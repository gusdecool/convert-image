const PREFIX = '[convert-image]'

export const logger = {
  info: (...args: unknown[]): void => console.log(PREFIX, ...args),
  error: (...args: unknown[]): void => console.error(PREFIX, ...args)
}
