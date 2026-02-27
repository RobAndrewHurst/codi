/**
 * JSON reporter — outputs a machine-readable JSON object for CI parsing.
 */
export const jsonReporter = {
  name: 'json',

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

    const output = {
      stats: {
        passed: passedTests,
        failed: failedTests,
        skipped: skippedTests,
        total: passedTests + failedTests + skippedTests,
        duration: executionTime,
      },
      suites: flattenSuites(suiteStack),
    };

    console.log(JSON.stringify(output, null, 2));
  },
};

function flattenSuites(suiteStack) {
  const suites = [];

  function visit(suite) {
    suites.push({
      name: suite.name,
      id: suite.id,
      parentId: suite.parentId || null,
      duration: suite.duration,
      tests: suite.tests.map((t) => ({
        name: t.name,
        status: t.status,
        duration: t.duration,
        error: t.error
          ? { message: t.error.message, stack: t.error.stack }
          : null,
      })),
    });

    if (suite.children) {
      for (const child of suite.children) {
        visit(child);
      }
    }
  }

  for (const suite of Object.values(suiteStack)) {
    visit(suite);
  }

  return suites;
}
