import { runWebTestFunction } from "../src/runners/webRunner.js";
import { describe, it, assertEqual } from "../src/_codi.js";

// Main test execution
const results = await runWebTestFunction(
  async () => {
    // Sequential setup tests
    await setupTests();

    // Parallel test batches
    await Promise.all([
      batchOne(),
      batchTwo(),
      batchThree(),
      batchFour(),
      batchFive(),
      batchSix(),
    ]);
  },
  {
    quiet: true,
    showSummary: true,
  },
);

// Sequential setup tests
async function setupTests() {
  describe({ name: "Setup Tests", id: "setup" }, async () => {
    it({ name: "Should initilise setup", parentId: "setup" }, async () => {
      await simulateDelay(250);
      assertEqual(true, true, "Workspace initialized");
      console.log("Test 1");
    });

    it({ name: "Should do some more setup", parentId: "setup" }, async () => {
      await simulateDelay(150);
      assertEqual(true, true, "Query system ready");
      console.log("Test 2");
    });
  });
}

// Test batch 1
async function batchOne() {
  describe({ name: "batch_1", id: "1" }, async () => {
    await Promise.all([
      it({ name: "Test 1.1", parentId: "1" }, async () => {
        await simulateDelay(100);
        assertEqual(true, true, "Test 1.1 passed");
        console.log("Test 4");
      }),
      it({ name: "Test 1.2", parentId: "1" }, async () => {
        await simulateDelay(75);
        assertEqual(true, true, "Test 1.2 passed");
        console.log("Test 5");
      }),
      it({ name: "Test 1.3", parentId: "1" }, async () => {
        await simulateDelay(50);
        assertEqual(false, false, "Test 1.3 passed");
        console.log("Test 6");
      }),
    ]);
  });
}

// Test batch 2
async function batchTwo() {
  describe({ name: "batch_2", id: "2", parentId: "1" }, async () => {
    Promise.all([
      it({ name: "Test 2.1", parentId: "2" }, async () => {
        await simulateDelay(125);
        assertEqual(true, true, "Test 2.1 passed");
        console.log("Test 7");
      }),
      it({ name: "Test 2.2", parentId: "2" }, async () => {
        await simulateDelay(150);
        assertEqual(1, 2, "This test should fail");
        console.log("Test 8");
      }),
      it({ name: "Test 2.3", parentId: "2" }, async () => {
        await simulateDelay(175);
        assertEqual(true, true, "Test 2.3 passed");
        console.log("Test 9");
      }),
    ]);
  });
}

// Test batch 3
async function batchThree() {
  describe({ name: "batch_3", id: "3", parentId: "2" }, async () => {
    await Promise.all([
      it({ name: "Test 3.1", parentId: "3" }, async () => {
        await simulateDelay(200);
        assertEqual(true, true, "Test 3.1 passed");
        console.log("Test 10");
      }),
      it({ name: "Test 3.2", parentId: "3" }, async () => {
        await simulateDelay(225);
        assertEqual(true, true, "Test 4.2 passed");
        console.log("Test 11");
      }),
      it({ name: "Test 3.3", parentId: "3" }, async () => {
        await simulateDelay(250);
        assertEqual({ a: 1 }, { a: 1 }, "Test 3.3 passed");
        console.log("Test 12");
      }),
    ]);
  });
}

async function batchFour() {
  describe({ name: "batch_4", id: "4", parentId: "3" }, async () => {
    await Promise.all([
      it({ name: "Test 4.1", parentId: "4" }, async () => {
        await simulateDelay(900);
        assertEqual(true, true, "Test 4.1 passed");
        console.log("Test 13");
      }),
      it({ name: "Test 4.2", parentId: "4" }, async () => {
        await simulateDelay(3600);
        assertEqual(true, true, "Test 4.2 passed");
        console.log("Test 14");
      }),
      it({ name: "Test 4.3", parentId: "4" }, async () => {
        await simulateDelay(500);
        assertEqual({ a: 1 }, { a: 2 }, "Test 4.3 failed");
        console.log("Test 15");
      }),
    ]);
  });
}

async function batchFive() {
  describe({ name: "batch_5", id: "5" }, async () => {
    await Promise.all([
      it({ name: "Test 5.1", parentId: "5" }, async () => {
        assertEqual(true, true, "Test 5.1 passed");
        console.log("Test 16");
      }),
      it({ name: "Test 5.2", parentId: "5" }, async () => {
        assertEqual(true, true, "Test 4.2 passed");
        console.log("Test 17");
      }),
      it({ name: "Test 5.3", parentId: "5" }, async () => {
        assertEqual({ a: 1 }, { a: 1 }, "Test 5.3 failed");
        console.log("Test 18");
      }),
    ]);
  });
}

async function batchSix() {
  describe({ name: "batch_6", id: "6", parentId: "5" }, async () => {
    await Promise.all([
      it({ name: "Test 6.1", parentId: "6" }, async () => {
        assertEqual(true, true, "Test 6.1 passed");
        console.log("Test 19");
      }),
      it({ name: "Test 6.2", parentId: "6" }, async () => {
        assertEqual(true, true, "Test 6.2 passed");
        console.log("Test 20");
      }),
      it({ name: "Test 6.3", parentId: "6" }, async () => {
        assertEqual({ a: 1 }, { a: 2 }, "Test 6.3 failed");
        console.log("Test 21");
      }),
    ]);
  });
}

function simulateDelay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// console.log(results);
