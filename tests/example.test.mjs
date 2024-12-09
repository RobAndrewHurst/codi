import { describe, it, assertEqual, assertNotEqual, assertTrue, assertFalse, assertThrows, assertNoDuplicates } from '../src/_codi.js';

import { runTestFunction } from '../src/testRunner.js';

const params = {
  name: 'I am an Example Test Suite',
  id: 'group_1'
}

await describe(params, () => {

  const group_params = {
    id: 'group_2', parentId: 'group_1'
  }

  describe({ name: 'I am a nested describe', ...group_params }, () => {

    it({ name: 'should pass equality assertion', parentId: 'group_2' }, () => {
      assertEqual(1, 2, 'Expected 1 to equal 1');
    });

    it({ name: 'should pass inequality assertion', parentId: 'group_2' }, () => {
      assertNotEqual(1, 2, 'Expected 1 not to equal 2');
    });

    it({ name: 'should pass true assertion', parentId: 'group_1' }, () => {
      assertTrue(true, 'Expected true to be true');
    });
  });


  it({ name: 'should pass false assertion', parentId: 'group_2' }, () => {
    assertFalse(false, 'Expected false to be false');
  });

  it({ name: 'should pass error assertion', parentId: 'group_1' }, () => {
    assertThrows(() => {
      throw new Error('An error occurred');
    }, 'An error occurred', 'Expected an error to be thrown');
  });

  it({ name: 'should deeply compare objects', parentId: 'group_1' }, () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: { c: 2 } };
    assertEqual(obj1, obj2, 'Expected objects to be deeply equal');
  });

  it({ name: 'should check for duplicates', parentId: 'group_1' }, () => {
    const array = ['field1', 'field2']
    assertNoDuplicates(array, 'There should be no duplicates');
  });

});


await runTestFunction(testFunction);

function testFunction() {
  describe({ name: 'First Layer', id: 'first_layer' }, () => {
    it({ name: 'first', parentId: 'first_layer' }, () => {
      assertEqual(1, 2, 'Expected 1 to equal 1');
    });
    it({ name: 'first', parentId: 'first_layer' }, () => {
      assertEqual(1, 1, 'Expected 1 to equal 1');
    });
    it({ name: 'first', parentId: 'first_layer' }, () => {
      assertEqual(1, 1, 'Expected 1 to equal 1');
    });

    secondFunction();
  });
}

function secondFunction() {
  describe({ name: 'second Layer', id: 'second_layer' }, () => {
    it({ name: 'Second', parentId: 'second_layer' }, () => {
      assertEqual(1, 1, 'Expected 1 to equal 1');
    });
    it({ name: 'Second', parentId: 'second_layer' }, () => {
      assertEqual(1, 1, 'Expected 1 to equal 1');
    });
    it({ name: 'Second', parentId: 'second_layer' }, () => {
      assertEqual(1, 1, 'Expected 1 to equal 1');
    });

    thirdFunction();
  });
}

function thirdFunction() {
  describe({ name: 'third Layer', id: 'third_layer' }, () => {
    it({ name: 'third', parentId: 'third_layer' }, () => {
      assertEqual(1, 1, 'Expected 1 to equal 1');
    });
    it({ name: 'third', parentId: 'third_layer' }, () => {
      assertEqual(1, 1, 'Expected 1 to equal 1');
    });
    it({ name: 'third', parentId: 'third_layer' }, () => {
      assertEqual(1, 1, 'Expected 1 to equal 1');
    });
  });
}