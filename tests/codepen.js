// Try to import from ESM CDN with error handling
let codi;
try {
  // Use the browser-specific build to avoid Node.js dependencies
  codi = await import(
    'https://cdn.jsdelivr.net/npm/codi-test-framework@1.0.39/src/_codi.browser.js'
  );
  console.log('✅ Successfully loaded Codi from JSDelivr CDN');
} catch (error) {
  console.error('❌ Failed to import Codi from CDN:', error.message);
  console.log('📝 Using fallback implementation...');

  // Fallback: create a minimal codi implementation
  codi = {
    describe: (params, callback) => {
      console.log(`📋 Suite: ${params.name}`);
      return Promise.resolve(callback());
    },
    it: (params, callback) => {
      console.log(`  🧪 Test: ${params.name}`);
      return Promise.resolve(callback());
    },
    assertEqual: (actual, expected, message) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(message || `Expected ${actual} to equal ${expected}`);
      }
      console.log('    ✅ Assertion passed');
    },
    runWebTestFunction: async (testFn, options = {}) => {
      console.log('🚀 Running tests with fallback implementation...');
      try {
        await testFn();
        console.log('🎉 Tests completed successfully');
        return { passedTests: 1, failedTests: 0, suiteStack: {} };
      } catch (error) {
        console.error('💥 Test failed:', error.message);
        return { passedTests: 0, failedTests: 1, suiteStack: {} };
      }
    },
    codepenLogging: () => {
      console.log('📺 Codepen logging initialized (fallback)');
      return console;
    },
  };
}

codi.codepenLogging();

// Main test execution
await codi.runWebTestFunction(
  async () => {
    // Sequential setup tests
    await setupTests();

    // Parallel test batches
    await Promise.all([batchOne(), batchTwo(), batchThree(), batchFour()]);
  },
  {
    quiet: false, // Changed to false to ensure output
    showSummary: true,
  },
);

// Sequential setup tests
async function setupTests() {
  codi.describe({ name: 'Setup Tests', id: 'setup' }, async () => {
    codi.it({ name: 'Should initilise setup', parentId: 'setup' }, async () => {
      await simulateDelay(250);
      codi.assertEqual(true, true, 'Workspace initialized');
      console.log('Test 1');
    });

    codi.it(
      { name: 'Should do some more setup', parentId: 'setup' },
      async () => {
        await simulateDelay(150);
        codi.assertEqual(true, true, 'Query system ready');
        console.log('Test 2');
      },
    );
  });
}

// Test batch 1
async function batchOne() {
  codi.describe({ name: 'batch_1', id: '1' }, async () => {
    await Promise.all([
      codi.it({ name: 'Test 1.1', parentId: '1' }, async () => {
        await simulateDelay(100);
        codi.assertEqual(true, true, 'Test 1.1 passed');
        console.log('Test 4');
      }),
      codi.it({ name: 'Test 1.2', parentId: '1' }, async () => {
        await simulateDelay(75);
        codi.assertEqual(true, true, 'Test 1.2 passed');
        console.log('Test 5');
      }),
      codi.it({ name: 'Test 1.3', parentId: '1' }, async () => {
        await simulateDelay(50);
        codi.assertEqual(false, false, 'Test 1.3 passed');
        console.log('Test 6');
      }),
    ]);
  });
}

// Test batch 2
async function batchTwo() {
  codi.describe({ name: 'batch_2', id: '2', parentId: '1' }, async () => {
    Promise.all([
      codi.it({ name: 'Test 2.1', parentId: '2' }, async () => {
        await simulateDelay(125);
        codi.assertEqual(true, true, 'Test 2.1 passed');
        console.log('Test 7');
      }),
      codi.it({ name: 'Test 2.2', parentId: '2' }, async () => {
        await simulateDelay(150);
        codi.assertEqual(1, 2, 'This test should fail');
        console.log('Test 8');
      }),
      codi.it({ name: 'Test 2.3', parentId: '2' }, async () => {
        await simulateDelay(175);
        codi.assertEqual(true, true, 'Test 2.3 passed');
        console.log('Test 9');
      }),
    ]);
  });
}

// Test batch 3
async function batchThree() {
  codi.describe({ name: 'batch_3', id: '3', parentId: '2' }, async () => {
    await Promise.all([
      codi.it({ name: 'Test 3.1', parentId: '3' }, async () => {
        await simulateDelay(200);
        codi.assertEqual(true, true, 'Test 3.1 passed');
        console.log('Test 10');
      }),
      codi.it({ name: 'Test 3.2', parentId: '3' }, async () => {
        await simulateDelay(225);
        codi.assertEqual(true, true, 'Test 4.2 passed');
        console.log('Test 11');
      }),
      codi.it({ name: 'Test 3.3', parentId: '3' }, async () => {
        await simulateDelay(250);
        codi.assertEqual({ a: 1 }, { a: 1 }, 'Test 3.3 passed');
        console.log('Test 12');
      }),
    ]);
  });
}

async function batchFour() {
  codi.describe({ name: 'batch_4', id: '4', parentId: '3' }, async () => {
    await Promise.all([
      codi.it({ name: 'Test 4.1', parentId: '4' }, async () => {
        await simulateDelay(900);
        codi.assertEqual(true, true, 'Test 4.1 passed');
        console.log('Test 13');
      }),
      codi.it({ name: 'Test 4.2', parentId: '4' }, async () => {
        await simulateDelay(3600);
        codi.assertEqual(true, true, 'Test 4.2 passed');
        console.log('Test 14');
      }),
      codi.it({ name: 'Test 4.3', parentId: '4' }, async () => {
        await simulateDelay(500);
        codi.assertEqual({ a: 1 }, { a: 2 }, 'Test 4.3 failed');
        console.log('Test 15');
      }),
    ]);
  });
}

function simulateDelay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
