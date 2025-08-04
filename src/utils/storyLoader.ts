import { StoryGroup } from "../components/Sidebar";

// Load story groups from user-provided modules (Storybook approach)
export async function loadStoryGroupsFromModules(userStoryModules: Record<string, unknown>): Promise<StoryGroup[]> {
  console.log("🔄 Loading story groups from provided modules...");

  try {
    if (Object.keys(userStoryModules).length === 0) {
      console.warn("⚠️ No story modules provided");
      return [];
    }

    const storyGroups: StoryGroup[] = [];

    for (const [path, module] of Object.entries(userStoryModules)) {
      try {
        console.log("📖 Loading story module:", path);
        const moduleObj = module as Record<string, unknown>;

        if (moduleObj.default && typeof moduleObj.default === 'object') {
          const meta = moduleObj.default as Record<string, unknown>;
          const stories = [];

          // Extract all exported stories (excluding default export)
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
                console.log(`🎬 Executing story: ${key}`);
                return createFunction(...args);
              };

              console.log(`📝 Story ${key} args:`, storyObj.args);
              
              // Handle play function properly
              const originalPlay = storyObj.play as ((scene: Phaser.Scene, component?: unknown) => void | Promise<void>) | undefined;
              
              console.log(`🎮 Story ${key} play function type:`, typeof originalPlay);
              
              const playFunction: ((scene: Phaser.Scene, component?: unknown) => void | Promise<void>) | undefined = typeof originalPlay === 'function' ? originalPlay : undefined;
              
              stories.push({
                name: (storyObj.name as string) || key,
                create: wrappedCreateFunction,
                args: storyObj.args,
                play: playFunction,
              });
            }
          }

          if (stories.length > 0) {
            // Extract preloadScene class from meta
            const preloadSceneClass = meta.preloadScene as (new () => Phaser.Scene) | undefined;
            console.log(`⚡ Meta preloadScene class type:`, typeof preloadSceneClass);
            
            // Check if group already exists
            let existingGroup = storyGroups.find((g) => g.title === (meta.title as string));
            if (!existingGroup) {
              existingGroup = {
                title: (meta.title as string) || "User Components",
                description: (meta.description as string) || "User defined components",
                tags: (meta.tags as string[]) || ["user"],
                stories: [],
                preloadScene: preloadSceneClass,
              };
              storyGroups.push(existingGroup);
            }

            // Add stories to group
            existingGroup.stories.push(...stories);
          }
        }
      } catch (error) {
        console.error(`❌ Error loading story module ${path}:`, error);
      }
    }

    console.log("🎉 Loaded story groups:", storyGroups);
    return storyGroups;
  } catch (error) {
    console.error("❌ Error loading stories:", error);
    return [];
  }
}

// Legacy function - no longer used, kept for backward compatibility
export async function loadStoryGroups(): Promise<StoryGroup[]> {
  console.warn("⚠️ loadStoryGroups() is deprecated. Use loadStoryGroupsFromModules() instead.");
  return [];
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

    (window as { testResults?: typeof testResults }).testResults = testResults;
    
    // Add Storybook-style assert functions for testing (logs only, no counting)
    (
      window as { assert?: (condition: boolean, message: string) => void }
    ).assert = (condition: boolean, message: string) => {
      if (condition) {
        console.log('✅ PASS:', message);
      } else {
        console.error('❌ FAIL:', message);
      }
      
      // Only dispatch to play logs, not to test result counter
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
      
      if (condition) {
        console.log('✅ PASS:', message);
      } else {
        console.error('❌ FAIL:', `${message}. Expected: ${expected}, Actual: ${actual}`);
      }
      
      // Only dispatch to play logs, not to test result counter
      window.dispatchEvent(new CustomEvent('playLog', { 
        detail: condition ? `✅ PASS: ${message}` : `❌ FAIL: ${message}. Expected: ${expected}, Actual: ${actual}`
      }));
    };
    
    // Function to clear test results
    (window as { clearTestResults?: () => void }).clearTestResults = () => {
      testResults.length = 0;
      window.dispatchEvent(new CustomEvent('testResultsCleared'));
    };

    // Note: Modern Storybook-style expect API is now imported directly in play functions
    // No need for global window.expect anymore
  }
}
