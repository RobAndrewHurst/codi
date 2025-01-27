export class MockHttpResponse {
  constructor(options) {
    this.status = options.status || 200;
    this.body = options.body || {};
    this.headers = options.headers || {};
  }

  // Professional methods
  json() {
    return Promise.resolve(this.body);
  }

  text() {
    return Promise.resolve(JSON.stringify(this.body));
  }

  // Fun aliases
  speak() {
    return this.json();
  }
  bark() {
    return this.text();
  }
}

export class MockHttp {
  constructor() {
    this.mocks = new Map();
  }

  // Professional methods
  mock(url, options) {
    this.mocks.set(url, new MockHttpResponse(options));
  }

  async fetch(url, options) {
    if (!this.mocks.has(url)) {
      throw new Error(`No Mock found for URL: ${url}`);
    }
    return this.mocks.get(url);
  }

  // Fun aliases
  train(url, tricks) {
    return this.mock(url, tricks);
  }
  sniff(url, options) {
    return this.fetch(url, options);
  }
}
