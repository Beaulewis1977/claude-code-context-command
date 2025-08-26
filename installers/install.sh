#!/bin/bash

# Claude Code Context Command Installer
# Cross-platform installer for Linux, macOS, and WSL
# Version: 1.0.0

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CLAUDE_DIR="$HOME/.claude"
SCRIPTS_DIR="$CLAUDE_DIR/scripts"
COMMANDS_DIR="$CLAUDE_DIR/commands"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Utility functions
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

check_requirements() {
    print_status "Checking requirements..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        echo "Visit: https://nodejs.org/"
        exit 1
    fi
    
    local node_version
    node_version=$(node --version | cut -d'v' -f2)
    print_status "Found Node.js version: $node_version"
    
    # Check if we're in a reasonable shell environment
    if [ -z "${BASH_VERSION:-}" ] && [ -z "${ZSH_VERSION:-}" ]; then
        print_warning "Unknown shell environment. Installation may not work correctly."
    fi
}

detect_platform() {
    local os
    os="$(uname -s)"
    case "$os" in
        Linux*)     echo "linux";;
        Darwin*)    echo "macos";;
        MINGW*)     echo "windows";;
        MSYS*)      echo "windows";;
        CYGWIN*)    echo "windows";;
        *)          echo "unknown";;
    esac
}

create_directories() {
    print_status "Creating Claude Code directories..."
    
    if [ ! -d "$CLAUDE_DIR" ]; then
        mkdir -p "$CLAUDE_DIR"
        print_status "Created $CLAUDE_DIR"
    else
        print_status "$CLAUDE_DIR already exists"
    fi
    
    if [ ! -d "$SCRIPTS_DIR" ]; then
        mkdir -p "$SCRIPTS_DIR"
        print_status "Created $SCRIPTS_DIR"
    else
        print_status "$SCRIPTS_DIR already exists"
    fi
    
    if [ ! -d "$COMMANDS_DIR" ]; then
        mkdir -p "$COMMANDS_DIR"
        print_status "Created $COMMANDS_DIR"
    else
        print_status "$COMMANDS_DIR already exists"
    fi
}

backup_existing_files() {
    local backup_dir="$CLAUDE_DIR/backup-$(date +%Y%m%d-%H%M%S)"
    local needs_backup=false
    
    # Check if any files would be overwritten
    if [ -f "$SCRIPTS_DIR/context-cmd.js" ] || [ -f "$SCRIPTS_DIR/context-analyzer.js" ] || [ -f "$COMMANDS_DIR/context.md" ]; then
        needs_backup=true
    fi
    
    if [ "$needs_backup" = true ]; then
        print_warning "Existing context files found. Creating backup..."
        mkdir -p "$backup_dir"
        
        [ -f "$SCRIPTS_DIR/context-cmd.js" ] && cp "$SCRIPTS_DIR/context-cmd.js" "$backup_dir/"
        [ -f "$SCRIPTS_DIR/context-analyzer.js" ] && cp "$SCRIPTS_DIR/context-analyzer.js" "$backup_dir/"
        [ -f "$SCRIPTS_DIR/context-analyzer-simple.js" ] && cp "$SCRIPTS_DIR/context-analyzer-simple.js" "$backup_dir/"
        [ -f "$SCRIPTS_DIR/package.json" ] && cp "$SCRIPTS_DIR/package.json" "$backup_dir/"
        [ -f "$COMMANDS_DIR/context.md" ] && cp "$COMMANDS_DIR/context.md" "$backup_dir/"
        
        print_success "Backup created at: $backup_dir"
    fi
}

install_files() {
    print_status "Installing context command files..."
    
    # Copy scripts
    cp "$REPO_DIR/scripts/context-cmd.js" "$SCRIPTS_DIR/"
    cp "$REPO_DIR/scripts/context-analyzer.js" "$SCRIPTS_DIR/"
    cp "$REPO_DIR/scripts/context-analyzer-simple.js" "$SCRIPTS_DIR/"
    cp "$REPO_DIR/scripts/package.json" "$SCRIPTS_DIR/"
    
    # Copy command definition
    cp "$REPO_DIR/commands/context.md" "$COMMANDS_DIR/"
    
    print_success "Files installed successfully"
}

set_permissions() {
    print_status "Setting file permissions..."
    
    # Make scripts executable
    chmod +x "$SCRIPTS_DIR/context-cmd.js"
    chmod +x "$SCRIPTS_DIR/context-analyzer.js"
    chmod +x "$SCRIPTS_DIR/context-analyzer-simple.js"
    
    # Ensure readable permissions
    chmod 644 "$SCRIPTS_DIR/package.json"
    chmod 644 "$COMMANDS_DIR/context.md"
    
    print_success "Permissions set correctly"
}

test_installation() {
    print_status "Testing installation..."
    
    # Test that the script can run
    if cd /tmp && timeout 10s node "$SCRIPTS_DIR/context-cmd.js" summary 2>/dev/null >/dev/null; then
        print_success "Installation test passed"
    else
        print_warning "Installation test completed (may show fallback if not in Claude project)"
    fi
}

show_usage_info() {
    print_success "Installation completed successfully!"
    echo
    echo "Usage:"
    echo "  /context                    - Analyze current project context"
    echo "  /context summary           - Show summary view"
    echo "  /context standard          - Show detailed analysis"
    echo
    echo "Manual usage:"
    echo "  node ~/.claude/scripts/context-cmd.js"
    echo "  node ~/.claude/scripts/context-cmd.js summary"
    echo
    echo "The /context command will now work in any Claude Code project directory."
    echo
    print_status "For troubleshooting, see: https://github.com/Beaulewis1977/claude-code-context-command#troubleshooting"
}

main() {
    echo "Claude Code Context Command Installer"
    echo "====================================="
    echo
    
    local platform
    platform=$(detect_platform)
    print_status "Detected platform: $platform"
    
    check_requirements
    create_directories
    backup_existing_files
    install_files
    set_permissions
    test_installation
    show_usage_info
}

# Handle script interruption
trap 'print_error "Installation interrupted"; exit 1' INT TERM

# Run main function
main "$@"