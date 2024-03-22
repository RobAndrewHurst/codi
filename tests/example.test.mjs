import { describe, it, assertEqual, assertNotEqual, assertTrue, assertFalse, assertThrows } from '../src/testRunner.js';

import { helloworld } from '../example/example.mjs';

import pkg from '../example/common.cjs';
const { helloCommon } = pkg;

describe('I am an Example Test Suite', () => {

  helloworld();
  helloCommon();

  it('should pass equality assertion', () => {
    assertEqual(1, 1, 'Expected 1 to equal 1');
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

});