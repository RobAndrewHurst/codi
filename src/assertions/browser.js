// Browser-compatible assertion functions without chalk dependencies

export function assertEqual(actual, expected, message) {
  if (!isDeepEqual(actual, expected)) {
    throw new Error(
      message ||
        `Expected ${JSON.stringify(actual)} to deeply equal ${JSON.stringify(expected)}`,
    );
  }
}

export function assertNotEqual(actual, expected, message) {
  if (actual === expected) {
    throw new Error(message || `Expected ${actual} not to equal ${expected}`);
  }
}

export function assertTrue(actual, message) {
  if (actual !== true) {
    throw new Error(message || `Expected ${actual} to be true`);
  }
}

export function assertFalse(actual, message) {
  if (actual !== false) {
    throw new Error(message || `Expected ${actual} to be false`);
  }
}

export function assertThrows(callback, errorMessage, message) {
  try {
    callback();
    throw new Error(message || 'Expected an error to be thrown');
  } catch (error) {
    if (error.message !== errorMessage) {
      throw new Error(
        message ||
          `Expected error message to be ${errorMessage}, but got ${error.message}`,
      );
    }
  }
}

export function assertNoDuplicates(arr, message) {
  //Filter array until for duplicate entries
  arr = arr.filter((item, index) => arr.indexOf(item) !== index);
  if (arr.length > 0) {
    throw new Error(message || `Duplicates found: ${arr}`);
  }
}

// Helper function to compare objects deeply
function isDeepEqual(obj1, obj2) {
  if (obj1 === obj2) {
    return true;
  }

  if (
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object' ||
    obj1 === null ||
    obj2 === null
  ) {
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

export default {
  assertEqual,
  assertNotEqual,
  assertTrue,
  assertFalse,
  assertThrows,
  assertNoDuplicates,
};
