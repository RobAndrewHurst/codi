/**
 * Generate a human-readable diff between two values.
 * Walks both objects and returns a list of paths where they diverge.
 *
 * @param {*} actual
 * @param {*} expected
 * @param {string} [path=''] - Current path prefix (for recursion)
 * @returns {string[]} Array of diff description strings
 */
export function generateDiff(actual, expected, path = '') {
  const diffs = [];

  // Primitives or type mismatch
  if (typeof actual !== typeof expected) {
    diffs.push(
      `  ${path || '(root)'}: typeof ${typeof actual} !== typeof ${typeof expected}`,
    );
    return diffs;
  }

  if (actual === null || expected === null || typeof actual !== 'object') {
    if (!Object.is(actual, expected)) {
      diffs.push(
        `  ${path || '(root)'}: ${JSON.stringify(actual)} !== ${JSON.stringify(expected)}`,
      );
    }
    return diffs;
  }

  // Array comparison
  if (Array.isArray(actual) || Array.isArray(expected)) {
    if (!Array.isArray(actual) || !Array.isArray(expected)) {
      diffs.push(`  ${path || '(root)'}: one is an array, the other is not`);
      return diffs;
    }
    const maxLen = Math.max(actual.length, expected.length);
    for (let i = 0; i < maxLen; i++) {
      const itemPath = `${path}[${i}]`;
      if (i >= actual.length) {
        diffs.push(`  ${itemPath}: missing in actual`);
      } else if (i >= expected.length) {
        diffs.push(`  ${itemPath}: unexpected in actual`);
      } else {
        diffs.push(...generateDiff(actual[i], expected[i], itemPath));
      }
    }
    return diffs;
  }

  // Object comparison
  const allKeys = new Set([...Object.keys(actual), ...Object.keys(expected)]);
  for (const key of allKeys) {
    const keyPath = path ? `${path}.${key}` : `.${key}`;
    if (!(key in actual)) {
      diffs.push(`  ${keyPath}: missing in actual`);
    } else if (!(key in expected)) {
      diffs.push(`  ${keyPath}: unexpected in actual (not in expected)`);
    } else {
      diffs.push(...generateDiff(actual[key], expected[key], keyPath));
    }
  }

  return diffs;
}

/**
 * Format a diff into a readable string for error messages.
 * @param {*} actual
 * @param {*} expected
 * @returns {string}
 */
export function formatDiff(actual, expected) {
  const diffs = generateDiff(actual, expected);
  if (diffs.length === 0) {
    return '  (no differences found)';
  }
  // Limit to 10 diffs to avoid overwhelming output
  const limited = diffs.slice(0, 10);
  let result = limited.join('\n');
  if (diffs.length > 10) {
    result += `\n  ... and ${diffs.length - 10} more difference(s)`;
  }
  return result;
}
