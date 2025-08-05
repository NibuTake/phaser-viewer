import { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "./components/Sidebar";
import { PhaserPreview } from "./components/PhaserPreview";
import { loadStoryGroupsFromModules, setupGlobalComponents } from "./utils/storyLoader";
import { StoryGroup } from "./components/Sidebar";

interface AppProps {
  userStoryModules?: Record<string, unknown>;
  sceneConfig?: {
    width?: number;
    height?: number;
    backgroundColor?: string;
    displayScale?: number;
  };
}

function App({ userStoryModules, sceneConfig }: AppProps) {
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [selectedStory, setSelectedStory] = useState<{
    group: number;
    story: number;
  } | null>(null);
  const [storyCode, setStoryCode] = useState<{
    fn: (scene: Phaser.Scene, args?: unknown) => unknown;
  } | null>(null);
  const [storyName, setStoryName] = useState<string>("");
  const [storyArgs, setStoryArgs] = useState<unknown>(null);
  const storyPlayRef = useRef<
    ((scene: Phaser.Scene, component?: unknown) => void | Promise<void>) | null
  >(null);
  // Use useRef instead of useState to store preloadScene class
  const preloadSceneRef = useRef<(new () => Phaser.Scene) | null>(null);
  const [playLogs, setPlayLogs] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<Array<{
    name: string;
    status: 'pass' | 'fail';
    message: string;
  }>>([]);

  useEffect(() => {
    async function loadStories() {
      // Setup global components for Phaser
      setupGlobalComponents();

      // Load story groups from user modules (Storybook approach)
      console.log('🔄 Loading stories from user modules:', userStoryModules);
      const groups = await loadStoryGroupsFromModules(userStoryModules || {});
      setStoryGroups(groups);

      // Select first story by default
      if (groups.length > 0 && groups[0].stories.length > 0) {
        const firstStory = groups[0].stories[0];
        
        // Clear play logs for initial story load
        setPlayLogs([]);
        
        console.log("🏁 Initial story loading:", firstStory.name);
        console.log("🏁 Initial play function type:", typeof firstStory.play);
        console.log("🏁 Initial play function:", firstStory.play);
        
        // Ensure play function is not accidentally executed during initial load
        const initialPlayFunction = firstStory.play;
        console.log("🏁 Initial play function assigned:", initialPlayFunction);
        console.log("🏁 Initial play function type after assignment:", typeof initialPlayFunction);
        
        setSelectedStory({ group: 0, story: 0 });
        setStoryCode({ fn: firstStory.create });
        setStoryName(firstStory.name);
        setStoryArgs(firstStory.args);
        storyPlayRef.current = initialPlayFunction || null;
        const initialPreloadScene = groups[0].preloadScene;
        console.log('🏁 Initial preloadScene class type:', typeof initialPreloadScene);
        console.log('🏁 Setting preloadSceneRef.current to:', initialPreloadScene);
        preloadSceneRef.current = initialPreloadScene || null;
        console.log('🏁 preloadSceneRef.current set completed');
      }
    }

    loadStories();

    // Listen for play log events from tests
    const handlePlayLogEvent = (event: CustomEvent) => {
      setPlayLogs(prev => [...prev, event.detail]);
    };

    // Listen for test result events
    const handleTestResultEvent = (event: CustomEvent) => {
      setTestResults(prev => [...prev, event.detail]);
    };

    const handleTestResultsClearedEvent = () => {
      setTestResults([]);
    };

    window.addEventListener('playLog', handlePlayLogEvent as EventListener);
    window.addEventListener('testResult', handleTestResultEvent as EventListener);
    window.addEventListener('testResultsCleared', handleTestResultsClearedEvent);

    return () => {
      window.removeEventListener('playLog', handlePlayLogEvent as EventListener);
      window.removeEventListener('testResult', handleTestResultEvent as EventListener);
      window.removeEventListener('testResultsCleared', handleTestResultsClearedEvent);
    };
  }, [userStoryModules]);

  const handleStorySelect = useCallback((groupIndex: number, storyIndex: number) => {
    setSelectedStory({ group: groupIndex, story: storyIndex });
    const story = storyGroups[groupIndex].stories[storyIndex];
    
    // Clear play logs when switching to a different demo
    setPlayLogs([]);
    
    console.log("🔄 Story selected:", story.name);
    console.log("🔄 Story play function type:", typeof story.play);
    console.log("🔄 Story play function:", story.play);
    
    // Ensure we're not accidentally calling the play function
    const playFunction = story.play;
    console.log("🔄 Play function assigned:", playFunction);
    console.log("🔄 Play function type after assignment:", typeof playFunction);
    
    setStoryCode({ fn: story.create });
    setStoryName(story.name);
    setStoryArgs(story.args);
    storyPlayRef.current = playFunction || null;
    const preloadScene = storyGroups[groupIndex].preloadScene;
    console.log('🔄 Story group preloadScene class type:', typeof preloadScene);
    console.log('🔄 Setting preloadSceneRef.current to:', preloadScene);
    preloadSceneRef.current = preloadScene || null;
    console.log('🔄 preloadSceneRef.current set completed');
  }, [storyGroups]);

  const handlePlayLog = useCallback((log: string) => {
    setPlayLogs((prev) => [...prev, log]);
  }, []);

  const handlePlayStart = useCallback(() => {
    setPlayLogs([]);
  }, []);

  const handlePlayStory = useCallback(async (groupIndex: number, storyIndex: number) => {
    // First select the story if it's not already selected
    if (selectedStory?.group !== groupIndex || selectedStory?.story !== storyIndex) {
      handleStorySelect(groupIndex, storyIndex);
      // Wait a bit for the story to be loaded
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Then execute the play function
    const story = storyGroups[groupIndex]?.stories[storyIndex];
    if (story?.play) {
      // Clear previous logs
      setPlayLogs([]);
      
      // Dispatch a custom event to trigger the play function in PhaserPreview
      window.dispatchEvent(new CustomEvent('sidebarPlayRequest'));
    }
  }, [selectedStory, storyGroups, handleStorySelect]);

  // Calculate test result statistics
  const testStats = testResults.reduce(
    (acc, result) => {
      if (result.status === 'pass') {
        acc.passed++;
      } else {
        acc.failed++;
      }
      acc.total++;
      return acc;
    },
    { passed: 0, failed: 0, total: 0 }
  );

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar
        storyGroups={storyGroups}
        selectedStory={selectedStory}
        onStorySelect={handleStorySelect}
        onPlayStory={handlePlayStory}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, minHeight: 0 }}>
          <PhaserPreview
            storyCode={storyCode}
            storyName={storyName}
            storyArgs={storyArgs}
            preloadScene={preloadSceneRef.current}
            storyPlay={storyPlayRef.current}
            onPlayLog={handlePlayLog}
            onPlayStart={handlePlayStart}
            sceneConfig={sceneConfig}
          />
        </div>
        <div
          style={{
            height: "200px",
            background: "#1a1a1a",
            borderTop: "1px solid #333",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #333",
              background: "#252525",
              color: "#fff",
              fontSize: "14px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}
          >
            <span>Play Logs</span>
            {testStats.total > 0 && (
              <div style={{ display: "flex", gap: "8px" }}>
                {testStats.passed > 0 && (
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "500",
                    whiteSpace: "nowrap",
                    background: "#28a745",
                    color: "white"
                  }}>
                    ✅ {testStats.passed} Passed
                  </span>
                )}
                {testStats.failed > 0 && (
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "500",
                    whiteSpace: "nowrap",
                    background: "#dc3545",
                    color: "white"
                  }}>
                    ❌ {testStats.failed} Failed
                  </span>
                )}
              </div>
            )}
          </div>
          <div
            style={{
              flex: 1,
              overflow: "auto",
              padding: "8px 16px",
              fontFamily: "Monaco, Consolas, monospace",
              fontSize: "12px",
              color: "#ccc",
              lineHeight: "1.4",
            }}
          >
            {playLogs.length === 0 ? (
              <div style={{ color: "#666", fontStyle: "italic" }}>
                No play logs yet. Click the Play button to execute tests and see
                logs here. Logs are cleared when switching demos.
              </div>
            ) : (
              playLogs.map((log, index) => (
                <div key={index} style={{ marginBottom: "4px" }}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
