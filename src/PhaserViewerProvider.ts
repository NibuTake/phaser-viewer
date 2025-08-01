import * as vscode from 'vscode';
import * as path from 'path';
import { GameObjectLoader, GameObjectStory } from './GameObjectLoader';

type TreeItem = FolderItem | GameObjectItem | StoryItem;

export class PhaserViewerProvider implements vscode.TreeDataProvider<TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | null | void> = new vscode.EventEmitter<TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private stories: GameObjectStory[] = [];
    private gameObjectLoader: GameObjectLoader;

    constructor(private workspaceRoot: string | undefined) {
        this.gameObjectLoader = new GameObjectLoader(workspaceRoot || '');
        this.refresh();
    }

    refresh(): void {
        this.loadStories().then(() => {
            this._onDidChangeTreeData.fire();
        });
    }

    private async loadStories() {
        if (this.workspaceRoot) {
            this.stories = await this.gameObjectLoader.loadGameObjectStories();
            console.log('[PhaserViewerProvider] Loaded stories:', this.stories.map(s => ({ 
                name: s.name, 
                isStorybook: s.isStorybook, 
                storiesCount: s.stories?.length || 0 
            })));
        }
    }

    getTreeItem(element: TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TreeItem): Thenable<TreeItem[]> {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No workspace folder open');
            return Promise.resolve([]);
        }

        if (!element) {
            // Root level - build tree structure
            return Promise.resolve(this.buildTreeStructure());
        }

        if (element instanceof FolderItem) {
            // Return children of this folder
            return Promise.resolve(element.children);
        }

        if (element instanceof GameObjectItem && element.story?.isStorybook && element.story.stories) {
            // Return individual stories for Storybook format demos
            return Promise.resolve(
                element.story.stories.map(story => 
                    new StoryItem(
                        story.name,
                        element.story!,
                        story,
                        {
                            command: 'phaser-viewer.previewStory',
                            title: 'Preview Story',
                            arguments: [element.story, story]
                        }
                    )
                )
            );
        }

        return Promise.resolve([]);
    }

    private buildTreeStructure(): TreeItem[] {
        const tree = new Map<string, FolderItem>();
        const rootItems: TreeItem[] = [];

        // Sort stories by path for consistent ordering
        const sortedStories = [...this.stories].sort((a, b) => a.filePath.localeCompare(b.filePath));

        for (const story of sortedStories) {
            const relativePath = path.relative(this.workspaceRoot!, story.filePath);
            const parts = relativePath.split(path.sep);
            const fileName = parts.pop()!;
            
            if (parts.length === 0) {
                // File is in root directory
                const collapsibleState = story.isStorybook && story.stories && story.stories.length > 0
                    ? vscode.TreeItemCollapsibleState.Collapsed
                    : vscode.TreeItemCollapsibleState.None;
                    
                rootItems.push(new GameObjectItem(
                    story.name,
                    story.filePath,
                    collapsibleState,
                    story.isStorybook ? undefined : {
                        command: 'phaser-viewer.previewGameObject',
                        title: 'Preview GameObject',
                        arguments: [story]
                    },
                    story
                ));
            } else {
                // File is in a subdirectory
                let currentPath = '';
                let parentFolder: FolderItem | null = null;
                
                for (let i = 0; i < parts.length; i++) {
                    const part = parts[i];
                    currentPath = currentPath ? path.join(currentPath, part) : part;
                    
                    if (!tree.has(currentPath)) {
                        const folder = new FolderItem(
                            part,
                            currentPath,
                            vscode.TreeItemCollapsibleState.Expanded
                        );
                        tree.set(currentPath, folder);
                        
                        if (parentFolder) {
                            parentFolder.children.push(folder);
                        } else {
                            rootItems.push(folder);
                        }
                    }
                    
                    parentFolder = tree.get(currentPath)!;
                }
                
                // Add the file to its parent folder
                if (parentFolder) {
                    const collapsibleState = story.isStorybook && story.stories && story.stories.length > 0
                        ? vscode.TreeItemCollapsibleState.Collapsed
                        : vscode.TreeItemCollapsibleState.None;
                        
                    parentFolder.children.push(new GameObjectItem(
                        story.name,
                        story.filePath,
                        collapsibleState,
                        story.isStorybook ? undefined : {
                            command: 'phaser-viewer.previewGameObject',
                            title: 'Preview GameObject',
                            arguments: [story]
                        },
                        story
                    ));
                }
            }
        }

        return rootItems;
    }
}

export class FolderItem extends vscode.TreeItem {
    public children: TreeItem[] = [];

    constructor(
        public readonly label: string,
        public readonly folderPath: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.tooltip = this.folderPath;
        this.iconPath = vscode.ThemeIcon.Folder;
        this.contextValue = 'folder';
    }
}

export class GameObjectItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly filePath: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command,
        public readonly story?: GameObjectStory
    ) {
        super(label, collapsibleState);
        this.tooltip = this.filePath;
        this.description = path.basename(path.dirname(this.filePath));
        this.iconPath = story?.isStorybook 
            ? new vscode.ThemeIcon('book') 
            : new vscode.ThemeIcon('symbol-class');
        this.contextValue = 'gameObjectItem';
    }
}

export class StoryItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly parentStory: GameObjectStory,
        public readonly story: any,
        public readonly command?: vscode.Command
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.tooltip = `${label} - ${parentStory.name}`;
        this.iconPath = new vscode.ThemeIcon('play-circle');
        this.contextValue = 'storyItem';
    }
}