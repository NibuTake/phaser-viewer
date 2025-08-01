// Test the generated JavaScript code from the extension
const fs = require('fs');
const path = require('path');

// Load the compiled extension
const extensionPath = './out/extension.js';
const extension = require(extensionPath);

// Mock vscode objects we need
const mockVscode = {
    workspace: {
        getConfiguration: () => ({
            get: (key, defaultValue) => defaultValue
        })
    }
};

// Mock story objects
const mockParentStory = {
    name: 'Button',
    componentImports: null // Will use fallback Button class
};

const mockStory = {
    name: 'Animation Demo',
    args: {
        x: 400,
        y: 300,
        text: 'Animated!',
        config: {
            color: 0xFF6B35
        }
    },
    create: "(scene, args) => {\n        const button = new Button(scene, args.x, args.y, args.text, args.config);\n        \n        button.on('pointerdown', () => {\n            console.log('Animated button clicked!');\n        });\n        \n        return button;\n    }",
    play: "(scene, component) => {\n        console.log('[Play] Starting animation demo for button:', component);\n        \n        // 1秒後にボタンを少し拡大\n        scene.time.delayedCall(1000, () => {\n            scene.tweens.add({\n                targets: component,\n                scaleX: 1.2,\n                scaleY: 1.2,\n                duration: 500,\n                ease: 'Back.easeOut',\n                yoyo: true\n            });\n        });\n        \n        // 3秒後に色を変える\n        scene.time.delayedCall(3000, () => {\n            component.setColor(0x9B59B6);\n            \n            // パルスアニメーション\n            scene.tweens.add({\n                targets: component,\n                alpha: 0.5,\n                duration: 300,\n                yoyo: true,\n                repeat: 2\n            });\n        });\n        \n        // 5秒後にテキストを変更\n        scene.time.delayedCall(5000, () => {\n            component.setText('Complete!');\n            \n            // 回転アニメーション\n            scene.tweens.add({\n                targets: component,\n                rotation: Math.PI * 2,\n                duration: 1000,\n                ease: 'Power2.easeInOut'\n            });\n        });\n    }"
};

// Try to access the generateStorybookPreviewCode function
// Since it's not exported, we need to read the source and test it
console.log('Testing play function syntax...');

// Test the play function directly
try {
    const playFunc = eval(`(${mockStory.play})`);
    console.log('✅ Play function syntax is valid!');
    
    // Test that it has the right structure
    if (typeof playFunc === 'function') {
        console.log('✅ Play function is callable');
    } else {
        console.log('❌ Play function is not callable');
    }
} catch (error) {
    console.log('❌ Play function syntax error:', error.message);
}

// Test create function too for comparison
try {
    const createFunc = eval(`(${mockStory.create})`);
    console.log('✅ Create function syntax is valid!');
} catch (error) {
    console.log('❌ Create function syntax error:', error.message);
}

console.log('Test completed.');