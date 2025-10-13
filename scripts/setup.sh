#!/bin/bash

# AnonDocs Setup Script
set -e

echo "🚀 Setting up AnonDocs..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js 18+ is required. Current version: $(node -v)"
  exit 1
fi

echo "✅ Node.js version check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env exists
if [ ! -f .env ]; then
  echo "📝 Creating .env file from .env.example..."
  cp .env.example .env
  echo "⚠️  Please edit .env with your API keys and database configuration"
  echo "   Required: DATABASE_URL and at least one LLM provider API key"
else
  echo "✅ .env file already exists"
fi

# Start PostgreSQL with Docker if not running
if ! docker ps | grep -q anondocs-postgres; then
  echo "🐘 Starting PostgreSQL with Docker..."
  docker-compose up -d
  echo "⏳ Waiting for PostgreSQL to be ready..."
  sleep 5
else
  echo "✅ PostgreSQL is already running"
fi

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npm run prisma:generate

# Run migrations
echo "🗄️  Running database migrations..."
npm run prisma:migrate

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p uploads

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your API keys"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Access the API at http://localhost:3000"
echo ""
echo "For help, see README.md"

