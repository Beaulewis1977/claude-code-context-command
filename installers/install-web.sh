#!/bin/bash

# Claude Code Context Command - Web Installer
# One-liner installation script for curl/wget usage
# Usage: curl -sSL https://raw.githubusercontent.com/Beaulewis1977/claude-code-context-command/main/installers/install-web.sh | bash

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
GITHUB_REPO="Beaulewis1977/claude-code-context-command"
BRANCH="main"
CLAUDE_DIR="$HOME/.claude"
SCRIPTS_DIR="$CLAUDE_DIR/scripts"
COMMANDS_DIR="$CLAUDE_DIR/commands"
TEMP_DIR=$(mktemp -d)

# Cleanup function
cleanup() {
    if [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
    fi
}
trap cleanup EXIT

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

detect_download_tool() {
    if command -v curl &> /dev/null; then
        echo "curl"
    elif command -v wget &> /dev/null; then
        echo "wget"
    else
        print_error "Neither curl nor wget is available. Please install one of them."
        exit 1
    fi
}

download_file() {
    local url="$1"
    local output="$2"
    local tool="$3"
    
    case "$tool" in
        curl)
            curl -sSL "$url" -o "$output"
            ;;
        wget)
            wget -q "$url" -O "$output"
            ;;
        *)
            print_error "Unknown download tool: $tool"
            return 1
            ;;
    esac
}

check_requirements() {
    print_status "Checking requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        echo "Visit: https://nodejs.org/"
        exit 1
    fi
    
    local node_version
    node_version=$(node --version | cut -d'v' -f2)
    print_status "Found Node.js version: $node_version"
}

download_files() {
    print_status "Downloading files from GitHub..."
    
    local download_tool
    download_tool=$(detect_download_tool)
    print_status "Using $download_tool for downloads"
    
    local base_url="https://raw.githubusercontent.com/$GITHUB_REPO/$BRANCH"
    
    # Download all required files
    local files=(
        "scripts/context-cmd.js"
        "scripts/context-analyzer.js"
        "scripts/context-analyzer-simple.js"
        "scripts/package.json"
        "commands/context.md"
    )
    
    for file in "${files[@]}"; do
        local url="$base_url/$file"
        local local_file="$TEMP_DIR/$(basename "$file")"
        
        if download_file "$url" "$local_file" "$download_tool"; then
            print_status "Downloaded $(basename "$file")"
        else
            print_error "Failed to download $file"
            exit 1
        fi
    done
    
    print_success "All files downloaded successfully"
}

create_directories() {
    print_status "Creating Claude Code directories..."
    
    mkdir -p "$SCRIPTS_DIR"
    mkdir -p "$COMMANDS_DIR"
    
    print_success "Directories created"
}

backup_existing_files() {
    local backup_dir="$CLAUDE_DIR/backup-$(date +%Y%m%d-%H%M%S)"
    local needs_backup=false
    
    if [ -f "$SCRIPTS_DIR/context-cmd.js" ] || [ -f "$COMMANDS_DIR/context.md" ]; then
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
    
    # Install scripts
    cp "$TEMP_DIR/context-cmd.js" "$SCRIPTS_DIR/"
    cp "$TEMP_DIR/context-analyzer.js" "$SCRIPTS_DIR/"
    cp "$TEMP_DIR/context-analyzer-simple.js" "$SCRIPTS_DIR/"
    cp "$TEMP_DIR/package.json" "$SCRIPTS_DIR/"
    
    # Install command
    cp "$TEMP_DIR/context.md" "$COMMANDS_DIR/"
    
    # Set permissions
    chmod +x "$SCRIPTS_DIR/context-cmd.js"
    chmod +x "$SCRIPTS_DIR/context-analyzer.js"
    chmod +x "$SCRIPTS_DIR/context-analyzer-simple.js"
    
    print_success "Files installed successfully"
}

test_installation() {
    print_status "Testing installation..."
    
    if cd /tmp && timeout 10s node "$SCRIPTS_DIR/context-cmd.js" summary 2>/dev/null >/dev/null; then
        print_success "Installation test passed"
    else
        print_warning "Installation test completed (may show fallback if not in Claude project)"
    fi
}

show_completion_message() {
    echo
    print_success "Claude Code Context Command installed successfully!"
    echo
    echo "Usage:"
    echo "  /context                    - Analyze current project context"
    echo "  /context summary           - Show summary view" 
    echo "  /context standard          - Show detailed analysis"
    echo
    echo "Manual usage:"
    echo "  node ~/.claude/scripts/context-cmd.js"
    echo
    echo "The /context command will now work in any Claude Code project directory."
    echo
    print_status "Repository: https://github.com/$GITHUB_REPO"
    print_status "Documentation: https://github.com/$GITHUB_REPO#readme"
}

main() {
    echo "Claude Code Context Command - Web Installer"
    echo "==========================================="
    echo
    
    check_requirements
    download_files
    create_directories
    backup_existing_files
    install_files
    test_installation
    show_completion_message
}

# Handle interruption
trap 'print_error "Installation interrupted"; cleanup; exit 1' INT TERM

# Run main installation
main "$@"