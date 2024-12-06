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
        batchThree(),
        batchFour()
    ]);
}, {
    quiet: false,
    showSummary: true
});

// Sequential setup tests
async function setupTests() {
    await describe({ name: 'Setup Tests', id: 'setup' }, async () => {
        it({ name: 'Should initilise setup', parentId: 'setup' }, async () => {
            await simulateDelay(100);
            assertEqual(true, true, 'Workspace initialized');
        });

        it({ name: 'Should do some more setup', parentId: 'setup' }, async () => {
            await simulateDelay(150);
            assertEqual(true, true, 'Query system ready');
        });
    });
}

// Test batch 1
async function batchOne() {
    await describe({ name: 'batch_1', id: '1' }, async () => {
        await Promise.all([
            it({ name: 'Test 1.1', parentId: '1' }, async () => {
                await simulateDelay(100);
                assertEqual(true, true, 'Test 1.1 passed');
            }),
            it({ name: 'Test 1.2', parentId: '1' }, async () => {
                await simulateDelay(75);
                assertEqual(true, true, 'Test 1.2 passed');
            }),
            it({ name: 'Test 1.3', parentId: '1' }, async () => {
                await simulateDelay(50);
                assertEqual(false, false, 'Test 1.3 passed');
            })
        ]);
    });
}

// Test batch 2
async function batchTwo() {
    await describe({ name: 'batch_2', id: '2', parentId: '1' }, async () => {
        await Promise.all([
            it({ name: 'Test 2.1', parentId: '2' }, async () => {
                await simulateDelay(125);
                assertEqual(true, true, 'Test 2.1 passed');
            }),
            it({ name: 'Test 2.2', parentId: '2' }, async () => {
                await simulateDelay(150);
                assertEqual(1, 2, 'This test should fail');
            }),
            it({ name: 'Test 2.3', parentId: '2' }, async () => {
                await simulateDelay(175);
                assertEqual(true, true, 'Test 2.3 passed');
            })
        ]);
    });
}

// Test batch 3
async function batchThree() {
    await describe({ name: 'batch_3', id: '3', parentId: '2' }, async () => {
        await Promise.all([
            it({ name: 'Test 3.1', parentId: '3' }, async () => {
                await simulateDelay(200);
                assertEqual(true, true, 'Test 3.1 passed');
            }),
            it({ name: 'Test 3.2', parentId: '3' }, async () => {
                await simulateDelay(225);
                assertEqual(true, true, 'Test 3.2 passed');
            }),
            it({ name: 'Test 3.3', parentId: '3' }, async () => {
                await simulateDelay(250);
                assertEqual({ a: 1 }, { a: 1 }, 'Test 3.3 passed');
            })
        ]);
    });
}

async function batchFour() {
    await describe({ name: 'batch_4', id: '4', parentId: '3' }, async () => {
        await Promise.all([
            it({ name: 'Test 4.1', parentId: '4' }, async () => {
                await simulateDelay(200);
                assertEqual(true, true, 'Test 4.1 passed');
            }),
            it({ name: 'Test 4.2', parentId: '4' }, async () => {
                await simulateDelay(225);
                assertEqual(true, true, 'Test 4.2 passed');
            }),
            it({ name: 'Test 4.3', parentId: '4' }, async () => {
                await simulateDelay(250);
                assertEqual({ a: 1 }, { a: 1 }, 'Test 4.3 passed');
            })
        ]);
    });
}

function simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// console.log(results);