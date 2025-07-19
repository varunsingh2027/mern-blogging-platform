#!/bin/bash

# MERN Blog Platform Deployment Script
# This script helps deploy the application to production

set -e

echo "🚀 Starting MERN Blog Platform Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_warning ".env.production file not found. Creating from template..."
    cp .env.production.example .env.production
    print_warning "Please edit .env.production with your actual production values before running this script again."
    exit 1
fi

print_status "Environment file found ✓"

# Load environment variables
set -a
source .env.production
set +a

print_status "Environment variables loaded ✓"

# Validate required environment variables
required_vars=("MONGO_ROOT_USERNAME" "MONGO_ROOT_PASSWORD" "JWT_SECRET" "CLOUDINARY_CLOUD_NAME")

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set in .env.production"
        exit 1
    fi
done

print_status "Environment variables validated ✓"

# Build and deploy with Docker Compose
print_status "Building Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache

print_status "Starting services..."
docker-compose -f docker-compose.prod.yml up -d

print_status "Waiting for services to be ready..."
sleep 30

# Check if services are running
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    print_status "✅ Deployment successful!"
    print_status "Your blog platform is now running at:"
    print_status "Frontend: http://localhost (or your configured domain)"
    print_status "API: http://localhost/api (or your configured domain)"
    print_status ""
    print_status "To view logs: docker-compose -f docker-compose.prod.yml logs -f"
    print_status "To stop services: docker-compose -f docker-compose.prod.yml down"
else
    print_error "❌ Deployment failed! Check the logs:"
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi
