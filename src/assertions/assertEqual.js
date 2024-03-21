export function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(message || `Expected ${chalk.bold.yellow(actual)} to equal ${chalk.bold.yellow(expected)}`);
    }
}