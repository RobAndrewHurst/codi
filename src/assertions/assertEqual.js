import chalk from 'chalk';
import { isDeepEqual } from '../util/deepEqual.js';
import { formatDiff } from '../util/diff.js';

export function assertEqual(actual, expected, message) {
  if (!isDeepEqual(actual, expected)) {
    // For complex objects, provide a detailed diff
    if (
      typeof actual === 'object' &&
      actual !== null &&
      typeof expected === 'object' &&
      expected !== null
    ) {
      const diff = formatDiff(actual, expected);
      throw new Error(
        message ||
          `Expected objects to be deeply equal.\nDifferences:\n${diff}`,
      );
    }
    throw new Error(
      message ||
        `Expected ${chalk.bold.yellow(JSON.stringify(actual))} to deeply equal ${chalk.bold.yellow(JSON.stringify(expected))}`,
    );
  }
}
