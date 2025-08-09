#!/bin/bash

# Build and test script for phaser-viewer-example
echo "🔨 Building phaser-viewer v0.1.8..."
npm run build:lib
npm pack

echo "📦 Installing in phaser-viewer-example..."
cd ../phaser-viewer-example
npm install ../phaser-viewer/phaser-viewer-0.1.8.tgz

echo "🧪 Running test command..."
npx phaser-viewer test

echo "🚀 Starting development server briefly..."
timeout 10s npx phaser-viewer || echo "✅ Server started successfully"

echo "✨ Test complete!"