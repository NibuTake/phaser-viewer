import { StoryGroup } from "../components/Sidebar";

// Dynamically load all .demo.ts files
export async function loadStoryGroups(): Promise<StoryGroup[]> {
  console.log("Loading story groups from .demo.ts files...");

  try {
    // Import all .demo.ts files dynamically from examples folder
    const storyModules = import.meta.glob("../../examples/**/*.demo.ts", { eager: true });
    const storyGroups: StoryGroup[] = [];

    for (const [path, module] of Object.entries(storyModules)) {
      try {
        console.log("Loading story module:", path);
        const moduleObj = module as Record<string, unknown>;

        if (moduleObj.default && typeof moduleObj.default === 'object') {
          const meta = moduleObj.default as Record<string, unknown>;
          const stories = [];

          // Extract all exported stories (除了default export)
          for (const [key, story] of Object.entries(moduleObj)) {
            if (key !== "default" && typeof story === "object" && story !== null) {
              const storyObj = story as Record<string, unknown>;

              // Ensure create function is wrapped to prevent immediate execution
              const createFunction = storyObj.create;
              if (typeof createFunction !== "function") {
                console.warn(
                  `Story ${key} has invalid create function:`,
                  typeof createFunction,
                );
                continue;
              }

              // Wrap the create function to prevent accidental execution during React rendering
              const wrappedCreateFunction = (...args: unknown[]) => {
                console.log(`Executing story: ${key}`);
                return createFunction(...args);
              };

              console.log(`Story ${key} args:`, storyObj.args);
              stories.push({
                name: (storyObj.name as string) || key,
                create: wrappedCreateFunction,
                args: storyObj.args,
                play: storyObj.play as ((scene: Phaser.Scene, component?: unknown) => void | Promise<void>) | undefined,
              });
            }
          }

          if (stories.length > 0) {
            // Check if group already exists
            let existingGroup = storyGroups.find((g) => g.title === (meta.title as string));
            if (!existingGroup) {
              existingGroup = {
                title: (meta.title as string) || "Untitled",
                description: (meta.description as string) || "",
                tags: (meta.tags as string[]) || [],
                stories: [],
              };
              storyGroups.push(existingGroup);
            }

            // Add stories to group
            existingGroup.stories.push(...stories);
          }
        }
      } catch (error) {
        console.error(`Error loading story module ${path}:`, error);
      }
    }

    console.log("Loaded story groups:", storyGroups);
    return storyGroups;
  } catch (error) {
    console.error("Error loading stories:", error);
    // Return empty array if loading fails
    return [];
  }
}

// Make components available globally for the demos
export function setupGlobalComponents() {
  if (typeof window !== "undefined") {
    (window as { Phaser?: unknown }).Phaser =
      (window as { Phaser?: unknown }).Phaser || {};

    // Create test result system
    const testResults: Array<{
      name: string;
      status: 'pass' | 'fail';
      message: string;
    }> = [];

    (window as any).testResults = testResults;
    
    // Add Storybook-style assert functions for testing
    (
      window as { assert?: (condition: boolean, message: string) => void }
    ).assert = (condition: boolean, message: string) => {
      const result = {
        name: 'assert',
        status: condition ? 'pass' as const : 'fail' as const,
        message: message
      };
      testResults.push(result);
      
      if (condition) {
        console.log('✅ PASS:', message);
      } else {
        console.error('❌ FAIL:', message);
      }
      
      // Dispatch custom event to notify UI
      window.dispatchEvent(new CustomEvent('testResult', { detail: result }));
      
      // Also dispatch to play logs
      window.dispatchEvent(new CustomEvent('playLog', { 
        detail: condition ? `✅ PASS: ${message}` : `❌ FAIL: ${message}`
      }));
    };

    (
      window as {
        assertEquals?: (
          actual: unknown,
          expected: unknown,
          message: string,
        ) => void;
      }
    ).assertEquals = (actual: unknown, expected: unknown, message: string) => {
      const condition = actual === expected;
      const result = {
        name: 'assertEquals',
        status: condition ? 'pass' as const : 'fail' as const,
        message: condition ? message : `${message}. Expected: ${expected}, Actual: ${actual}`
      };
      testResults.push(result);
      
      if (condition) {
        console.log('✅ PASS:', message);
      } else {
        console.error('❌ FAIL:', `${message}. Expected: ${expected}, Actual: ${actual}`);
      }
      
      // Dispatch custom event to notify UI
      window.dispatchEvent(new CustomEvent('testResult', { detail: result }));
      
      // Also dispatch to play logs
      window.dispatchEvent(new CustomEvent('playLog', { 
        detail: condition ? `✅ PASS: ${message}` : `❌ FAIL: ${message}. Expected: ${expected}, Actual: ${actual}`
      }));
    };
    
    // Function to clear test results
    (window as any).clearTestResults = () => {
      testResults.length = 0;
      window.dispatchEvent(new CustomEvent('testResultsCleared'));
    };
  }
}
