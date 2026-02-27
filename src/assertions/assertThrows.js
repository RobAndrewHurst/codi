import chalk from 'chalk';

const SENTINEL = '__codi_assertThrows_sentinel__';

export async function assertThrows(callback, errorMessage, message) {
  try {
    const result = callback();
    // If the callback returns a thenable (async function), await it
    if (result && typeof result.then === 'function') {
      await result;
    }
    throw new Error(SENTINEL);
  } catch (error) {
    // Re-throw our sentinel -- means no error was thrown by the callback
    if (error.message === SENTINEL) {
      throw new Error(message || 'Expected an error to be thrown');
    }
    // If an expected error message was provided, verify it matches
    if (errorMessage !== undefined && error.message !== errorMessage) {
      throw new Error(
        message ||
          `Expected error message to be ${chalk.bold.yellow(errorMessage)}, but got ${chalk.bold.yellow(error.message)}`,
      );
    }
  }
}
