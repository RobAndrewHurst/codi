import { assertEqual, assertTrue, describe, it } from '../src/_codi.js';

describe({ name: 'Simple Node.js Tests', id: 'simple_tests' }, async () => {
  it(
    { name: 'should pass basic equality test', parentId: 'simple_tests' },
    () => {
      assertEqual(1, 1, 'Numbers should be equal');
    },
  );

  it({ name: 'should pass basic truth test', parentId: 'simple_tests' }, () => {
    assertTrue(true, 'True should be true');
  });

  it({ name: 'should handle objects', parentId: 'simple_tests' }, () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { a: 1, b: 2 };
    assertEqual(obj1, obj2, 'Objects should be deeply equal');
  });
});
