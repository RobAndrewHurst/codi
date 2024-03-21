export function assertFalse(actual, message) {
    if (actual !== false) {
        throw new Error(message || `Expected ${chalk.bold.yellow(actual)} to be false`);
    }
}