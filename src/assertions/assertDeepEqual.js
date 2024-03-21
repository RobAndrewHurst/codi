
export function assertDeepEqual(actual, expected, message) {
    if (!isDeepEqual(actual, expected)) {
        throw new Error(message || `Expected ${chalk.bold.yellow(JSON.stringify(actual))} to deeply equal ${chalk.bold.yellow(JSON.stringify(expected))}`);
    }
}

// Helper function to compare objects deeply
function isDeepEqual(obj1, obj2) {
    if (obj1 === obj2) {
        return true;
    }

    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
        return false;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (const key of keys1) {
        if (!keys2.includes(key) || !isDeepEqual(obj1[key], obj2[key])) {
            return false;
        }
    }

    return true;
}