/// <reference types="vite/client" />

// Virtual module for user stories (Storybook-style)
declare module 'virtual:phaser-viewer-stories' {
  export const userStoryModules: Record<string, () => Promise<unknown>>;
  export const loadUserStories: () => Promise<Record<string, unknown>>;
}

declare module "*.ts?raw" {
  const content: string;
  export default content;
}

declare module "*.tsx?raw" {
  const content: string;
  export default content;
}

// Define the expect matcher interface outside of the Window interface
interface ExpectMatcher {
  toBe(expected: unknown, message?: string): Promise<void>;
  // Text matchers
  toHaveText(expected: string, message?: string): Promise<void>;
  toHaveTextContent(expected: string, message?: string): Promise<void>;
  // Boolean matchers
  toBeTruthy(message?: string): Promise<void>;
  toBeFalsy(message?: string): Promise<void>;
  toExist(message?: string): Promise<void>;
  // Numeric matchers
  toBeGreaterThan(expected: number, message?: string): Promise<void>;
  // Collection matchers
  toContain(expected: unknown, message?: string): Promise<void>;
  // DOM-style matchers (Storybook-inspired)
  toBeInTheDocument(message?: string): Promise<void>;
  toBeVisible(message?: string): Promise<void>;
  toBeDisabled(message?: string): Promise<void>;
  toBeEnabled(message?: string): Promise<void>;
}

declare global {
  interface Window {
    iconUris?: { [key: string]: string };
    Button?: unknown;
    SampleSprite?: unknown;
    Phaser?: unknown;
    
    // Note: Storybook-style expect API is now imported directly from storybookExpect module
    // The old global window.expect API has been deprecated in favor of proper imports
    
    // Legacy testing functions  
    assert?: (condition: boolean, message: string) => void;
    assertEquals?: (
      actual: unknown,
      expected: unknown,
      message: string,
    ) => void;
    clearTestResults?: () => void;
    testResults?: Array<{
      name: string;
      status: 'pass' | 'fail';
      message: string;
    }>;
  }
}
