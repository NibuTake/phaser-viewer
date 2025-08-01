// Test just the JavaScript syntax of the play function
console.log('Testing play function syntax...');

// This is what the extension generates after cleaning the TypeScript
const cleanedPlayFunction = `(scene, component) => {
        console.log('[Play] Starting animation demo for button:', component);
        
        // 1秒後にボタンを少し拡大
        scene.time.delayedCall(1000, () => {
            scene.tweens.add({
                targets: component,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 500,
                ease: 'Back.easeOut',
                yoyo: true
            });
        });
        
        // 3秒後に色を変える
        scene.time.delayedCall(3000, () => {
            component.setColor(0x9B59B6);
            
            // パルスアニメーション
            scene.tweens.add({
                targets: component,
                alpha: 0.5,
                duration: 300,
                yoyo: true,
                repeat: 2
            });
        });
        
        // 5秒後にテキストを変更
        scene.time.delayedCall(5000, () => {
            component.setText('Complete!');
            
            // 回転アニメーション
            scene.tweens.add({
                targets: component,
                rotation: Math.PI * 2,
                duration: 1000,
                ease: 'Power2.easeInOut'
            });
        });
    }`;

try {
    // Test syntax by wrapping in a function
    const testCode = `function test() { var playFunc = ${cleanedPlayFunction}; }`;
    eval(testCode);
    console.log('✅ Play function syntax is valid!');
    
    // Also test that it can be assigned
    const playFunc = eval(`(${cleanedPlayFunction})`);
    if (typeof playFunc === 'function') {
        console.log('✅ Play function is executable');
    }
} catch (error) {
    console.log('❌ Play function syntax error:', error.message);
    
    // Try to identify the problem
    const lines = cleanedPlayFunction.split('\n');
    lines.forEach((line, index) => {
        if (line.includes(')') && !line.includes('(') && !line.includes('=>')) {
            console.log(`Suspicious line ${index + 1}: ${line.trim()}`);
        }
    });
}

console.log('Test completed.');