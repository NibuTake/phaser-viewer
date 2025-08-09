# Phaser Viewer Development Environment Management

.PHONY: help build pack install-latest test-latest dev-latest clean setup-env

# Default target
help:
	@echo "Phaser Viewer Development Commands"
	@echo "=================================="
	@echo ""
	@echo "Build & Package:"
	@echo "  build        Build the library for distribution"
	@echo "  pack         Create npm package (.tgz)"
	@echo ""
	@echo "Environment Management:"
	@echo "  setup-env    Set up test environment (build + install)"
	@echo "  install-latest Install package in latest test environment"
	@echo ""
	@echo "Testing Latest:"
	@echo "  test-latest  Run automated tests in latest environment"
	@echo "  dev-latest   Start development server in latest environment"
	@echo ""
	@echo "Maintenance:"
	@echo "  clean        Clean up generated files and test environments"
	@echo ""
	@echo "Examples:"
	@echo "  make setup-env    # Build and install in test environment"
	@echo "  make dev-latest   # Start development server"
	@echo "  make test-latest  # Run tests"

# Build the library
build:
	@echo "🔨 Building phaser-viewer library..."
	npm run build:lib

# Create npm package
pack: build
	@echo "📦 Creating npm package..."
	npm pack

# Install package in latest test environment
install-latest: pack
	@echo "📥 Installing in latest test environment..."
	cd test-envs/latest && npm install ../../phaser-viewer-0.1.9.tgz

# Set up complete test environment
setup-env: install-latest
	@echo "✅ Test environment latest is ready!"
	@echo ""
	@echo "Available commands:"
	@echo "  make dev-latest    - Start development server"
	@echo "  make test-latest   - Run automated tests"

# Run tests in latest environment
test-latest:
	@echo "🧪 Running tests in latest environment..."
	cd test-envs/latest && npm run test

# Start development server in latest environment
dev-latest:
	@echo "🚀 Starting phaser-viewer latest development server..."
	@echo "Press Ctrl+C to stop the server"
	cd test-envs/latest && npm run phaser-viewer

# Quick development cycle: build, install, and start server
quick-dev: setup-env dev-latest

# Clean up generated files
clean:
	@echo "🧹 Cleaning up..."
	rm -f phaser-viewer-*.tgz
	rm -rf test-envs/*/node_modules
	rm -rf test-envs/*/package-lock.json
	rm -rf test-envs/*/.phaser-viewer-temp
	@echo "✅ Cleanup complete"

# Development workflow helpers
rebuild: clean setup-env
	@echo "🔄 Rebuild complete - environment is ready!"

# Show current package info
info:
	@echo "Current package version: $(shell grep '"version"' package.json | cut -d'"' -f4)"
	@echo "Available test environments:"
	@ls -la test-envs/ | grep ^d | awk '{print "  " $$9}' | grep -v "^  \..*"