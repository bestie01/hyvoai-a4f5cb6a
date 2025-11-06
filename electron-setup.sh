#!/bin/bash

# Hyvo Stream Studio - Desktop App Setup Script
# This script automates the Electron desktop app setup process

echo "🚀 Hyvo Stream Studio - Desktop Setup"
echo "======================================"
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

echo "✅ Node.js detected: $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Add Electron platform if not exists
if [ ! -d "electron" ]; then
    echo "🔧 Adding Electron platform..."
    npx cap add electron
else
    echo "✅ Electron platform already exists"
fi

# Build web assets
echo "🏗️  Building web assets..."
npm run build

# Sync to Electron
echo "🔄 Syncing to Electron..."
npx cap sync electron

# Navigate to electron directory
cd electron

# Install electron dependencies
echo "📦 Installing Electron dependencies..."
npm install

# Install electron-builder
echo "📦 Installing electron-builder..."
npm install --save-dev electron-builder

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. To run in development: cd electron && npm start"
echo "2. To build Windows: cd electron && npm run build:win"
echo "3. To build macOS: cd electron && npm run build:mac"
echo "4. To build Linux: cd electron && npm run build:linux"
echo ""
echo "📖 See BUILD_RELEASE.md for detailed build instructions"
