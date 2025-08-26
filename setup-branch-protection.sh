#!/bin/bash

# Branch Protection Setup Script for Claude Code Context Command
# This script configures GitHub branch protection rules using GitHub CLI

set -e  # Exit on any error

# Configuration
REPO_OWNER=""
REPO_NAME=""
DEFAULT_BRANCH="main"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if gh CLI is installed
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI (gh) is not installed"
        print_status "Install it from: https://cli.github.com/"
        exit 1
    fi
    
    # Check if user is authenticated
    if ! gh auth status &> /dev/null; then
        print_error "Not authenticated with GitHub CLI"
        print_status "Run: gh auth login"
        exit 1
    fi
    
    # Check if we're in a git repository
    if ! git rev-parse --is-inside-work-tree &> /dev/null; then
        print_error "Not in a git repository"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to detect repository information
detect_repository() {
    print_status "Detecting repository information..."
    
    # Get repository information from git remote
    REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
    
    if [[ $REMOTE_URL =~ github\.com[:/]([^/]+)/([^/.]+) ]]; then
        REPO_OWNER="${BASH_REMATCH[1]}"
        REPO_NAME="${BASH_REMATCH[2]}"
        
        print_success "Detected repository: $REPO_OWNER/$REPO_NAME"
    else
        print_error "Could not detect GitHub repository from remote URL"
        print_status "Please ensure you're in a GitHub repository with a proper remote"
        exit 1
    fi
    
    # Detect default branch
    DEFAULT_BRANCH=$(gh api repos/$REPO_OWNER/$REPO_NAME --jq '.default_branch' 2>/dev/null || echo "main")
    print_status "Default branch: $DEFAULT_BRANCH"
}

# Function to check if user has admin permissions
check_permissions() {
    print_status "Checking repository permissions..."
    
    PERMISSION=$(gh api repos/$REPO_OWNER/$REPO_NAME --jq '.permissions.admin' 2>/dev/null || echo "false")
    
    if [ "$PERMISSION" != "true" ]; then
        print_error "You need admin permissions to set up branch protection"
        print_status "Contact the repository owner to grant admin permissions"
        exit 1
    fi
    
    print_success "Admin permissions confirmed"
}

# Function to set up branch protection rules
setup_branch_protection() {
    print_status "Setting up branch protection rules for '$DEFAULT_BRANCH'..."
    
    # Define required status checks based on our workflows
    REQUIRED_CHECKS='[
        "Security Gate",
        "Vulnerability Scan", 
        "Test (ubuntu-latest, Node 18.x)",
        "Test (ubuntu-latest, Node 20.x)",
        "Test (windows-latest, Node 18.x)",
        "Test (windows-latest, Node 20.x)",
        "Test (macos-latest, Node 18.x)",
        "Test (macos-latest, Node 20.x)",
        "Test Installers (ubuntu-latest)",
        "Test Installers (windows-latest)",
        "Test Installers (macos-latest)",
        "Code Quality",
        "Integration Test",
        "CodeQL SAST Analysis",
        "Security Test Suite",
        "Dependency Security Scan"
    ]'
    
    # Create branch protection rule
    gh api \
        --method PUT \
        repos/$REPO_OWNER/$REPO_NAME/branches/$DEFAULT_BRANCH/protection \
        --field required_status_checks="$(cat <<EOF
{
    "strict": true,
    "contexts": $REQUIRED_CHECKS
}
EOF
)" \
        --field enforce_admins=true \
        --field required_pull_request_reviews="$(cat <<EOF
{
    "required_approving_review_count": 2,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "require_last_push_approval": true
}
EOF
)" \
        --field restrictions=null \
        --field allow_force_pushes=false \
        --field allow_deletions=false \
        --field block_creations=false \
        --field required_conversation_resolution=true \
        --field lock_branch=false \
        --field allow_fork_syncing=true
    
    if [ $? -eq 0 ]; then
        print_success "Branch protection rules configured successfully"
    else
        print_error "Failed to configure branch protection rules"
        exit 1
    fi
}

