import chalk from 'chalk';

/**
 * Console reporter — the default. Renders a hierarchical tree of suites
 * and tests with coloured pass/fail/skip indicators.
 */
export const consoleReporter = {
  name: 'console',

  /**
   * Called once after all tests have run.
   * @param {object} results - { suiteStack, passedTests, failedTests, skippedTests, executionTime }
   * @param {object} options - Runtime options (quiet, etc.)
   */
  report(results, options = {}) {
    const {
      suiteStack,
      passedTests,
      failedTests,
      skippedTests,
      executionTime,
    } = results;

    for (const id of Object.keys(suiteStack)) {
      printSuite(suiteStack[id], 0, options);
    }

    console.log(chalk.bold.cyan('\nTest Summary:'));
    console.log(chalk.green(`  Passed: ${passedTests}`));
    console.log(chalk.red(`  Failed: ${failedTests}`));
    if (skippedTests > 0) {
      console.log(chalk.yellow(`  Skipped: ${skippedTests}`));
    }
    console.log(chalk.blue(`  Time: ${executionTime}s`));
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function hasFailingTests(suite) {
  if (suite.tests?.some((test) => test.status === 'failed')) {
    return true;
  }
  if (suite.children) {
    return suite.children.some((child) => hasFailingTests(child));
  }
  return false;
}

function printSuite(suite, indent, options) {
  const indentation = '  '.repeat(indent);

  let results = suite.tests;
  let hasFailingChildren = false;

  if (options.quiet) {
    results = results.filter((result) => result.status === 'failed');
  }

  if (suite.children) {
    hasFailingChildren = suite.children.some((child) => hasFailingTests(child));
  }

  // Print suite name when there are results or failing children to show
  if ((suite.children.length > 0 && hasFailingChildren) || results.length > 0) {
    console.log('\n' + indentation + chalk.yellow(chalk.bold(suite.name)));
  }

  for (const result of results) {
    if (result.status === 'failed') {
      console.log(
        indentation +
          chalk.red(`  └─ ⛔ ${result.name} (${result.duration.toFixed(2)}ms)`),
      );
      const errorMessage = result.error?.message
        ? result.error.message
        : 'Unknown error';
      console.log(indentation + chalk.red(`     ${errorMessage}`));
    } else if (result.status === 'skipped') {
      if (!options.quiet) {
        console.log(
          indentation + chalk.yellow(`  └─ ⏭  ${result.name} (skipped)`),
        );
      }
    } else {
      console.log(
        indentation +
          chalk.green(
            `  └─ ✅ ${result.name} (${result.duration.toFixed(2)}ms)`,
          ),
      );
    }
  }

  // Print child suites
  if (suite.children) {
    for (const child of suite.children) {
      printSuite(child, indent + 1, options);
    }
  }
}
