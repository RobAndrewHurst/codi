import { runWebTestFunction } from "../src/runners/webRunner.js";
import { describe, it, assertEqual } from '../src/testRunner.js';

// Main test execution
const results = await runWebTestFunction(async () => {
    // Sequential setup tests
    await setupTests();

    // Parallel test batches
    await Promise.all([
        batchOne(),
        batchTwo(),
        batchThree()
    ]);
}, {
    quiet: false,
    showSummary: true
});

// Sequential setup tests
async function setupTests() {
    await describe({ description: 'Setup Tests', id: 'setup' }, async () => {
        it({ description: 'Should initilise setup', parentId: 'setup' }, async () => {
            await simulateDelay(100);
            assertEqual(true, true, 'Workspace initialized');
        });

        it({ description: 'Should do some more setup', parentId: 'setup' }, async () => {
            await simulateDelay(150);
            assertEqual(true, true, 'Query system ready');
        });
    });
}

// Test batch 1
async function batchOne() {
    await describe({ description: 'FirstBatch', id: 'first' }, async () => {
        await Promise.all([
            it({ description: 'Test 1.1', parentId: 'first' }, async () => {
                await simulateDelay(100);
                assertEqual(true, true, 'Test 1.1 passed');
            }),
            it({ description: 'Test 1.2', parentId: 'first' }, async () => {
                await simulateDelay(75);
                assertEqual(true, true, 'Test 1.2 passed');
            }),
            it({ description: 'Test 1.3', parentId: 'first' }, async () => {
                await simulateDelay(50);
                assertEqual(false, false, 'Test 1.3 passed');
            })
        ]);
    });
}

// Test batch 2
async function batchTwo() {
    await describe({ description: 'SecondBatch', id: 'second' }, async () => {
        await Promise.all([
            it({ description: 'Test 2.1', parentId: 'second' }, async () => {
                await simulateDelay(125);
                assertEqual(true, true, 'Test 2.1 passed');
            }),
            it({ description: 'Test 2.2', parentId: 'second' }, async () => {
                await simulateDelay(150);
                assertEqual(1, 2, 'This test should fail');
            }),
            it({ description: 'Test 2.3', parentId: 'second' }, async () => {
                await simulateDelay(175);
                assertEqual(true, true, 'Test 2.3 passed');
            })
        ]);
    });
}

// Test batch 3
async function batchThree() {
    await describe({ description: 'thirdBatch', id: 'third' }, async () => {
        await Promise.all([
            it({ description: 'Test 3.1', parentId: 'third' }, async () => {
                await simulateDelay(200);
                assertEqual(true, true, 'Test 3.1 passed');
            }),
            it({ description: 'Test 3.2', parentId: 'third' }, async () => {
                await simulateDelay(225);
                assertEqual(true, true, 'Test 3.2 passed');
            }),
            it({ description: 'Test 3.3', parentId: 'third' }, async () => {
                await simulateDelay(250);
                assertEqual({ a: 1 }, { a: 1 }, 'Test 3.3 passed');
            })
        ]);
    });
}

function simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// console.log(results);