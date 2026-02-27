import chalk from 'chalk';

/**
 * Assert that a number is within a delta of an expected value.
 * Useful for floating-point comparisons.
 * @param {number} actual - The actual value
 * @param {number} expected - The expected value
 * @param {number} delta - The maximum allowed difference
 * @param {string} [message] - Custom error message
 */
export function assertCloseTo(actual, expected, delta, message) {
  if (
    typeof actual !== 'number' ||
    typeof expected !== 'number' ||
    typeof delta !== 'number'
  ) {
    throw new Error('assertCloseTo() expects numeric arguments');
  }
  if (Math.abs(actual - expected) > delta) {
    throw new Error(
      message ||
        `Expected ${chalk.bold.yellow(actual)} to be within ${chalk.bold.yellow(delta)} of ${chalk.bold.yellow(expected)}`,
    );
  }
}
