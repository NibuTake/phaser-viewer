// Storybook-like expect library for Phaser Viewer
// Simulates the experience of using @storybook/test

interface ExpectResult {
  pass: boolean;
  message: string;
  actual?: unknown;
  expected?: unknown;
}

interface TestContext {
  testName: string;
  startTime: number;
}

class StorybookExpectMatcher {
  constructor(
    private actual: unknown,
    private context: TestContext
  ) {}

  // Basic equality matcher
  toBe(expected: unknown): Promise<void> {
    return this.runAssertion(() => {
      const pass = this.actual === expected;
      return {
        pass,
        message: pass 
          ? `Expected ${JSON.stringify(this.actual)} to be ${JSON.stringify(expected)}`
          : `Expected ${JSON.stringify(expected)}, but received ${JSON.stringify(this.actual)}`,
        actual: this.actual,
        expected
      };
    });
  }

  // Truthiness matcher
  toBeTruthy(): Promise<void> {
    return this.runAssertion(() => {
      const pass = !!this.actual;
      return {
        pass,
        message: pass 
          ? `Expected value to be truthy`
          : `Expected ${JSON.stringify(this.actual)} to be truthy`,
        actual: this.actual
      };
    });
  }

  // Falsiness matcher
  toBeFalsy(): Promise<void> {
    return this.runAssertion(() => {
      const pass = !this.actual;
      return {
        pass,
        message: pass 
          ? `Expected value to be falsy`
          : `Expected ${JSON.stringify(this.actual)} to be falsy`,
        actual: this.actual
      };
    });
  }

  // Text content matcher for Phaser objects
  toHaveTextContent(expected: string): Promise<void> {
    return this.runAssertion(() => {
      if (this.actual && typeof this.actual === 'object' && 'getText' in this.actual) {
        const actualText = (this.actual as { getText(): string }).getText();
        const pass = actualText === expected;
        return {
          pass,
          message: pass 
            ? `Expected text content to be "${expected}"`
            : `Expected text content to be "${expected}", but received "${actualText}"`,
          actual: actualText,
          expected
        };
      } else {
        return {
          pass: false,
          message: 'Object does not have getText method',
          actual: this.actual
        };
      }
    });
  }

  // Visibility matcher for Phaser objects
  toBeVisible(): Promise<void> {
    return this.runAssertion(() => {
      if (this.actual && typeof this.actual === 'object') {
        const obj = this.actual as Record<string, unknown>;
        const visible = obj.visible || obj.active || true; // Default to true if no visibility property
        const pass = !!visible;
        return {
          pass,
          message: pass 
            ? `Expected object to be visible`
            : `Expected object to be visible, but it was hidden`,
          actual: visible
        };
      } else {
        return {
          pass: false,
          message: 'Expected an object with visibility properties',
          actual: this.actual
        };
      }
    });
  }

  // Greater than matcher
  toBeGreaterThan(expected: number): Promise<void> {
    return this.runAssertion(() => {
      const actualNum = Number(this.actual);
      const pass = !isNaN(actualNum) && actualNum > expected;
      return {
        pass,
        message: pass 
          ? `Expected ${actualNum} to be greater than ${expected}`
          : `Expected ${actualNum} to be greater than ${expected}`,
        actual: actualNum,
        expected
      };
    });
  }

  private async runAssertion(assertionFn: () => ExpectResult): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const result = assertionFn();
        const duration = Date.now() - this.context.startTime;
        
        if (result.pass) {
          const passMessage = `✅ PASS (${duration}ms): ${this.context.testName}`;
          const playLogMessage = `✅ ${this.context.testName}`;
          console.log(passMessage);
          window.dispatchEvent(new CustomEvent('testResult', { 
            detail: { 
              name: this.context.testName,
              status: 'pass',
              message: result.message,
              duration
            }
          }));
          // Auto-dispatch to play logs with cleaner message
          window.dispatchEvent(new CustomEvent('playLog', { detail: playLogMessage }));
          resolve();
        } else {
          const failMessage = `❌ FAIL (${duration}ms): ${this.context.testName} - ${result.message}`;
          const playLogMessage = `❌ ${this.context.testName} - ${result.message}`;
          console.error(failMessage);
          window.dispatchEvent(new CustomEvent('testResult', { 
            detail: { 
              name: this.context.testName,
              status: 'fail',
              message: result.message,
              duration,
              actual: result.actual,
              expected: result.expected
            }
          }));
          // Auto-dispatch to play logs with cleaner message
          window.dispatchEvent(new CustomEvent('playLog', { detail: playLogMessage }));
          reject(new Error(result.message));
        }
      } catch (error) {
        const duration = Date.now() - this.context.startTime;
        const errorMessage = `❌ ERROR (${duration}ms): ${this.context.testName} - ${error instanceof Error ? error.message : 'Unknown error'}`;
        const playLogMessage = `❌ ${this.context.testName} - ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMessage);
        window.dispatchEvent(new CustomEvent('testResult', { 
          detail: { 
            name: this.context.testName,
            status: 'fail',
            message: error instanceof Error ? error.message : 'Unknown error',
            duration
          }
        }));
        // Auto-dispatch to play logs with cleaner message
        window.dispatchEvent(new CustomEvent('playLog', { detail: playLogMessage }));
        reject(error);
      }
    });
  }
}

// Main expect function (Storybook-style)
export function expect(actual: unknown, testName = 'Assertion'): StorybookExpectMatcher {
  const context: TestContext = {
    testName,
    startTime: Date.now()
  };
  return new StorybookExpectMatcher(actual, context);
}

// Delay utility function
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Storybook-like test context simulation
export interface PlayFunctionContext {
  canvas: {
    getByRole: (role: string) => HTMLElement;
    getByText: (text: string) => HTMLElement;
    getByTestId: (testId: string) => HTMLElement;
  };
  step: (name: string, fn: () => Promise<void>) => Promise<void>;
}

// Step function for organizing test steps (Storybook-like)
export async function step(name: string, fn: () => Promise<void>): Promise<void> {
  console.log(`🔹 ${name}`);
  window.dispatchEvent(new CustomEvent('playLog', { detail: `🔹 ${name}` }));
  try {
    await fn();
  } catch (error) {
    console.error(`❌ Step failed: ${name}`, error);
    window.dispatchEvent(new CustomEvent('playLog', { detail: `❌ Step failed: ${name}` }));
    throw error;
  }
}