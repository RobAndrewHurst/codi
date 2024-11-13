import { describe, it, assertEqual, assertNotEqual, assertTrue, assertFalse, assertThrows, assertNoDuplicates, runTestFunction } from '../src/testRunner.js';

// First test suite
await describe('I am an Example Test Suite', (description) => {

  it('should pass equality assertion', () => {
    assertEqual(1, 1, 'Expected 1 to equal 1');
  }, description);

  it('should pass inequality assertion', () => {
    assertNotEqual(1, 2, 'Expected 1 not to equal 2');
  }, description);

  it('should pass true assertion', () => {
    assertTrue(true, 'Expected true to be true');
  }, description);

  it('should pass false assertion', () => {
    assertFalse(false, 'Expected false to be false');
  }, description);

  it('should pass error assertion', () => {
    assertThrows(() => {
      throw new Error('An error occurred');
    }, 'An error occurred', 'Expected an error to be thrown');
  }, description);

  it('should deeply compare objects', () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: { c: 2 } };
    assertEqual(obj1, obj2, 'Expected objects to be deeply equal');
  }, description);

  it('should check for duplicates', () => {
    const array = ['field1', 'field2']
    assertNoDuplicates(array, 'There should be no duplicates');
  }, description);

});

await runTestFunction(testFunction, { showSummary: false });

function testFunction() {
  it('First', () => {
    assertEqual(1, 1, 'Expected 1 to equal 1');
  }, 'Function: testFunction');
}