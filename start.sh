#!/bin/bash

# AI Onboarding Flow Creator - Start Script
# This script sets up and starts the application

set -e

# IMMEDIATELY kill any processes on ports 3000 and 3001
kill -9 $(lsof -ti:3000) 2>/dev/null || true
kill -9 $(lsof -ti:3001) 2>/dev/null || true
sleep 1
kill -9 $(lsof -ti:3000) 2>/dev/null || true
kill -9 $(lsof -ti:3001) 2>/dev/null || true

echo "=================================================="
echo "   AI Onboarding Flow Creator - Setup & Start"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Function to kill processes on specific ports
cleanup_ports() {
    print_status "Cleaning up ports 3000 and 3001..."

    # Kill process on port 3000 (frontend)
    PIDS_3000=$(lsof -ti:3000 2>/dev/null) || true
    if [ -n "$PIDS_3000" ]; then
        print_warning "Killing existing process(es) on port 3000: $PIDS_3000"
        echo "$PIDS_3000" | xargs kill -9 2>/dev/null || true
    fi

    # Kill process on port 3001 (backend)
    PIDS_3001=$(lsof -ti:3001 2>/dev/null) || true
    if [ -n "$PIDS_3001" ]; then
        print_warning "Killing existing process(es) on port 3001: $PIDS_3001"
        echo "$PIDS_3001" | xargs kill -9 2>/dev/null || true
    fi

    # Double-check and force kill again if needed
    sleep 1
    lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null || true
    lsof -ti:3001 2>/dev/null | xargs kill -9 2>/dev/null || true

    sleep 1
    print_success "Ports cleaned up"
}

# Function to check if PostgreSQL is running
check_postgres() {
    print_status "Checking PostgreSQL..."

    if command -v pg_isready > /dev/null 2>&1; then
        if pg_isready -q; then
            print_success "PostgreSQL is running"
            return 0
        fi
    fi

    # Try to start PostgreSQL if not running
    if command -v brew > /dev/null 2>&1; then
        print_warning "Attempting to start PostgreSQL via Homebrew..."
        brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
        sleep 2
    fi

    # Check again
    if pg_isready -q 2>/dev/null; then
        print_success "PostgreSQL is now running"
        return 0
    else
        print_error "PostgreSQL is not running. Please start it manually."
        print_status "Try: brew services start postgresql"
        return 1
    fi
}

# Function to create database if it doesn't exist
setup_database() {
    print_status "Setting up database..."

    # Source .env file
    if [ -f .env ]; then
        export $(grep -v '^#' .env | xargs)
    fi

    DB_NAME=${DB_NAME:-onboarding_flow_db}
    DB_USER=${DB_USER:-postgres}

    # Check if database exists, create if not
    if psql -U "$DB_USER" -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        print_success "Database '$DB_NAME' already exists"
    else
        print_status "Creating database '$DB_NAME'..."
        createdb -U "$DB_USER" "$DB_NAME" 2>/dev/null || psql -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || true
        print_success "Database created"
    fi
}

# Function to update code from git
update_code() {
    print_status "Checking for code updates..."

    cd "$SCRIPT_DIR"

    # Check if this is a git repository
    if [ -d ".git" ]; then
        print_status "Pulling latest code from git..."
        git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || git pull 2>/dev/null || true
        print_success "Code updated from git"
    else
        print_warning "Not a git repository, skipping git pull"
    fi

    cd "$SCRIPT_DIR"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing backend dependencies..."
    cd "$SCRIPT_DIR/backend"
    npm install
    print_success "Backend dependencies installed"

    print_status "Installing frontend dependencies..."
    cd "$SCRIPT_DIR/frontend"
    npm install
    print_success "Frontend dependencies installed"

    cd "$SCRIPT_DIR"
}

# Function to seed the database
seed_database() {
    print_status "Seeding database with sample data (15+ items per feature)..."
    cd "$SCRIPT_DIR/backend"
    npm run seed
    print_success "Database seeded successfully"
    cd "$SCRIPT_DIR"
}

# Function to start the application
start_application() {
    print_status "Starting the application with hot reload..."

    # Start backend with nodemon for hot reload
    print_status "Starting backend server on port 3001 (with hot reload via nodemon)..."
    cd "$SCRIPT_DIR/backend"
    PORT=3001 npm run dev &
    BACKEND_PID=$!

    # Wait for backend to be ready
    sleep 3

    # Start frontend with explicit port and no prompts (React dev server has hot reload built-in)
    print_status "Starting frontend on port 3000 (with hot reload)..."
    cd "$SCRIPT_DIR/frontend"
    PORT=3000 BROWSER=none npm start &
    FRONTEND_PID=$!

    cd "$SCRIPT_DIR"

    echo ""
    echo "=================================================="
    print_success "Application started successfully!"
    echo "=================================================="
    echo ""
    echo -e "${GREEN}Frontend:${NC} http://localhost:3000"
    echo -e "${GREEN}Backend API:${NC} http://localhost:3001/api"
    echo ""
    echo -e "${BLUE}Hot Reload:${NC} Enabled for both frontend and backend"
    echo "  - Backend uses nodemon (auto-restarts on .js file changes)"
    echo "  - Frontend uses React dev server (auto-refreshes on changes)"
    echo ""
    echo -e "${YELLOW}Demo Credentials:${NC}"
    echo "  Email: demo@onboardflow.com"
    echo "  Password: password123"
    echo ""
    echo -e "${YELLOW}Or click 'Use Demo Credentials' button on login page${NC}"
    echo ""
    echo "Press Ctrl+C to stop the application"
    echo "=================================================="

    # Wait for both processes
    wait $BACKEND_PID $FRONTEND_PID
}

# Function to handle cleanup on exit
cleanup() {
    print_status "Shutting down..."
    cleanup_ports
    print_success "Application stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    echo ""

    # Step 1: Clean up ports
    cleanup_ports

    # Step 2: Update code from git
    update_code

    # Step 3: Check PostgreSQL
    if ! check_postgres; then
        exit 1
    fi

    # Step 4: Setup database
    setup_database

    # Step 5: Install dependencies
    install_dependencies

    # Step 6: Seed database
    seed_database

    # Step 7: Start application
    start_application
}

# Run main function
main
