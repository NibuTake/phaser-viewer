import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import PhaserPreview from "./components/PhaserPreview";
import { loadStoryGroups, setupGlobalComponents } from "./utils/storyLoader";
import { StoryGroup } from "./components/Sidebar";

function App() {
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
  const [storyPlay, setStoryPlay] = useState<
    ((scene: Phaser.Scene, component?: unknown) => void | Promise<void>) | null
  >(null);
  const [playLogs, setPlayLogs] = useState<string[]>([]);

  useEffect(() => {
    async function loadStories() {
      // Setup global components for Phaser
      setupGlobalComponents();

      // Load story groups
      const groups = await loadStoryGroups();
      setStoryGroups(groups);

      // Select first story by default
      if (groups.length > 0 && groups[0].stories.length > 0) {
        setSelectedStory({ group: 0, story: 0 });
        setStoryCode({ fn: groups[0].stories[0].create });
        setStoryName(groups[0].stories[0].name);
        setStoryArgs(groups[0].stories[0].args);
        setStoryPlay(groups[0].stories[0].play || null);
      }
    }

    loadStories();

    // Listen for play log events from tests
    const handlePlayLog = (event: CustomEvent) => {
      setPlayLogs(prev => [...prev, event.detail]);
    };

    window.addEventListener('playLog', handlePlayLog as EventListener);

    return () => {
      window.removeEventListener('playLog', handlePlayLog as EventListener);
    };
  }, []);

  const handleStorySelect = (groupIndex: number, storyIndex: number) => {
    setSelectedStory({ group: groupIndex, story: storyIndex });
    const story = storyGroups[groupIndex].stories[storyIndex];
    setStoryCode({ fn: story.create });
    setStoryName(story.name);
    setStoryArgs(story.args);
    setStoryPlay(story.play || null);
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar
        storyGroups={storyGroups}
        selectedStory={selectedStory}
        onStorySelect={handleStorySelect}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, minHeight: 0 }}>
          <PhaserPreview
            storyCode={storyCode}
            storyName={storyName}
            storyArgs={storyArgs}
            storyPlay={storyPlay}
            onPlayLog={(log) => setPlayLogs((prev) => [...prev, log])}
            onPlayStart={() => setPlayLogs([])}
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
            }}
          >
            Play Logs
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
                No play logs yet. Select a story with a play function to see
                logs here.
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
