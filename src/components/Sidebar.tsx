import React, { useState } from "react";

export interface Story {
  name: string;
  create: (scene: Phaser.Scene, args?: unknown) => unknown; // Function only
  args?: unknown; // Optional arguments for the create function
  play?: (scene: Phaser.Scene, component?: unknown) => void | Promise<void>; // Optional play function for animations and interactions
}

export interface StoryGroup {
  title: string;
  description?: string;
  tags?: string[];
  stories: Story[];
}

interface SidebarProps {
  storyGroups: StoryGroup[];
  selectedStory: { group: number; story: number } | null;
  onStorySelect: (groupIndex: number, storyIndex: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  storyGroups,
  selectedStory,
  onStorySelect,
}) => {
  // 各グループの開閉状態を管理（デフォルトは全て開いている）
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(
    new Set(storyGroups.map((_, index) => index))
  );

  // グループの開閉を切り替える
  const toggleGroup = (groupIndex: number) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupIndex)) {
      newExpanded.delete(groupIndex);
    } else {
      newExpanded.add(groupIndex);
    }
    setExpandedGroups(newExpanded);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>Phaser Viewer</h1>
        <p>Interactive Phaser 3 Component Library</p>
      </div>

      <div className="story-list">
        {storyGroups.map((group, groupIndex) => {
          const isExpanded = expandedGroups.has(groupIndex);
          
          return (
            <div key={groupIndex} className="story-group">
              <div className="group-header">
                <div 
                  className="group-title"
                  onClick={() => toggleGroup(groupIndex)}
                >
                  <span className="group-icon">
                    {isExpanded ? "📂" : "📁"}
                  </span>
                  <span className="group-name">{group.title}</span>
                  <span className="expand-icon">
                    {isExpanded ? "▼" : "▶"}
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div className="stories">
                  {group.stories.map((story, storyIndex) => (
                    <button
                      key={storyIndex}
                      className={`story-item ${
                        selectedStory?.group === groupIndex &&
                        selectedStory?.story === storyIndex
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => onStorySelect(groupIndex, storyIndex)}
                    >
                      <span className="story-icon">📄</span>
                      <span className="story-name">{story.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .sidebar {
          width: 300px;
          height: 100vh;
          background: #1e1e1e;
          border-right: 1px solid #333;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        
        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid #333;
          background: #2d2d2d;
        }
        
        .sidebar-header h1 {
          margin: 0 0 8px 0;
          color: #fff;
          font-size: 20px;
          font-weight: 600;
        }
        
        .sidebar-header p {
          margin: 0;
          color: #aaa;
          font-size: 14px;
        }
        
        .story-list {
          flex: 1;
          padding: 16px 0;
        }
        
        .story-group {
          margin-bottom: 8px;
        }
        
        .group-header {
          margin-bottom: 4px;
        }
        
        .group-title {
          display: flex;
          align-items: center;
          padding: 8px 16px;
          background: #2d2d2d;
          border-radius: 4px;
          margin: 0 8px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .group-title:hover {
          background: #3a3a3a;
        }
        
        .group-icon {
          margin-right: 8px;
          font-size: 14px;
        }
        
        .group-name {
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          flex: 1;
        }

        .expand-icon {
          color: #aaa;
          font-size: 12px;
          margin-left: 4px;
          transition: transform 0.2s ease;
        }
        
        .stories {
          display: flex;
          flex-direction: column;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .story-item {
          background: none;
          border: none;
          color: #ccc;
          padding: 8px 16px 8px 40px;
          text-align: left;
          cursor: pointer;
          transition: background-color 0.2s;
          font-size: 13px;
          display: flex;
          align-items: center;
          margin: 0 8px;
          border-radius: 4px;
        }
        
        .story-item:hover {
          background: #333;
          color: #fff;
        }
        
        .story-item.selected {
          background: #0066cc;
          color: #fff;
        }
        
        .story-item.selected:hover {
          background: #0077dd;
        }
        
        .story-icon {
          margin-right: 8px;
          font-size: 12px;
        }
        
        .story-name {
          flex: 1;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
