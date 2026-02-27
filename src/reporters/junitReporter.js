/**
 * JUnit XML reporter — outputs JUnit-compatible XML for CI systems
 * (Jenkins, GitHub Actions, etc.).
 */
export const junitReporter = {
  name: 'junit',

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
    const total = passedTests + failedTests + skippedTests;

    const lines = [];
    lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    lines.push(
      `<testsuites tests="${total}" failures="${failedTests}" skipped="${skippedTests}" time="${executionTime}">`,
    );

    for (const suite of Object.values(suiteStack)) {
      visitSuite(suite, lines);
    }

    lines.push('</testsuites>');
    console.log(lines.join('\n'));
  },
};

function visitSuite(suite, lines) {
  const tests = suite.tests;
  const failures = tests.filter((t) => t.status === 'failed').length;
  const skipped = tests.filter((t) => t.status === 'skipped').length;
  const suiteDuration =
    suite.duration != null ? (suite.duration / 1000).toFixed(3) : '0.000';

  lines.push(
    `  <testsuite name="${escapeXml(suite.name)}" tests="${tests.length}" failures="${failures}" skipped="${skipped}" time="${suiteDuration}">`,
  );

  for (const test of tests) {
    const duration =
      test.duration != null ? (test.duration / 1000).toFixed(3) : '0.000';
    lines.push(
      `    <testcase name="${escapeXml(test.name)}" classname="${escapeXml(suite.name)}" time="${duration}">`,
    );

    if (test.status === 'failed') {
      const msg = test.error?.message || 'Unknown error';
      const stack = test.error?.stack || '';
      lines.push(
        `      <failure message="${escapeXml(msg)}">${escapeXml(stack)}</failure>`,
      );
    } else if (test.status === 'skipped') {
      lines.push('      <skipped/>');
    }

    lines.push('    </testcase>');
  }

  lines.push('  </testsuite>');

  // Recurse into children
  if (suite.children) {
    for (const child of suite.children) {
      visitSuite(child, lines);
    }
  }
}

function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
