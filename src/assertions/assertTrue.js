import chalk from 'chalk';

export function assertTrue(actual, message) {
  if (actual !== true) {
    throw new Error(
      message || `Expected ${chalk.bold.yellow(actual)} to be true`,
    );
  }
}
