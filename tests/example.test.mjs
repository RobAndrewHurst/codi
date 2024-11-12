import { describe, it, assertEqual, assertNotEqual, assertTrue, assertFalse, assertThrows, assertNoDuplicates, runTestFunction } from '../src/testRunner.js';

// First test suite
await describe('I am an Example Test Suite', () => {

  it('should pass equality assertion', () => {
    assertEqual(1, 2, 'Expected 1 to equal 1');
  });

  it('should pass inequality assertion', () => {
    assertNotEqual(1, 2, 'Expected 1 not to equal 2');
  });

  it('should pass true assertion', () => {
    assertTrue(true, 'Expected true to be true');
  });

  it('should pass false assertion', () => {
    assertFalse(false, 'Expected false to be false');
  });

  it('should pass error assertion', () => {
    assertThrows(() => {
      throw new Error('An error occurred');
    }, 'An error occurred', 'Expected an error to be thrown');
  });

  it('should deeply compare objects', () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: { c: 2 } };
    assertEqual(obj1, obj2, 'Expected objects to be deeply equal');
  });

  it('should check for duplicates', () => {
    const array = ['field1', 'field2']
    assertNoDuplicates(array, 'There should be no duplicates');
  });

});
// Nested describe for a new context
await describe('Running testFunction', async () => {
  function testFunction() {
    it('First', () => {
      assertEqual(1, 2, 'Expected 1 to equal 1');
    });
  }
  await runTestFunction(testFunction);
});