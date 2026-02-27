/**
 * Worker thread script for parallel test execution.
 *
 * Receives a test file path via workerData, imports and runs it,
 * then posts the results back to the parent thread.
 */
import { parentPort, workerData } from 'node:worker_threads';
import { ready } from '../_codi.js';
import { state } from '../state/TestState.js';

const { testFile, options } = workerData;

async function run() {
  await ready;

  state.resetCounters();
  state.startTimer();
  if (options) {
    state.setOptions(options);
  }

  try {
    const fileUrl = testFile.startsWith('file://')
      ? testFile
      : `file://${testFile}`;
    await import(fileUrl);
  } catch (error) {
    state.failedTests++;
    // Create a synthetic suite to hold the file-level error
    const errorSuite = state.pushSuite({
      name: `File error: ${testFile}`,
      id: `__file_error_${Date.now()}`,
    });
    state.addTestToSuite(errorSuite, {
      name: `Failed to load ${testFile}`,
      status: 'failed',
      error: { message: error.message, stack: error.stack },
      duration: 0,
    });
  }

  // Serialize the suite stack — strip non-serializable data (circular parent refs, hook functions)
  const serializedSuites = serializeSuiteStack(state.suiteStack);

  parentPort.postMessage({
    testFile,
    passedTests: state.passedTests,
    failedTests: state.failedTests,
    skippedTests: state.skippedTests,
    suiteStack: serializedSuites,
    executionTime: state.getExecutionTime(),
  });
}

/**
 * Recursively serialize the suite stack, removing non-transferable properties
 * (parent references, hook functions).
 */
function serializeSuiteStack(suiteStack) {
  const result = {};

  for (const [id, suite] of Object.entries(suiteStack)) {
    result[id] = serializeSuite(suite);
  }

  return result;
}

function serializeSuite(suite) {
  return {
    name: suite.name,
    id: suite.id,
    parentId: suite.parentId || null,
    duration: suite.duration,
    skipped: suite.skipped || false,
    tests: suite.tests.map((t) => ({
      name: t.name,
      status: t.status,
      duration: t.duration,
      error: t.error
        ? { message: t.error.message, stack: t.error.stack }
        : null,
    })),
    children: (suite.children || []).map((child) => serializeSuite(child)),
  };
}

run().catch((err) => {
  parentPort.postMessage({
    testFile,
    passedTests: 0,
    failedTests: 1,
    skippedTests: 0,
    suiteStack: {},
    executionTime: '0.00',
    error: { message: err.message, stack: err.stack },
  });
});
