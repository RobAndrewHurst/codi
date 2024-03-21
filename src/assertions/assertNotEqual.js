export function assertNotEqual(actual, expected, message) {
  if (actual === expected) {
    throw new Error(message || `Expected ${chalk.bold.yellow(actual)} not to equal ${chalk.bold.yellow(expected)}`);
  }
}