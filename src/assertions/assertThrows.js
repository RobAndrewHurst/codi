export function assertThrows(callback, errorMessage, message) {
    try {
        callback();
        throw new Error(message || 'Expected an error to be thrown');
    } catch (error) {
        if (error.message !== errorMessage) {
            throw new Error(message || `Expected error message to be ${chalk.bold.yellow(errorMessage)}, but got ${chalk.bold.yellow(error.message)}`);
        }
    }
}