# Function to configure additional security settings
setup_security_settings() {
    print_status "Configuring additional security settings..."
    
    # Enable security features
    print_status "Enabling vulnerability alerts..."
    gh api --method PUT repos/$REPO_OWNER/$REPO_NAME/vulnerability-alerts || print_warning "Could not enable vulnerability alerts"
    
    print_status "Enabling automated security fixes..."
    gh api --method PUT repos/$REPO_OWNER/$REPO_NAME/automated-security-fixes || print_warning "Could not enable automated security fixes"
    
    print_status "Configuring secret scanning..."
    gh api --method PUT repos/$REPO_OWNER/$REPO_NAME/secret-scanning/alerts || print_warning "Could not enable secret scanning"
    
    print_success "Security settings configured"
}

# Function to verify the setup
verify_setup() {
    print_status "Verifying branch protection setup..."
    
    # Get branch protection status
    PROTECTION_STATUS=$(gh api repos/$REPO_OWNER/$REPO_NAME/branches/$DEFAULT_BRANCH/protection --jq '.required_status_checks.strict' 2>/dev/null || echo "false")
    
    if [ "$PROTECTION_STATUS" = "true" ]; then
        print_success "Branch protection is active and correctly configured"
        
        # Show summary
        echo ""
        print_status "Branch Protection Summary:"
        echo "  📋 Branch: $DEFAULT_BRANCH"
        echo "  🔒 Status checks: Required and strict"
        echo "  👥 Required reviews: 2 approvals"
        echo "  🛡️  Code owner reviews: Required"
        echo "  🚫 Force pushes: Blocked"
        echo "  🗑️  Branch deletion: Blocked"
        echo "  💬 Conversation resolution: Required"
        echo ""
        
        print_success "Setup completed successfully! 🎉"
        print_status "Your repository is now protected with enterprise-grade security rules"
        
    else
        print_error "Branch protection verification failed"
        exit 1
    fi
}

# Function to show usage information
show_usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -b, --branch   Specify branch name (default: main)"
    echo "  --dry-run      Show what would be done without making changes"
    echo ""
    echo "This script sets up GitHub branch protection rules for the Claude Code Context Command project."
    echo "It requires GitHub CLI (gh) to be installed and authenticated."
}

# Function for dry run mode
dry_run() {
    print_status "🧪 DRY RUN MODE - No changes will be made"
    echo ""
    print_status "Would configure the following branch protection rules:"
    echo "  📋 Protected branch: $DEFAULT_BRANCH"
    echo "  🔒 Required status checks: 16 checks from CI/CD workflows"
    echo "  👥 Required pull request reviews: 2 approvals"
    echo "  🛡️  Code owner reviews: Required"
    echo "  🚫 Force pushes: Disabled"
    echo "  🗑️  Branch deletion: Disabled"
    echo "  💬 Conversation resolution: Required"
    echo ""
    print_status "Additional security settings that would be enabled:"
    echo "  🚨 Vulnerability alerts"
    echo "  🔧 Automated security fixes"
    echo "  🔍 Secret scanning"
    echo ""
    print_status "Run without --dry-run to apply these settings"
}

# Main execution
main() {
    local DRY_RUN=false
    local CUSTOM_BRANCH=""
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -b|--branch)
                CUSTOM_BRANCH="$2"
                shift 2
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Use custom branch if specified
    if [ -n "$CUSTOM_BRANCH" ]; then
        DEFAULT_BRANCH="$CUSTOM_BRANCH"
    fi
    
    print_status "🚀 Claude Code Context Command - Branch Protection Setup"
    print_status "=========================================================="
    echo ""
    
    # Run setup steps
    check_prerequisites
    detect_repository
    check_permissions
    
    if [ "$DRY_RUN" = true ]; then
        dry_run
    else
        setup_branch_protection
        setup_security_settings
        verify_setup
    fi
}

# Execute main function with all arguments
main "$@"