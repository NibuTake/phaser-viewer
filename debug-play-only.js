// Debug only play function extraction and cleaning
const fs = require('fs');

const demoContent = fs.readFileSync('./src/components/button.demo.ts', 'utf8');

// Extract WithAnimation story
const animationMatch = demoContent.match(/export const WithAnimation = \{([\s\S]*?)\};/);
if (animationMatch) {
    const storyContent = animationMatch[1];
    console.log('=== WithAnimation Story Content ===');
    console.log(storyContent.substring(0, 500) + '...');
    
    function extractFunction(content, functionName) {
        const regex = new RegExp(`${functionName}:\\s*\\(([^)]*)\\)\\s*=>\\s*{`, 'g');
        const match = regex.exec(content);
        
        if (!match) {
            return null;
        }
        
        const params = match[1];
        const startIndex = match.index + match[0].length;
        
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
    
    const playFunction = extractFunction(storyContent, 'play');
    console.log('\n=== Extracted Play Function ===');
    console.log(playFunction);
    
    if (playFunction) {
        // Apply the minimal cleaning approach
        let cleanPlayFunction = playFunction
            .replace('(scene: Phaser.Scene, component: any)', '(scene, component)')  // Manual replacement
            .replace(/const\s+/g, 'var ')                   // Replace const with var
            .replace(/let\s+/g, 'var ');                    // Replace let with var
        
        console.log('\n=== Cleaned Play Function ===');
        console.log(cleanPlayFunction);
        
        // Check for syntax errors by trying to parse it
        try {
            // Wrap in a function to test syntax
            const testCode = `function test() { var playFunc = ${cleanPlayFunction}; }`;
            eval(testCode);
            console.log('\n✅ Syntax is valid!');
        } catch (error) {
            console.log('\n❌ Syntax error:', error.message);
            
            // Try to identify the problem area
            const lines = cleanPlayFunction.split('\n');
            lines.forEach((line, index) => {
                if (line.includes(')') && !line.includes('(')) {
                    console.log(`Suspicious line ${index + 1}: ${line}`);
                }
            });
        }
    }
} else {
    console.log('WithAnimation story not found');
}