#!/bin/bash

echo "🎊 Indian Wedding Invitation System - Setup Script"
echo "=================================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!"
    echo "Please create .env.local file with your configuration"
    echo "See README.md for details"
    exit 1
fi

echo "✓ Found .env.local"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✓ Dependencies installed"
echo ""

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

echo "✓ Prisma client generated"
echo ""

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure PostgreSQL is running (or start with: docker-compose up postgres -d)"
echo "2. Push database schema: npx prisma db push"
echo "3. Start development server: npm run dev"
echo ""
echo "Or use Docker Compose to start everything:"
echo "  docker-compose up"
echo ""
echo "Then visit: http://localhost:3000"
echo ""
