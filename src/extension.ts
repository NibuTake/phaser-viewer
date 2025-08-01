import * as vscode from 'vscode';
import { PhaserWebviewProvider } from './webview/PhaserWebviewProvider';
import { PhaserViewerProvider, GameObjectItem, FolderItem, StoryItem } from './PhaserViewerProvider';
import { GameObjectStory, GameObjectLoader, StoryBookStory } from './GameObjectLoader';

let previewPanel: vscode.WebviewPanel | undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log('Phaser Viewer is now active!');
    vscode.window.showInformationMessage('Phaser Viewer activated!');

    const workspaceRoot = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
        ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

    const webviewProvider = new PhaserWebviewProvider(context.extensionUri, context);
    const treeProvider = new PhaserViewerProvider(workspaceRoot);
    const gameObjectLoader = new GameObjectLoader(workspaceRoot || '');

    // Register WebView provider
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            PhaserWebviewProvider.viewType,
            webviewProvider
        )
    );

    // Register Tree View provider
    const treeView = vscode.window.createTreeView('phaserViewer', {
        treeDataProvider: treeProvider,
        showCollapseAll: true
    });
    
    console.log('Tree view created:', treeView);
    console.log('Tree view visible:', treeView.visible);
    console.log('Workspace root:', workspaceRoot);
    
    // Tree view will be shown automatically when items are available
    
    context.subscriptions.push(treeView);

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('phaser-viewer.openPreview', () => {
            const panel = vscode.window.createWebviewPanel(
                'phaserPreview',
                'Phaser Preview',
                vscode.ViewColumn.Two,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );

            panel.webview.html = getWebviewContent(panel.webview);
        })
    );

    // Preview mode (single click)
    context.subscriptions.push(
        vscode.commands.registerCommand('phaser-viewer.previewGameObject', (story: GameObjectStory) => {
            // Reuse existing preview panel if available
            if (previewPanel) {
                previewPanel.title = `Preview: ${story.name}`;
                previewPanel.webview.html = getGameObjectPreviewContent(previewPanel.webview, gameObjectLoader.generatePreviewCode(story));
                previewPanel.reveal(vscode.ViewColumn.Two, false);
            } else {
                // Create new preview panel
                previewPanel = vscode.window.createWebviewPanel(
                    'phaserGameObjectPreview',
                    `Preview: ${story.name}`,
                    vscode.ViewColumn.Two,
                    {
                        enableScripts: true,
                        retainContextWhenHidden: true
                    }
                );

                previewPanel.webview.html = getGameObjectPreviewContent(previewPanel.webview, gameObjectLoader.generatePreviewCode(story));
                
                // Clean up when panel is closed
                previewPanel.onDidDispose(() => {
                    previewPanel = undefined;
                }, null, context.subscriptions);
            }
        })
    );

    // Normal mode (double click)
    context.subscriptions.push(
        vscode.commands.registerCommand('phaser-viewer.openGameObject', (item: GameObjectItem) => {
            // Get story from the tree item
            const story = item?.story;
            if (!story) {
                vscode.window.showErrorMessage('Unable to open GameObject: story data not found');
                return;
            }
            
            // Always create a new panel for double click
            const panel = vscode.window.createWebviewPanel(
                'phaserGameObject',
                `${story.name}`,
                vscode.ViewColumn.Two,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );

            panel.webview.html = getGameObjectPreviewContent(panel.webview, gameObjectLoader.generatePreviewCode(story));
        })
    );

    // Preview individual story from Storybook format
    context.subscriptions.push(
        vscode.commands.registerCommand('phaser-viewer.previewStory', (parentStory: GameObjectStory, story: StoryBookStory) => {
            console.log('[Extension] previewStory called with:', { parentStory: parentStory?.name, story: story?.name });
            
            if (!parentStory || !story) {
                vscode.window.showErrorMessage('Unable to preview story: data not found');
                return;
            }
            
            // Generate preview code for this specific story
            const previewCode = generateStorybookPreviewCode(parentStory, story);
            console.log('[Extension] Generated preview code:', previewCode);
            
            // Reuse existing preview panel if available
            if (previewPanel) {
                previewPanel.title = `Preview: ${story.name}`;
                previewPanel.webview.html = getGameObjectPreviewContent(previewPanel.webview, previewCode);
                previewPanel.reveal(vscode.ViewColumn.Two, false);
            } else {
                // Create new preview panel
                previewPanel = vscode.window.createWebviewPanel(
                    'phaserStoryPreview',
                    `Preview: ${story.name}`,
                    vscode.ViewColumn.Two,
                    {
                        enableScripts: true,
                        retainContextWhenHidden: true
                    }
                );

                previewPanel.webview.html = getGameObjectPreviewContent(previewPanel.webview, previewCode);
                
                // Clean up when panel is closed
                previewPanel.onDidDispose(() => {
                    previewPanel = undefined;
                }, null, context.subscriptions);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('phaser-viewer.refresh', () => {
            treeProvider.refresh();
        })
    );

    // File watcher for hot reload - demo files
    const demoWatcher = vscode.workspace.createFileSystemWatcher('**/*.demo.ts');
    
    demoWatcher.onDidChange(() => {
        // Refresh tree view when demo files change
        treeProvider.refresh();
    });
    
    demoWatcher.onDidCreate(() => {
        treeProvider.refresh();
    });
    
    demoWatcher.onDidDelete(() => {
        treeProvider.refresh();
    });
    
    // File watcher for example files (.ts files that demo files import)
    const exampleWatcher = vscode.workspace.createFileSystemWatcher('**/examples/**/*.ts');
    const componentWatcher = vscode.workspace.createFileSystemWatcher('**/src/components/**/*.ts');
    
    exampleWatcher.onDidChange(() => {
        treeProvider.refresh();
    });
    
    componentWatcher.onDidChange(() => {
        treeProvider.refresh();
    });
    
    context.subscriptions.push(demoWatcher, exampleWatcher, componentWatcher);
}

export function deactivate() {}

function getGameObjectPreviewContent(webview: vscode.Webview, gameObjectCode: string): string {
    const nonce = getNonce();
    
    // Get user settings
    const config = vscode.workspace.getConfiguration('phaserViewer');
    const canvasWidth = config.get<number>('canvas.width', 800);
    const canvasHeight = config.get<number>('canvas.height', 600);
    const backgroundColor = config.get<string>('canvas.backgroundColor', '#2d2d2d');
    const renderer = config.get<string>('canvas.renderer', 'AUTO');
    
    // Convert renderer string to Phaser constant
    const rendererType = renderer === 'WEBGL' ? 'Phaser.WEBGL' : 
                        renderer === 'CANVAS' ? 'Phaser.CANVAS' : 'Phaser.AUTO';

    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}' https://cdn.jsdelivr.net; style-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} https: data:;">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>GameObject Preview</title>
            <style>
                body { margin: 0; padding: 0; overflow: hidden; background: #1e1e1e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                #container { width: 100%; height: 100vh; display: flex; flex-direction: column; }
                #control-bar { 
                    background: rgba(0, 0, 0, 0.8); 
                    color: white; 
                    padding: 8px 12px; 
                    display: flex; 
                    align-items: center; 
                    gap: 8px;
                    border-bottom: 1px solid #333;
                    font-size: 12px;
                }
                #control-bar button {
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 4px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                }
                #control-bar button:hover { background: #45a049; }
                #control-bar button.reset { background: #f44336; }
                #control-bar button.reset:hover { background: #da190b; }
                #control-bar button.pause { background: #ff9800; }
                #control-bar button.pause:hover { background: #e68900; }
                #control-bar button.interactive { background: #2196F3; }
                #control-bar button.interactive:hover { background: #1976D2; }
                #control-bar button.interactive.expanded { background: #1976D2; }
                #interactive-panel {
                    position: absolute;
                    top: 50px;
                    left: 12px;
                    right: 12px;
                    background: rgba(0, 0, 0, 0.95);
                    color: white;
                    padding: 12px;
                    border: 1px solid #444;
                    border-radius: 6px;
                    display: none;
                    font-size: 12px;
                    max-height: 300px;
                    overflow-y: auto;
                    z-index: 1000;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
                }
                #interactive-panel.visible { display: block; }
                .interactive-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 4px 8px;
                    margin: 2px 0;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                    cursor: pointer;
                }
                .interactive-item:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                .interactive-item-name { font-weight: bold; }
                .interactive-item-pos { color: #888; font-size: 10px; }
                .interactive-item-events { color: #4CAF50; font-size: 10px; }
                #game-container { 
                    flex: 1; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    position: relative;
                }
            </style>
        </head>
        <body>
            <div id="container">
                <div id="control-bar">
                    <button id="restart-btn" class="restart" title="Restart the current scene">🔄 Restart</button>
                    <button id="reset-btn" class="reset" title="Reset entire game (destroy and recreate)">⟲ Reset</button>
                    <button id="pause-btn" class="pause" title="Pause/Resume animations">⏸ Pause</button>
                    <button id="interactive-btn" class="interactive" title="Show interactive elements">🎯 Interactive (<span id="interactive-count">0</span>) ▼</button>
                    <span id="status">Running</span>
                </div>
                <div id="game-container">
                    <div id="interactive-panel">
                        <div id="interactive-list"></div>
                    </div>
                </div>
            </div>
            <script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
            <script nonce="${nonce}">
                let currentGame = null;
                let isPaused = false;
                let gameObjectCode = \`${gameObjectCode}\`;
                
                ${gameObjectCode}

                const config = {
                    type: ${rendererType},
                    width: ${canvasWidth},
                    height: ${canvasHeight},
                    parent: 'game-container',
                    backgroundColor: '${backgroundColor}',
                    scene: PreviewScene
                };

                currentGame = new Phaser.Game(config);
                window.game = currentGame;
                
                // Control functions
                function restartStory() {
                    if (currentGame) {
                        // Get the scene and restart it properly
                        const scene = currentGame.scene.getScene('PreviewScene');
                        if (scene) {
                            currentGame.scene.restart('PreviewScene');
                        }
                        document.getElementById('status').textContent = 'Scene Restarted';
                        setTimeout(() => {
                            document.getElementById('status').textContent = 'Running';
                        }, 1500);
                    }
                }
                
                function resetStory() {
                    if (currentGame) {
                        currentGame.destroy(true);
                        const config = {
                            type: ${rendererType},
                            width: ${canvasWidth},
                            height: ${canvasHeight},
                            parent: 'game-container',
                            backgroundColor: '${backgroundColor}',
                            scene: PreviewScene
                        };
                        currentGame = new Phaser.Game(config);
                        window.game = currentGame;
                        document.getElementById('status').textContent = 'Game Reset';
                        setTimeout(() => {
                            document.getElementById('status').textContent = 'Running';
                        }, 1500);
                    }
                }
                
                function togglePause() {
                    if (currentGame) {
                        const scene = currentGame.scene.getScene('PreviewScene');
                        if (scene) {
                            if (isPaused) {
                                scene.scene.resume();
                                document.getElementById('pause-btn').innerHTML = '⏸ Pause';
                                document.getElementById('status').textContent = 'Running';
                                isPaused = false;
                            } else {
                                scene.scene.pause();
                                document.getElementById('pause-btn').innerHTML = '▶ Resume';
                                document.getElementById('status').textContent = 'Paused';
                                isPaused = true;
                            }
                        }
                    }
                }
                
                // Interactive elements tracking
                let interactiveElements = [];
                let panelExpanded = false;
                
                function scanInteractiveElements() {
                    if (!currentGame) return;
                    
                    const scene = currentGame.scene.getScene('PreviewScene');
                    if (!scene) return;
                    
                    interactiveElements = [];
                    
                    // Scan all game objects for interactive elements
                    scene.children.list.forEach(obj => {
                        if (obj.input && obj.input.enabled) {
                            const events = [];
                            if (obj.listenerCount('pointerdown') > 0) events.push('click');
                            if (obj.listenerCount('pointerover') > 0) events.push('hover');
                            if (obj.listenerCount('pointerout') > 0) events.push('hover');
                            if (obj.listenerCount('pointermove') > 0) events.push('move');
                            
                            interactiveElements.push({
                                name: obj.type || 'GameObject',
                                x: Math.round(obj.x || 0),
                                y: Math.round(obj.y || 0),
                                events: events.join(', ') || 'interactive',
                                object: obj
                            });
                        }
                    });
                    
                    updateInteractiveUI();
                }
                
                function updateInteractiveUI() {
                    const countEl = document.getElementById('interactive-count');
                    const listEl = document.getElementById('interactive-list');
                    
                    countEl.textContent = interactiveElements.length;
                    
                    listEl.innerHTML = '';
                    if (interactiveElements.length === 0) {
                        listEl.innerHTML = '<div style="color: #888; text-align: center; padding: 20px;">No interactive elements found</div>';
                    } else {
                        interactiveElements.forEach((item, index) => {
                            const itemEl = document.createElement('div');
                            itemEl.className = 'interactive-item';
                            itemEl.innerHTML = \`
                                <div>
                                    <div class="interactive-item-name">\${item.name}</div>
                                    <div class="interactive-item-events">\${item.events}</div>
                                </div>
                                <div class="interactive-item-pos">(\${item.x}, \${item.y})</div>
                            \`;
                            
                            // Add click to highlight functionality
                            itemEl.addEventListener('click', () => {
                                highlightElement(item.object);
                            });
                            
                            listEl.appendChild(itemEl);
                        });
                    }
                }
                
                function highlightElement(obj) {
                    if (!obj || !currentGame) return;
                    
                    const scene = currentGame.scene.getScene('PreviewScene');
                    if (!scene) return;
                    
                    // Create highlight effect
                    const highlight = scene.add.graphics();
                    highlight.lineStyle(3, 0x00ff00, 1);
                    
                    if (obj.getBounds) {
                        const bounds = obj.getBounds();
                        highlight.strokeRect(bounds.x - 5, bounds.y - 5, bounds.width + 10, bounds.height + 10);
                    } else {
                        highlight.strokeCircle(obj.x, obj.y, 30);
                    }
                    
                    // Remove highlight after 2 seconds
                    scene.time.delayedCall(2000, () => {
                        if (highlight) highlight.destroy();
                    });
                }
                
                function toggleInteractivePanel() {
                    const panel = document.getElementById('interactive-panel');
                    const btn = document.getElementById('interactive-btn');
                    
                    panelExpanded = !panelExpanded;
                    
                    if (panelExpanded) {
                        panel.classList.add('visible');
                        btn.classList.add('expanded');
                        btn.innerHTML = '🎯 Interactive (<span id="interactive-count">' + interactiveElements.length + '</span>) ▲';
                        scanInteractiveElements();
                    } else {
                        panel.classList.remove('visible');
                        btn.classList.remove('expanded');
                        btn.innerHTML = '🎯 Interactive (<span id="interactive-count">' + interactiveElements.length + '</span>) ▼';
                    }
                }
                
                // Enhanced restart function to rescan elements
                function restartStoryEnhanced() {
                    restartStory();
                    setTimeout(() => {
                        scanInteractiveElements();
                    }, 100);
                }
                
                function resetStoryEnhanced() {
                    resetStory();
                    setTimeout(() => {
                        scanInteractiveElements();
                    }, 100);
                }
                
                // Event listeners
                document.getElementById('restart-btn').addEventListener('click', restartStoryEnhanced);
                document.getElementById('reset-btn').addEventListener('click', resetStoryEnhanced);
                document.getElementById('pause-btn').addEventListener('click', togglePause);
                document.getElementById('interactive-btn').addEventListener('click', toggleInteractivePanel);
                
                // Initial scan after game loads
                setTimeout(() => {
                    scanInteractiveElements();
                }, 500);
            </script>
        </body>
        </html>`;
}

