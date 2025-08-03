// Modern expect library for Phaser Viewer
// Inspired by Storybook's @storybook/test package with Vitest + Testing Library approach

interface ExpectOptions {
  timeout?: number; // Maximum wait time in milliseconds (default: 3000)
  interval?: number; // Check interval in milliseconds (default: 100)
  retries?: number; // Number of retries (legacy, use timeout instead)
}

interface TestResult {
  name: string;
  status: 'pass' | 'fail';
  message: string;
  duration?: number;
  error?: Error;
}

// Type for getter functions
type GetterFunction<T = unknown> = () => T;

// Type for objects with getText method
interface HasGetText {
  getText(): string;
}

// Type for objects with various state properties
interface HasVisibleProperty {
  visible: boolean;
}

interface HasActiveProperty {
  active: boolean;
}

interface HasDisabledProperty {
  disabled: boolean;
}

interface HasInteractiveProperty {
  interactive: boolean;
}

class ExpectMatcher {
  constructor(
    private actual: unknown,
    private options: ExpectOptions = {}
  ) {}

  // Equality matcher
  async toBe(expected: unknown, message?: string): Promise<void> {
    const startTime = Date.now();
    const timeout = this.options.timeout || 3000;
    const interval = this.options.interval || 100;
    const testName = message || `expect(${this.actual}).toBe(${expected})`;
    
    return new Promise((resolve, reject) => {
      const check = () => {
        try {
          if (typeof this.actual === 'function') {
            // If actual is a function, call it to get the current value
            const currentValue = (this.actual as GetterFunction)();
            if (currentValue === expected) {
              const duration = Date.now() - startTime;
              this.reportSuccess(testName, duration);
              resolve();
              return;
            }
          } else if (this.actual === expected) {
            const duration = Date.now() - startTime;
            this.reportSuccess(testName, duration);
            resolve();
            return;
          }

          if (Date.now() - startTime >= timeout) {
            const error = new Error(
              `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(
                typeof this.actual === 'function' ? (this.actual as GetterFunction)() : this.actual
              )}`
            );
            this.reportFailure(testName, error, Date.now() - startTime);
            reject(error);
          } else {
            setTimeout(check, interval);
          }
        } catch (error) {
          this.reportFailure(testName, error as Error, Date.now() - startTime);
          reject(error);
        }
      };

      check();
    });
  }

  // Text content matcher (Storybook-style)
  async toHaveTextContent(expected: string, message?: string): Promise<void> {
    const testName = message || `expect().toHaveTextContent("${expected}")`;
    
    if (typeof this.actual === 'object' && this.actual && 'getText' in this.actual) {
      const getTextFn = () => (this.actual as HasGetText).getText();
      return new ExpectMatcher(getTextFn, this.options).toBe(expected, testName);
    } else {
      const error = new Error('Object does not have getText method');
      this.reportFailure(testName, error);
      throw error;
    }
  }

  // Legacy alias for backward compatibility
  async toHaveText(expected: string, message?: string): Promise<void> {
    return this.toHaveTextContent(expected, message);
  }

  // Truthy matcher
  async toBeTruthy(message?: string): Promise<void> {
    const testName = message || `expect(${this.actual}).toBeTruthy()`;
    const checkFn = () => Boolean(typeof this.actual === 'function' ? (this.actual as GetterFunction)() : this.actual);
    return new ExpectMatcher(checkFn, this.options).toBe(true, testName);
  }

  // Falsy matcher
  async toBeFalsy(message?: string): Promise<void> {
    const testName = message || `expect(${this.actual}).toBeFalsy()`;
    const checkFn = () => Boolean(typeof this.actual === 'function' ? (this.actual as GetterFunction)() : this.actual);
    return new ExpectMatcher(checkFn, this.options).toBe(false, testName);
  }

  // Existence matcher
  async toExist(message?: string): Promise<void> {
    const testName = message || `expect().toExist()`;
    const checkFn = () => {
      const value = typeof this.actual === 'function' ? (this.actual as GetterFunction)() : this.actual;
      return value !== null && value !== undefined;
    };
    return new ExpectMatcher(checkFn, this.options).toBe(true, testName);
  }

  // Greater than matcher
  async toBeGreaterThan(expected: number, message?: string): Promise<void> {
    const testName = message || `expect().toBeGreaterThan(${expected})`;
    const checkFn = () => {
      const value = typeof this.actual === 'function' ? (this.actual as GetterFunction)() : this.actual;
      return typeof value === 'number' && value > expected;
    };
    return new ExpectMatcher(checkFn, this.options).toBe(true, testName);
  }

