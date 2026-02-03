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

# Install dependencies with legacy peer deps to avoid conflicts
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Build web assets
echo "🏗️  Building web assets..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Failed to build web assets"
    exit 1
fi

# Prepare Electron directory
echo "📁 Preparing Electron directory..."

# Create electron/app directory if it doesn't exist
mkdir -p electron/app
mkdir -p electron/app/icons

# Copy built files to Electron app directory
cp -r dist/* electron/app/

# Copy app icon if it exists
if [ -f "public/app-icon-1024.png" ]; then
    cp public/app-icon-1024.png electron/app/icons/appIcon.png
elif [ -f "public/hyvo-logo.png" ]; then
    cp public/hyvo-logo.png electron/app/icons/appIcon.png
fi

echo "✅ Web build copied to electron/app"

# Navigate to electron directory
cd electron

# Install electron dependencies
echo "📦 Installing Electron dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Electron dependencies"
    exit 1
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. To run in development: cd electron && npm start"
echo "2. To build Windows:      cd electron && npm run build:win"
echo "3. To build macOS:        cd electron && npm run build:mac"
echo "4. To build Linux:        cd electron && npm run build:linux"
echo "5. To build all:          cd electron && npm run build:all"
echo ""
echo "📖 See QUICK_START_DESKTOP.md for detailed build instructions"
