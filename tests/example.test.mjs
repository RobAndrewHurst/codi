import { codi } from '../src/_codi.js';

const luciMock = codi.mock.module('./luciModule.js', {
  namedExports: {
    helloLuci() {
      return 'Mock luci';
    },
  },
});

const params = {
  name: 'I am an Example Test Suite',
  id: 'group_1',
};

await codi.describe(params, () => {
  const group_params = {
    id: 'group_2',
    parentId: 'group_1',
  };

  codi.describe({ name: 'I am a nested describe', ...group_params }, () => {
    codi.it(
      { name: 'should pass equality assertion', parentId: 'group_2' },
      () => {
        codi.assertEqual(1, 2, 'Expected 1 to equal 1');
      },
    );

    codi.it(
      { name: 'should pass inequality assertion', parentId: 'group_2' },
      () => {
        codi.assertNotEqual(1, 2, 'Expected 1 not to equal 2');
      },
    );

    codi.it({ name: 'should pass true assertion', parentId: 'group_1' }, () => {
      codi.assertTrue(true, 'Expected true to be true');
    });
  });

  codi.it({ name: 'should pass false assertion', parentId: 'group_2' }, () => {
    codi.assertFalse(false, 'Expected false to be false');
  });

  codi.it({ name: 'should pass error assertion', parentId: 'group_1' }, () => {
    codi.assertThrows(
      () => {
        throw new Error('An error occurred');
      },
      'An error occurred',
      'Expected an error to be thrown',
    );
  });

  codi.it(
    { name: 'should deeply compare objects', parentId: 'group_1' },
    () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { a: 1, b: { c: 2 } };
      codi.assertEqual(obj1, obj2, 'Expected objects to be deeply equal');
    },
  );

  codi.it({ name: 'should check for duplicates', parentId: 'group_1' }, () => {
    const array = ['field1', 'field2'];
    codi.assertNoDuplicates(array, 'There should be no duplicates');
  });
});

await codi.describe({ name: 'HTTP Mock', id: 'http_test_fun' }, async () => {
  await codi.it(
    { name: 'We should get some doggies', parentId: 'http_test_fun' },
    async () => {
      const mockAgent = new codi.mockHttp.MockAgent();
      codi.mockHttp.setGlobalDispatcher(mockAgent);

      const mockPool = mockAgent.get(new RegExp('http://localhost:3000'));
      mockPool.intercept({ path: '/' }).reply(404, ['codi', 'mieka', 'luci']);

      const response = await fetch('http://localhost:3000');

      codi.assertEqual(response.status, 404, 'We expect to get a 404');
      codi.assertEqual(await response.json(), ['codi', 'mieka', 'luci']);
    },
  );
});

await codi.describe({ name: 'Module Mock', id: 'module_mock' }, async () => {
  await codi.it(
    { name: 'Mocking a module', parentId: 'module_mock' },
    async () => {
      const mock = codi.mock.module('./testModule.js', {
        namedExports: {
          helloCodiMock(name) {
            return `Hello ${name}`;
          },
        },
      });

      let mockedModule;

      mockedModule = await import('./testModule.js');

      codi.assertTrue(Object.hasOwn(mockedModule, 'helloCodiMock'));
      codi.assertEqual(mockedModule.helloCodiMock('mieka'), 'Hello mieka');

      mock.restore();

      mockedModule = await import('./testModule.js');

      codi.assertEqual(mockedModule.helloCodi('luci'), 'woof woof: luci');
    },
  );
});

await codi.describe(
  { name: 'Nested Module Mock', id: 'nested_ module_mock' },
  async () => {
    await codi.it(
      { name: 'Mocking a nested module', parentId: 'nested_ module_mock' },
      async () => {
        const { helloCodi } = await import('./testModule.js');

        const greeting = helloCodi('rob');

        console.log(greeting);
      },
    );
  },
);

await codi.runTestFunction(testFunction);

function testFunction() {
  codi.describe({ name: 'First Layer', id: 'first_layer' }, () => {
    codi.it({ name: 'first', parentId: 'first_layer' }, () => {
      codi.assertEqual(1, 2, 'Expected 1 to equal 1');
    });
    codi.it({ name: 'first', parentId: 'first_layer' }, () => {
      codi.assertEqual(1, 1, 'Expected 1 to equal 1');
    });
    codi.it({ name: 'first', parentId: 'first_layer' }, () => {
      codi.assertEqual(1, 1, 'Expected 1 to equal 1');
    });
    secondFunction();
  });
}

function secondFunction() {
  codi.describe({ name: 'second Layer', id: 'second_layer' }, () => {
    codi.it({ name: 'Second', parentId: 'second_layer' }, () => {
      codi.assertEqual(1, 1, 'Expected 1 to equal 1');
    });
    codi.it({ name: 'Second', parentId: 'second_layer' }, () => {
      codi.assertEqual(1, 1, 'Expected 1 to equal 1');
    });
    codi.it({ name: 'Second', parentId: 'second_layer' }, () => {
      codi.assertEqual(1, 1, 'Expected 1 to equal 1');
    });

    thirdFunction();
  });
}

function thirdFunction() {
  codi.describe({ name: 'third Layer', id: 'third_layer' }, () => {
    codi.it({ name: 'third', parentId: 'third_layer' }, () => {
      codi.assertEqual(1, 1, 'Expected 1 to equal 1');
    });
    codi.it({ name: 'third', parentId: 'third_layer' }, () => {
      codi.assertEqual(1, 1, 'Expected 1 to equal 1');
    });
    codi.it({ name: 'third', parentId: 'third_layer' }, () => {
      codi.assertEqual(1, 1, 'Expected 1 to equal 1');
    });
  });
}
