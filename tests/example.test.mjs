import { describe, it, assertEqual, assertNotEqual, assertTrue, assertFalse, assertThrows, assertNoDuplicates, runTestFunction } from '../src/testRunner.js';

const params = {
  description: 'I am an Example Test Suite',
  id: 'group_1'
}

await describe(params, () => {

  const group_params = {
    id: 'group_2', parentId: 'group_1'
  }

  describe({ description: 'I am a nested describe', ...group_params }, () => {

    it({ description: 'should pass equality assertion', parentId: 'group_2' }, () => {
      assertEqual(1, 2, 'Expected 1 to equal 1');
    });

    it({ description: 'should pass inequality assertion', parentId: 'group_2' }, () => {
      assertNotEqual(1, 2, 'Expected 1 not to equal 2');
    });

    it({ description: 'should pass true assertion', parentId: 'group_1' }, () => {
      assertTrue(true, 'Expected true to be true');
    });
  });


  it({ description: 'should pass false assertion', parentId: 'group_2' }, () => {
    assertFalse(false, 'Expected false to be false');
  });

  it({ description: 'should pass error assertion', parentId: 'group_1' }, () => {
    assertThrows(() => {
      throw new Error('An error occurred');
    }, 'An error occurred', 'Expected an error to be thrown');
  });

  it({ description: 'should deeply compare objects', parentId: 'group_1' }, () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: { c: 2 } };
    assertEqual(obj1, obj2, 'Expected objects to be deeply equal');
  });

  it({ description: 'should check for duplicates', parentId: 'group_1' }, () => {
    const array = ['field1', 'field2']
    assertNoDuplicates(array, 'There should be no duplicates');
  });

});


await runTestFunction(testFunction);

function testFunction() {
  describe({ description: 'First Layer', id: 'first_layer' }, () => {
    it({ description: 'first', parentId: 'first_layer' }, () => {
      assertEqual(1, 2, 'Expected 1 to equal 1');
    });
    it({ description: 'first', parentId: 'first_layer' }, () => {
      assertEqual(1, 1, 'Expected 1 to equal 1');
    });
    it({ description: 'first', parentId: 'first_layer' }, () => {
      assertEqual(1, 1, 'Expected 1 to equal 1');
    });

    secondFunction();
  });
}

function secondFunction() {
  describe({ description: 'second Layer', id: 'first_layer' }, () => {
    it({ description: 'Second', parentId: 'second_layer' }, () => {
      assertEqual(1, 1, 'Expected 1 to equal 1');
    });
    it({ description: 'Second', parentId: 'second_layer' }, () => {
      assertEqual(1, 1, 'Expected 1 to equal 1');
    });
    it({ description: 'Second', parentId: 'second_layer' }, () => {
      assertEqual(1, 1, 'Expected 1 to equal 1');
    });

    thirdFunction();
  });
}

function thirdFunction() {
  describe({ description: 'third Layer', id: 'third_layer' }, () => {
    it({ description: 'third', parentId: 'third_layer' }, () => {
      assertEqual(1, 1, 'Expected 1 to equal 1');
    });
    it({ description: 'third', parentId: 'third_layer' }, () => {
      assertEqual(1, 1, 'Expected 1 to equal 1');
    });
    it({ description: 'third', parentId: 'third_layer' }, () => {
      assertEqual(1, 1, 'Expected 1 to equal 1');
    });
  });
}