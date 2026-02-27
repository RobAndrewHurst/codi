/**
 * Reporter plugin registry.
 *
 * Usage:
 *   import { getReporter } from './reporters/index.js';
 *   const reporter = getReporter('json');
 *   reporter.report(results, options);
 */

import { consoleReporter } from './consoleReporter.js';
import { dotReporter } from './dotReporter.js';
import { jsonReporter } from './jsonReporter.js';
import { junitReporter } from './junitReporter.js';
import { tapReporter } from './tapReporter.js';

const reporters = {
  console: consoleReporter,
  json: jsonReporter,
  junit: junitReporter,
  tap: tapReporter,
  dot: dotReporter,
};

/**
 * Get a reporter by name.
 * @param {string} name - Reporter name (console, json, junit, tap, dot)
 * @returns {object} Reporter object with a report(results, options) method
 * @throws {Error} If the reporter name is not recognized
 */
export function getReporter(name = 'console') {
  const reporter = reporters[name];
  if (!reporter) {
    const available = Object.keys(reporters).join(', ');
    throw new Error(
      `Unknown reporter "${name}". Available reporters: ${available}`,
    );
  }
  return reporter;
}

export {
  consoleReporter,
  dotReporter,
  jsonReporter,
  junitReporter,
  tapReporter,
};
