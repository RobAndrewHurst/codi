/**
 * Deep equality comparison utility.
 *
 * Handles: primitives (via Object.is), Date, RegExp, Map, Set,
 * Array, TypedArray, plain objects, Symbol-keyed properties,
 * and circular references.
 *
 * @param {*} a - First value
 * @param {*} b - Second value
 * @returns {boolean} Whether the two values are deeply equal
 */
export function isDeepEqual(a, b) {
  return _isDeepEqual(a, b, new Map());
}

/**
 * Internal recursive comparison with circular reference tracking.
 * @param {*} a
 * @param {*} b
 * @param {Map} seen - Maps objects already visited in `a` to their counterpart in `b`
 * @returns {boolean}
 */
function _isDeepEqual(a, b, seen) {
  // 1. Primitive / reference identity check using Object.is
  //    Correctly handles NaN === NaN (true) and -0 !== +0 (false)
  if (Object.is(a, b)) {
    return true;
  }

  // 2. If either is not an object (or is null), they're not equal
  //    (identity was already checked above)
  if (
    a === null ||
    b === null ||
    typeof a !== 'object' ||
    typeof b !== 'object'
  ) {
    return false;
  }

  // 3. Constructor must match (Array vs Object, Date vs plain, etc.)
  if (a.constructor !== b.constructor) {
    return false;
  }

  // 4. Circular reference detection
  if (seen.has(a)) {
    return seen.get(a) === b;
  }
  seen.set(a, b);

  // 5. Date comparison
  if (a instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // 6. RegExp comparison
  if (a instanceof RegExp) {
    return a.source === b.source && a.flags === b.flags;
  }

  // 7. Map comparison
  if (a instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [key, val] of a) {
      if (!b.has(key) || !_isDeepEqual(val, b.get(key), seen)) {
        return false;
      }
    }
    return true;
  }

  // 8. Set comparison
  if (a instanceof Set) {
    if (a.size !== b.size) return false;
    for (const val of a) {
      // For primitive values, use has() directly
      // For object values, we need to find a deep-equal match
      if (!b.has(val)) {
        let found = false;
        for (const bVal of b) {
          if (_isDeepEqual(val, bVal, seen)) {
            found = true;
            break;
          }
        }
        if (!found) return false;
      }
    }
    return true;
  }

  // 9. TypedArray comparison
  if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!Object.is(a[i], b[i])) return false;
    }
    return true;
  }

  // 10. Array comparison
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!_isDeepEqual(a[i], b[i], seen)) return false;
    }
    return true;
  }

  // 11. Plain object comparison using Reflect.ownKeys (includes Symbols)
  const keysA = Reflect.ownKeys(a);
  const keysB = Reflect.ownKeys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) {
      return false;
    }
    if (!_isDeepEqual(a[key], b[key], seen)) {
      return false;
    }
  }

  return true;
}
