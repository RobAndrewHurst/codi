import chalk from 'chalk';

/**
 * Dot reporter — minimal output for large test suites.
 * Prints one character per test: . (pass), F (fail), S (skip).
 */
export const dotReporter = {
  name: 'dot',

  /**
   * @param {object} results - { suiteStack, passedTests, failedTests, skippedTests, executionTime }
   */
  report(results) {
    const {
      suiteStack,
      passedTests,
      failedTests,
      skippedTests,
      executionTime,
    } = results;
    const tests = collectTests(suiteStack);
    const failures = [];

    // Print dots
    const chars = [];
    for (const { suiteName, test } of tests) {
      if (test.status === 'failed') {
        chars.push(chalk.red('F'));
        failures.push({ suiteName, test });
      } else if (test.status === 'skipped') {
        chars.push(chalk.yellow('S'));
      } else {
        chars.push(chalk.green('.'));
      }
    }

    // Wrap at 80 chars
    const line = chars.join('');
    const rawLine = tests
      .map((t) =>
        t.test.status === 'failed'
          ? 'F'
          : t.test.status === 'skipped'
            ? 'S'
            : '.',
      )
      .join('');

    // Print in chunks of 80
    for (let i = 0; i < chars.length; i += 80) {
      console.log(chars.slice(i, i + 80).join(''));
    }

    console.log('');

    // Print failure details
    if (failures.length > 0) {
      console.log(chalk.red('\nFailures:\n'));
      for (let i = 0; i < failures.length; i++) {
        const { suiteName, test } = failures[i];
        console.log(chalk.red(`  ${i + 1}) ${suiteName} > ${test.name}`));
        const msg = test.error?.message || 'Unknown error';
        console.log(chalk.red(`     ${msg}`));
        console.log('');
      }
    }

    // Summary line
    const total = passedTests + failedTests + skippedTests;
    const parts = [];
    parts.push(chalk.green(`${passedTests} passing`));
    if (failedTests > 0) parts.push(chalk.red(`${failedTests} failing`));
    if (skippedTests > 0) parts.push(chalk.yellow(`${skippedTests} skipped`));
    parts.push(chalk.blue(`(${executionTime}s)`));
    console.log(parts.join(', '));
  },
};

function collectTests(suiteStack) {
  const tests = [];

  function visit(suite) {
    for (const test of suite.tests) {
      tests.push({ suiteName: suite.name, test });
    }
    if (suite.children) {
      for (const child of suite.children) {
        visit(child);
      }
    }
  }

  for (const suite of Object.values(suiteStack)) {
    visit(suite);
  }

  return tests;
}
