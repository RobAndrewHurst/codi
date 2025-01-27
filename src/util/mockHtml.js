export class MockHttpResponse {
  constructor(options) {
    this.status = options.status || 200;
    this.body = options.body || {};
    this.headers = options.headers || {};
  }

  json() {
    return Promise.resolve(this.body);
  }

  text() {
    return Promise.resolve(JSON.stringify(this.body));
  }
}

export class MockHttp {
  constructor() {
    this.mocks = new Map();
  }

  mock(url, options) {
    this.mocks.set(url, new MockHttpResponse(options));
  }

  async fetch(url, options) {
    if (!this.mocks.has(url)) {
      throw new Error(`No Mock found for URL: ${url}`);
    }
    return this.mocks.get(url);
  }
}
