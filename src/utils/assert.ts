export class Assert {
  static is(value: unknown, expected: true): asserts value is true;
  static is(value: unknown, expected: false): asserts value is false;
  static is<T, V extends T>(value: T, expected: V): asserts value is V;
  static is<T, V extends T>(value: T, expected: V): asserts value is V {
    if (value !== expected) {
      throw new Error(`Assertion failed: expected ${expected}, got ${value}`);
    }
  }
}
