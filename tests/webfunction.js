import { runWebTestFunction } from "../src/runners/webRunner.js";
import { describe, it, assertEqual } from '../src/testRunner.js';

// Main test execution
await runWebTestFunction(async () => {
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
    await describe('Setup Tests', async () => {
        await it('should initialize workspace', async () => {
            await simulateDelay(100);
            assertEqual(true, true, 'Workspace initialized');
        });

        await it('should setup query system', async () => {
            await simulateDelay(150);
            assertEqual(true, true, 'Query system ready');
        });
    });
}

// Test batch 1
async function batchOne() {
    await describe('First Batch', async () => {
        await Promise.all([
            it('Test 1.1', async () => {
                await simulateDelay(100);
                assertEqual(true, true, 'Test 1.1 passed');
            }),
            it('Test 1.2', async () => {
                await simulateDelay(75);
                assertEqual(true, true, 'Test 1.2 passed');
            }),
            it('Test 1.3', async () => {
                await simulateDelay(50);
                assertEqual(false, false, 'Test 1.3 passed');
            })
        ]);
    });
}

// Test batch 2
async function batchTwo() {
    await describe('Second Batch', async () => {
        await Promise.all([
            it('Test 2.1', async () => {
                await simulateDelay(125);
                assertEqual(true, true, 'Test 2.1 passed');
            }),
            it('Test 2.2', async () => {
                await simulateDelay(150);
                assertEqual(1, 2, 'This test should fail');
            }),
            it('Test 2.3', async () => {
                await simulateDelay(175);
                assertEqual(true, true, 'Test 2.3 passed');
            })
        ]);
    });
}

// Test batch 3
async function batchThree() {
    await describe('Third Batch', async () => {
        await Promise.all([
            it('Test 3.1', async () => {
                await simulateDelay(200);
                assertEqual(true, true, 'Test 3.1 passed');
            }),
            it('Test 3.2', async () => {
                await simulateDelay(225);
                assertEqual(true, true, 'Test 3.2 passed');
            }),
            it('Test 3.3', async () => {
                await simulateDelay(250);
                assertEqual({ a: 1 }, { a: 1 }, 'Test 3.3 passed');
            })
        ]);
    });
}

function simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}