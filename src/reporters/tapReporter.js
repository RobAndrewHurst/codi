/**
 * TAP (Test Anything Protocol) reporter.
 * Outputs TAP v13 compatible output.
 */
export const tapReporter = {
  name: 'tap',

  /**
   * @param {object} results - { suiteStack, passedTests, failedTests, skippedTests, executionTime }
   */
  report(results) {
    const { suiteStack } = results;
    const tests = collectTests(suiteStack);

    console.log('TAP version 13');
    console.log(`1..${tests.length}`);

    let i = 1;
    for (const { suiteName, test } of tests) {
      const fullName = `${suiteName} > ${test.name}`;

      if (test.status === 'skipped') {
        console.log(`ok ${i} - ${fullName} # SKIP`);
      } else if (test.status === 'failed') {
        console.log(`not ok ${i} - ${fullName}`);
        if (test.error) {
          console.log('  ---');
          console.log(`  message: ${test.error.message || 'Unknown error'}`);
          if (test.error.stack) {
            console.log(`  stack: |`);
            for (const line of test.error.stack.split('\n')) {
              console.log(`    ${line}`);
            }
          }
          console.log('  ...');
        }
      } else {
        console.log(`ok ${i} - ${fullName}`);
      }

      i++;
    }
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
