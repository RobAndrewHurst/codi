export class MockModule {
  constructor(implementation) {
    this.implementation = implementation;
  }

  // Professional names
  mock(newImplementation) {
    this.implementation = newImplementation;
  }

  // Fun aliases
  teach(newTrick) {
    return this.mock(newTrick);
  }
  pretendToBe(newBehavior) {
    return this.mock(newBehavior);
  }

  __get() {
    return this.implementation;
  }
}

export class MockModuleRegistry {
  constructor() {
    this.modules = new Map();
  }

  // Professional names
  mock(modulePath, implementation) {
    this.modules.set(modulePath, new MockModule(implementation));
  }

  require(modulePath) {
    if (!this.modules.has(modulePath)) {
      throw new Error(`No mock found for module: ${modulePath}`);
    }
    return this.modules.get(modulePath).__get();
  }

  // Fun aliases
  train(modulePath, tricks) {
    return this.mock(modulePath, tricks);
  }
  fetch(modulePath) {
    return this.require(modulePath);
  }
}