  // Array/object contains matcher
  async toContain(expected: unknown, message?: string): Promise<void> {
    const testName = message || `expect().toContain(${expected})`;
    const checkFn = () => {
      const value = typeof this.actual === 'function' ? (this.actual as GetterFunction)() : this.actual;
      if (Array.isArray(value)) {
        return value.includes(expected);
      }
      if (typeof value === 'string') {
        return value.includes(expected as string);
      }
      return false;
    };
    return new ExpectMatcher(checkFn, this.options).toBe(true, testName);
  }

  // Storybook-style DOM matchers
  async toBeInTheDocument(message?: string): Promise<void> {
    const testName = message || `expect().toBeInTheDocument()`;
    return this.toExist(testName);
  }

  async toBeVisible(message?: string): Promise<void> {
    const testName = message || `expect().toBeVisible()`;
    const checkFn = () => {
      const element = typeof this.actual === 'function' ? (this.actual as GetterFunction)() : this.actual;
      if (element && typeof element === 'object' && 'visible' in element) {
        return (element as HasVisibleProperty).visible;
      }
      // For Phaser objects, check if they exist and are active
      if (element && typeof element === 'object' && 'active' in element) {
        return (element as HasActiveProperty).active;
      }
      return Boolean(element);
    };
    return new ExpectMatcher(checkFn, this.options).toBe(true, testName);
  }

  async toBeDisabled(message?: string): Promise<void> {
    const testName = message || `expect().toBeDisabled()`;
    const checkFn = () => {
      const element = typeof this.actual === 'function' ? (this.actual as GetterFunction)() : this.actual;
      if (element && typeof element === 'object') {
        // Check common disabled properties
        if ('disabled' in element) {
          return (element as HasDisabledProperty).disabled;
        }
        if ('interactive' in element) {
          return !(element as HasInteractiveProperty).interactive;
        }
      }
      return false;
    };
    return new ExpectMatcher(checkFn, this.options).toBe(true, testName);
  }

  async toBeEnabled(message?: string): Promise<void> {
    const testName = message || `expect().toBeEnabled()`;
    const checkFn = () => {
      const element = typeof this.actual === 'function' ? (this.actual as GetterFunction)() : this.actual;
      if (element && typeof element === 'object') {
        // Check common disabled properties
        if ('disabled' in element) {
          return !(element as HasDisabledProperty).disabled;
        }
        if ('interactive' in element) {
          return (element as HasInteractiveProperty).interactive;
        }
      }
      return true;
    };
    return new ExpectMatcher(checkFn, this.options).toBe(true, testName);
  }

  private reportSuccess(testName: string, duration: number) {
    const result: TestResult = {
      name: testName,
      status: 'pass',
      message: testName,
      duration
    };

    console.log(`✅ PASS (${duration}ms):`, testName);
    window.dispatchEvent(new CustomEvent('testResult', { detail: result }));
    window.dispatchEvent(new CustomEvent('playLog', { 
      detail: `✅ PASS (${duration}ms): ${testName}`
    }));
  }

  private reportFailure(testName: string, error: Error, duration?: number) {
    const result: TestResult = {
      name: testName,
      status: 'fail',
      message: error.message,
      duration,
      error
    };

    console.error(`❌ FAIL${duration ? ` (${duration}ms)` : ''}:`, testName, '-', error.message);
    window.dispatchEvent(new CustomEvent('testResult', { detail: result }));
    window.dispatchEvent(new CustomEvent('playLog', { 
      detail: `❌ FAIL${duration ? ` (${duration}ms)` : ''}: ${testName} - ${error.message}`
    }));
  }
}

// Main expect function
export function expect(actual: unknown, options?: ExpectOptions): ExpectMatcher {
  return new ExpectMatcher(actual, options);
}

// Utility functions for common use cases
export function expectEventually(actual: unknown, options?: ExpectOptions): ExpectMatcher {
  return expect(actual, { timeout: 5000, interval: 100, ...options });
}

export function expectImmediately(actual: unknown): ExpectMatcher {
  return expect(actual, { timeout: 100, interval: 10 });
}

// Delay utility
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Wait for condition utility
export async function waitFor(
  condition: () => boolean, 
  options: ExpectOptions = {}
): Promise<void> {
  const timeout = options.timeout || 3000;
  const interval = options.interval || 100;
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime >= timeout) {
        reject(new Error(`Condition not met within ${timeout}ms`));
      } else {
        setTimeout(check, interval);
      }
    };
    check();
  });
}