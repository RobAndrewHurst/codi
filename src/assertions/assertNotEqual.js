import chalk from 'chalk';
import { isDeepEqual } from '../util/deepEqual.js';

export function assertNotEqual(actual, expected, message) {
  if (isDeepEqual(actual, expected)) {
    throw new Error(
      message ||
        `Expected ${chalk.bold.yellow(JSON.stringify(actual))} to not deeply equal ${chalk.bold.yellow(JSON.stringify(expected))}`,
    );
  }
}
