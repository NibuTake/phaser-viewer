import * as vscode from 'vscode';
import * as path from 'path';

export interface GameObjectStory {
    name: string;
    filePath: string;
    code: string;
    isFunction?: boolean;
    isStorybook?: boolean;
    stories?: StoryBookStory[];
    componentImports?: string;
}

export interface StoryBookStory {
    key: string;
    name: string;
    args?: any;
    create: string;
    play?: string;
}

export class GameObjectLoader {
    constructor(private workspaceRoot: string) {}

    async loadGameObjectStories(): Promise<GameObjectStory[]> {
        const stories: GameObjectStory[] = [];
        
        // Find all .demo.ts files
        const files = await vscode.workspace.findFiles('**/*.demo.ts', '**/node_modules/**');
        
        for (const file of files) {
            const content = await vscode.workspace.openTextDocument(file);
            const code = content.getText();
            
            // Extract story name from filename
            const fileName = path.basename(file.fsPath, '.demo.ts');
            
            // Check if it's a Storybook format (has default export with component/title)
            const hasDefaultExport = code.match(/export\s+default\s+{[\s\S]*?component:[\s\S]*?title:[\s\S]*?}/);
            
            console.log(`[GameObjectLoader] File: ${fileName}`);
            console.log(`[GameObjectLoader] Has default export: ${!!hasDefaultExport}`);
            
            if (hasDefaultExport) {
                // This is a Storybook format demo
                const storybookStories: StoryBookStory[] = [];
                
                // Extract component import to include in the generated code
                const componentImports = await this.extractComponentImports(code, file.fsPath);
                
                // Extract all named exports (stories) - improved regex
                const namedExportRegex = /export\s+const\s+(\w+)\s*=\s*{([\s\S]*?)};/g;
                let match;
                
                while ((match = namedExportRegex.exec(code)) !== null) {
                    const storyKey = match[1];
                    if (storyKey === 'default') {continue;}
                    
                    const storyContent = match[2]; // Content inside the braces
                    const nameMatch = storyContent.match(/name:\s*['"]([^'"]+)['"]/);
                    
                    // Extract args object using balanced brace matching
                    const argsFunction = this.extractFunction(storyContent, 'args');
                    let argsObject = null;
                    if (argsFunction) {
                        try {
                            // Extract the object literal from the function-like format
                            // argsFunction is in format: "(args) => {object content}"
                            // We need to extract just the object content
                            const argsMatch = argsFunction.match(/\(\s*.*?\s*\)\s*=>\s*({[\s\S]*})/);
                            if (argsMatch) {
                                const argsString = argsMatch[1]
                                    .replace(/(\w+):/g, '"$1":')  // Add quotes to property names
                                    .replace(/'/g, '"');          // Convert single quotes to double quotes
                                argsObject = JSON.parse(argsString);
                            }
                        } catch (error) {
                            console.warn(`[GameObjectLoader] Failed to parse args for ${storyKey}:`, error);
                        }
                    } else {
                        // Try direct object extraction with balanced braces
                        const argsMatch = storyContent.match(/args:\s*({)/);
                        if (argsMatch) {
                            const startIndex = storyContent.indexOf(argsMatch[0]) + argsMatch[0].length - 1;
                            let braceCount = 1;
                            let endIndex = startIndex + 1;
                            
                            while (endIndex < storyContent.length && braceCount > 0) {
                                const char = storyContent[endIndex];
                                if (char === '{') {
                                    braceCount++;
                                } else if (char === '}') {
                                    braceCount--;
                                }
                                endIndex++;
                            }
                            
                            if (braceCount === 0) {
                                const argsObjectString = storyContent.substring(startIndex, endIndex);
                                try {
                                    const argsString = argsObjectString
                                        .replace(/(\w+):/g, '"$1":')  // Add quotes to property names
                                        .replace(/'/g, '"');          // Convert single quotes to double quotes
                                    argsObject = JSON.parse(argsString);
                                } catch (error) {
                                    console.warn(`[GameObjectLoader] Failed to parse direct args for ${storyKey}:`, error);
                                }
                            }
                        }
                    }
                    
                    // Extract create function using balanced brace matching
                    const createFunction = this.extractFunction(storyContent, 'create');
                    const playFunction = this.extractFunction(storyContent, 'play');
                    
                    console.log(`[GameObjectLoader] Story: ${storyKey}, Name: ${nameMatch?.[1] || 'N/A'}, Has create: ${!!createFunction}, Args: ${JSON.stringify(argsObject)}`);
                    if (createFunction) {
                        console.log(`[GameObjectLoader] Create function: ${createFunction.substring(0, 100)}...`);
                    }
                    
                    if (createFunction) {
                        storybookStories.push({
                            key: storyKey,
                            name: nameMatch ? nameMatch[1] : storyKey,
                            args: argsObject,
                            create: createFunction,
                            play: playFunction || undefined
                        });
                    }
                }
                
                console.log(`[GameObjectLoader] Found ${storybookStories.length} stories for ${fileName}`);
                console.log(`[GameObjectLoader] Component imports: ${componentImports ? componentImports.substring(0, 100) + '...' : 'None'}`);
                
                stories.push({
                    name: fileName,
                    filePath: file.fsPath,
                    code: code,
                    isFunction: false,
                    isStorybook: true,
                    stories: storybookStories,
                    componentImports: componentImports
                });
            } else {
                // Legacy format - check for simple imports
                let finalCode = code;
                const importMatch = code.match(/import\s*{\s*(\w+)\s*}\s*from\s*['"]([^'"]+)['"]/);
                const exportMatch = code.match(/export\s+default\s+(\w+)\.create/);
                
                if (importMatch && exportMatch) {
                    // Load the referenced example file
                    const exampleFileName = importMatch[2];
                    const demoDir = path.dirname(file.fsPath);
                    const examplePath = path.resolve(demoDir, exampleFileName + '.ts');
                    
                    try {
                        const exampleUri = vscode.Uri.file(examplePath);
                        const exampleDoc = await vscode.workspace.openTextDocument(exampleUri);
                        const exampleContent = exampleDoc.getText();
                        
                        // Extract the create function from the example object
                        const exampleObjectMatch = exampleContent.match(/export\s+const\s+\w+\s*=\s*{[\s\S]*?create:\s*\(scene:\s*Phaser\.Scene\)\s*=>\s*{([\s\S]*?)}\s*}/);
                        
                        if (exampleObjectMatch) {
                            // Convert to a direct function export
                            finalCode = `export default function(scene: Phaser.Scene) {\n${exampleObjectMatch[1]}\n}`;
                        }
                    } catch (error) {
                        console.error('Error loading example file:', error);
                    }
                }
                
                // Check if it's function export format
                const isFunctionFormat = finalCode.includes('export default') && 
                                       (finalCode.includes('function') || finalCode.includes('=>'));
                
                stories.push({
                    name: fileName,
                    filePath: file.fsPath,
                    code: finalCode,
                    isFunction: isFunctionFormat
                });
            }
        }
        
        return stories;
    }

    generatePreviewCode(story: GameObjectStory): string {
        if (story.isFunction) {
            return this.generateFunctionBasedCode(story);
        } else {
            return this.generateLegacyCode(story);
        }
    }

    private generateFunctionBasedCode(story: GameObjectStory): string {
        // Convert export default function to direct function call
        const functionCode = story.code
            .replace(/export\s+default\s+function\s*\(\s*scene\s*:\s*Phaser\.Scene\s*\)\s*{/, '')
            .replace(/}$/, '');

        return `
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
                    
                    // Execute user's demo function with scene as parameter
                    const scene = this;
                    ${functionCode}
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

    private generateLegacyCode(story: GameObjectStory): string {
        return `
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
                    
                    // User's GameObject code will be injected here (legacy format)
                    ${story.code}
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

    private extractFunction(content: string, functionName: string): string | null {
        // Find the function definition
        const regex = new RegExp(`${functionName}:\\s*\\(([^)]*)\\)\\s*=>\\s*{`, 'g');
        const match = regex.exec(content);
        
        if (!match) {
            return null;
        }
        
        const params = match[1];
        const startIndex = match.index + match[0].length;
        
        // Find the matching closing brace using a simple counter
        let braceCount = 1;
        let endIndex = startIndex;
        
        while (endIndex < content.length && braceCount > 0) {
            const char = content[endIndex];
            if (char === '{') {
                braceCount++;
            } else if (char === '}') {
                braceCount--;
            }
            endIndex++;
        }
        
        if (braceCount === 0) {
            const functionBody = content.substring(startIndex, endIndex - 1);
            return `(${params}) => {${functionBody}}`;
        }
        
        return null;
    }

    private async extractComponentImports(code: string, filePath: string): Promise<string> {
        // Extract import statements
        const importMatch = code.match(/import\s*{\s*(\w+)\s*}\s*from\s*['"]([^'"]+)['"]/);
        
        if (!importMatch) {
            return '';
        }
        
        const componentName = importMatch[1];
        const importPath = importMatch[2];
        
        // Resolve the import path and read the component file
        try {
            // Get the directory of the demo file, not the workspace root
            const demoFileDir = path.dirname(filePath);
            const componentPath = path.resolve(demoFileDir, importPath + '.ts');
            
            console.log(`[GameObjectLoader] Trying to load component from: ${componentPath}`);
            
            const componentUri = vscode.Uri.file(componentPath);
            const componentDoc = await vscode.workspace.openTextDocument(componentUri);
            const componentContent = componentDoc.getText();
            
            // Convert TypeScript class to JavaScript - more careful approach
            let jsContent = componentContent;
            
            // Step 1: Remove TypeScript modifiers and class export
            jsContent = jsContent
                .replace(/export\s+class/g, 'class')
                .replace(/private\s+/g, '')
                .replace(/public\s+/g, '')
                .replace(/readonly\s+/g, '');
            
            // Step 2: Remove only class property declarations that end with semicolon (not object properties)
            jsContent = jsContent.replace(/^(\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*[^;=]+;\s*$/gm, (match, indent, propName) => {
                // Only remove if it looks like a class property (no comma, ends with semicolon)
                if (match.includes(',') || !match.includes(';')) {
                    return match; // Keep object properties
                }
                return ''; // Remove class properties
            });
            
            // Step 3: Clean constructor - handle multiline constructor with bracket matching
            // First, let's find the constructor and clean it properly
            const constructorMatch = jsContent.match(/constructor\s*\(([\s\S]*?)\)\s*{/);
            if (constructorMatch) {
                const fullMatch = constructorMatch[0];
                const paramString = constructorMatch[1];
                
                // Split parameters but handle nested braces for complex types like config?: {...}
                const params = [];
                let current = '';
                let braceDepth = 0;
                let parenDepth = 0;
                
                for (let i = 0; i < paramString.length; i++) {
                    const char = paramString[i];
                    if (char === '{') {braceDepth++;}
                    else if (char === '}') {braceDepth--;}
                    else if (char === '(') {parenDepth++;}
                    else if (char === ')') {parenDepth--;}
                    else if (char === ',' && braceDepth === 0 && parenDepth === 0) {
                        params.push(current.trim());
                        current = '';
                        continue;
                    }
                    current += char;
                }
                if (current.trim()) {params.push(current.trim());}
                
                // Extract just parameter names
                const paramNames = params
                    .map(param => {
                        const nameMatch = param.trim().match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)/);
                        return nameMatch ? nameMatch[1] : '';
                    })
                    .filter(name => name.length > 0);
                
                // Replace the entire constructor signature
                jsContent = jsContent.replace(fullMatch, `constructor(${paramNames.join(', ')}) {`);
            }
            
            // Step 4: Clean method signatures - preserve parameter names but remove types
            jsContent = jsContent.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*:\s*[^{]+\s*{/g, (match, methodName, params) => {
                // Extract parameter names only
                const paramNames = params
                    .split(',')
                    .map((param: string) => {
                        const nameMatch = param.trim().match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)/);
                        return nameMatch ? nameMatch[1] : '';
                    })
                    .filter((name: string) => name.length > 0);
                
                return `${methodName}(${paramNames.join(', ')}) {`;
            });
            
            // Step 5: Replace ES2020+ syntax
            jsContent = jsContent
                .replace(/\?\./g, '.')                          // Replace optional chaining
                .replace(/\?\?\s*/g, ' || ')                    // Replace nullish coalescing
                .replace(/const\s+/g, 'var ')                   // Replace const with var
                .replace(/let\s+/g, 'var ')                     // Replace let with var
                .replace(/config\.\s*([a-zA-Z_$][a-zA-Z0-9_$]*)/g, '(config && config.$1)'); // Fix property access
            
            return jsContent;
        } catch (error) {
            console.error('Error loading component file:', error);
            return '';
        }
    }
}