function getWebviewContent(webview: vscode.Webview): string {
    const nonce = getNonce();
    
    // Get user settings
    const config = vscode.workspace.getConfiguration('phaserViewer');
    const canvasWidth = config.get<number>('canvas.width', 800);
    const canvasHeight = config.get<number>('canvas.height', 600);
    const backgroundColor = config.get<string>('canvas.backgroundColor', '#2d2d2d');
    const renderer = config.get<string>('canvas.renderer', 'AUTO');
    
    // Convert renderer string to Phaser constant
    const rendererType = renderer === 'WEBGL' ? 'Phaser.WEBGL' : 
                        renderer === 'CANVAS' ? 'Phaser.CANVAS' : 'Phaser.AUTO';

    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}' https://cdn.jsdelivr.net; style-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} https: data:;">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Phaser Preview</title>
            <style>
                body { margin: 0; padding: 0; overflow: hidden; background: #1e1e1e; }
                #game-container { width: 100%; height: 100vh; display: flex; align-items: center; justify-content: center; }
            </style>
        </head>
        <body>
            <div id="game-container"></div>
            <script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
            <script nonce="${nonce}">
                const vscode = acquireVsCodeApi();
                
                class PreviewScene extends Phaser.Scene {
                    constructor() {
                        super({ key: 'PreviewScene' });
                    }

                    create() {
                        // Basic example: create a sprite
                        const graphics = this.add.graphics();
                        graphics.fillStyle(0xff0000, 1);
                        graphics.fillRect(${canvasWidth/2-100}, ${canvasHeight/2-100}, 200, 200);
                        
                        this.add.text(${canvasWidth/2}, ${canvasHeight/2-150}, 'Phaser GameObject Preview', { 
                            fontSize: '24px', 
                            color: '#ffffff' 
                        }).setOrigin(0.5);
                    }
                }

                const config = {
                    type: ${rendererType},
                    width: ${canvasWidth},
                    height: ${canvasHeight},
                    parent: 'game-container',
                    backgroundColor: '${backgroundColor}',
                    scene: PreviewScene
                };

                const game = new Phaser.Game(config);
            </script>
        </body>
        </html>`;
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function generateStorybookPreviewCode(parentStory: GameObjectStory, story: StoryBookStory): string {
    const argsJson = story.args ? JSON.stringify(story.args) : '{}';
    
    // Remove TypeScript type annotations and modern JS syntax (safer approach)
    let cleanCreateFunction = story.create;
    
    // Step 1: Remove parameter type annotations only
    cleanCreateFunction = cleanCreateFunction.replace(/\(\s*([^)]*?):\s*[^,)]+\s*,\s*([^)]*?):\s*[^,)]+\s*\)/g, '($1, $2)');
    cleanCreateFunction = cleanCreateFunction.replace(/\(\s*([^)]*?):\s*[^,)]+\s*\)/g, '($1)');
    
    // Step 2: Replace modern syntax
    cleanCreateFunction = cleanCreateFunction
        .replace(/\?\./g, '.')                          // Replace optional chaining
        .replace(/\?\?\s*/g, ' || ')                    // Replace nullish coalescing
        .replace(/const\s+/g, 'var ')                   // Replace const with var
        .replace(/let\s+/g, 'var ');                    // Replace let with var
    
    let cleanPlayFunction = null;
    if (story.play) {
        // Very minimal cleaning for play function to avoid breaking object properties
        cleanPlayFunction = story.play
            .replace('(scene: Phaser.Scene, component: any)', '(scene, component)')  // Manual replacement
            .replace(/const\s+/g, 'var ')                   // Replace const with var
            .replace(/let\s+/g, 'var ');                    // Replace let with var
    }
    
    return `
        // Component definitions
        ${parentStory.componentImports || ''}
        
        // Fallback Button class definition (remove when import works)
        ${!parentStory.componentImports ? `
        class Button extends Phaser.GameObjects.Container {
            constructor(scene, x, y, text, config) {
                // Pass position to super constructor
                super(scene, x, y);
                
                console.log('[Button] Creating button with args:', {scene, x, y, text, config});
                
                // Ensure we have valid coordinates
                if (typeof x !== 'number') x = 400;
                if (typeof y !== 'number') y = 300; 
                
                var width = (config && config.width) || 200;
                var height = (config && config.height) || 60;
                var color = (config && config.color) || 0x4CAF50;
                
                console.log('[Button] Using values:', {x, y, width, height, color, text});
                
                this.background = scene.add.rectangle(0, 0, width, height, color);
                this.text = scene.add.text(0, 0, text, {
                    fontSize: (config && config.fontSize) || '24px',
                    color: (config && config.fontColor) || '#ffffff'
                }).setOrigin(0.5);
                
                console.log('[Button] Created background and text:', {background: this.background, text: this.text});
                
                this.add([this.background, this.text]);
                this.setSize(width, height);
                this.setInteractive();
                
                // Double-check position setting
                this.x = x;
                this.y = y;
                
                console.log('[Button] Set position to:', {x: this.x, y: this.y});
                
                scene.add.existing(this);
                
                console.log('[Button] Final button state:', {
                    x: this.x, 
                    y: this.y, 
                    visible: this.visible, 
                    active: this.active,
                    children: this.list.length
                });
            }
            
            setColor(color) {
                this.background.setFillStyle(color);
            }
            
            setText(text) {
                this.text.setText(text);
            }
            
            enable() {
                this.setAlpha(1);
                this.setInteractive();
            }
            
            disable() {
                this.setAlpha(0.5);
                this.removeInteractive();
            }
        }
        ` : ''}

        class PreviewScene extends Phaser.Scene {
            constructor() {
                super({ key: 'PreviewScene' });
            }

            preload() {
                // Add any asset loading here
            }

            create() {
                // Clear previous objects
                this.children.removeAll();
                
                // Story args
                const args = ${argsJson};
                console.log('[PreviewScene] Story args:', args);
                
                // Validate args has the required properties
                if (!args.x) args.x = 400;
                if (!args.y) args.y = 300;
                if (!args.text) args.text = 'Button';
                
                console.log('[PreviewScene] Validated args:', args);
                
                // Execute the story's create function
                const createFunction = ${cleanCreateFunction};
                console.log('[PreviewScene] Create function:', createFunction);
                const component = createFunction(this, args);
                console.log('[PreviewScene] Created component:', component);
                
                // Verify component was created and positioned
                if (component) {
                    console.log('[PreviewScene] Component position:', {x: component.x, y: component.y});
                    console.log('[PreviewScene] Component visible:', component.visible);
                }
                
                // Execute play function if it exists
                ${cleanPlayFunction ? `
                console.log('[PreviewScene] Executing play function...');
                const playFunction = ${cleanPlayFunction};
                console.log('[PreviewScene] Play function:', playFunction);
                
                // Execute play function with some delay to let the component settle
                this.time.delayedCall(100, () => {
                    try {
                        playFunction(this, component);
                        console.log('[PreviewScene] Play function executed successfully');
                    } catch (error) {
                        console.error('[PreviewScene] Error executing play function:', error);
                    }
                });
                ` : `
                console.log('[PreviewScene] No play function defined for this story');
                `}
            }

            update() {
                // Update logic if needed
            }
        }

        // Restart the scene with new code
        if (window.game) {
            window.game.scene.stop('PreviewScene');
            window.game.scene.remove('PreviewScene');
            window.game.scene.add('PreviewScene', PreviewScene, true);
        }
    `;
}