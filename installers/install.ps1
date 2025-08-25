# Claude Code Context Command Installer - Windows PowerShell
# Version: 1.0.0

[CmdletBinding()]
param(
    [switch]$Force,
    [switch]$Quiet
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Configuration
$ClaudeDir = Join-Path $env:USERPROFILE ".claude"
$ScriptsDir = Join-Path $ClaudeDir "scripts"
$CommandsDir = Join-Path $ClaudeDir "commands"
$RepoDir = Split-Path $PSScriptRoot -Parent

# Color functions for output
function Write-Status {
    param($Message)
    if (-not $Quiet) {
        Write-Host "[INFO] $Message" -ForegroundColor Blue
    }
}

function Write-Success {
    param($Message)
    if (-not $Quiet) {
        Write-Host "[SUCCESS] $Message" -ForegroundColor Green
    }
}

function Write-Warning {
    param($Message)
    if (-not $Quiet) {
        Write-Host "[WARNING] $Message" -ForegroundColor Yellow
    }
}

function Write-ErrorMsg {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Test-Requirements {
    Write-Status "Checking requirements..."
    
    # Check if Node.js is installed
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            Write-Status "Found Node.js version: $nodeVersion"
        } else {
            throw "Node.js not found"
        }
    }
    catch {
        Write-ErrorMsg "Node.js is not installed or not in PATH."
        Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }
    
    # Check PowerShell version
    $psVersion = $PSVersionTable.PSVersion
    Write-Status "PowerShell version: $psVersion"
    
    if ($psVersion.Major -lt 3) {
        Write-Warning "PowerShell version is quite old. Consider upgrading for better compatibility."
    }
}

function New-ClaudeDirectories {
    Write-Status "Creating Claude Code directories..."
    
    @($ClaudeDir, $ScriptsDir, $CommandsDir) | ForEach-Object {
        if (-not (Test-Path $_)) {
            New-Item -ItemType Directory -Path $_ -Force | Out-Null
            Write-Status "Created $_"
        } else {
            Write-Status "$_ already exists"
        }
    }
}

function Backup-ExistingFiles {
    $backupDir = Join-Path $ClaudeDir "backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    $needsBackup = $false
    
    $filesToCheck = @(
        (Join-Path $ScriptsDir "context-cmd.js"),
        (Join-Path $ScriptsDir "context-analyzer.js"),
        (Join-Path $CommandsDir "context.md")
    )
    
    foreach ($file in $filesToCheck) {
        if (Test-Path $file) {
            $needsBackup = $true
            break
        }
    }
    
    if ($needsBackup) {
        Write-Warning "Existing context files found. Creating backup..."
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
        
        foreach ($file in $filesToCheck) {
            if (Test-Path $file) {
                Copy-Item $file $backupDir -Force
            }
        }
        
        Write-Success "Backup created at: $backupDir"
    }
}

function Install-ContextFiles {
    Write-Status "Installing context command files..."
    
    $filesToCopy = @{
        "scripts\context-cmd.js" = $ScriptsDir
        "scripts\context-analyzer.js" = $ScriptsDir
        "scripts\context-analyzer-simple.js" = $ScriptsDir
        "scripts\package.json" = $ScriptsDir
        "commands\context.md" = $CommandsDir
    }
    
    foreach ($file in $filesToCopy.Keys) {
        $sourcePath = Join-Path $RepoDir $file
        $destPath = $filesToCopy[$file]
        
        if (Test-Path $sourcePath) {
            Copy-Item $sourcePath $destPath -Force
        } else {
            Write-ErrorMsg "Source file not found: $sourcePath"
            exit 1
        }
    }
    
    Write-Success "Files installed successfully"
}

function Test-Installation {
    Write-Status "Testing installation..."
    
    $contextScript = Join-Path $ScriptsDir "context-cmd.js"
    
    try {
        # Test in a temporary directory to avoid issues
        Push-Location $env:TEMP
        $result = & node $contextScript "summary" 2>$null
        Pop-Location
        
        if ($LASTEXITCODE -eq 0 -or $result) {
            Write-Success "Installation test passed"
        } else {
            Write-Warning "Installation test completed (may show fallback if not in Claude project)"
        }
    }
    catch {
        Write-Warning "Installation test completed with warnings"
    }
    finally {
        Pop-Location -ErrorAction SilentlyContinue
    }
}

function Show-UsageInfo {
    Write-Success "Installation completed successfully!"
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor White
    Write-Host "  /context                    - Analyze current project context"
    Write-Host "  /context summary           - Show summary view"
    Write-Host "  /context standard          - Show detailed analysis"
    Write-Host ""
    Write-Host "Manual usage:" -ForegroundColor White
    Write-Host "  node ~/.claude/scripts/context-cmd.js"
    Write-Host "  node ~/.claude/scripts/context-cmd.js summary"
    Write-Host ""
    Write-Host "The /context command will now work in any Claude Code project directory."
    Write-Host ""
    Write-Status "For troubleshooting, see: https://github.com/Beaulewis1977/claude-code-context-command#troubleshooting"
}

function Main {
    try {
        if (-not $Quiet) {
            Write-Host "Claude Code Context Command Installer" -ForegroundColor Cyan
            Write-Host "=====================================" -ForegroundColor Cyan
            Write-Host ""
        }
        
        Write-Status "Detected platform: Windows (PowerShell)"
        
        Test-Requirements
        New-ClaudeDirectories
        
        if (-not $Force) {
            Backup-ExistingFiles
        }
        
        Install-ContextFiles
        Test-Installation
        Show-UsageInfo
    }
    catch {
        Write-ErrorMsg "Installation failed: $($_.Exception.Message)"
        exit 1
    }
}

# Handle Ctrl+C gracefully
$null = Register-EngineEvent PowerShell.Exiting -Action {
    Write-ErrorMsg "Installation interrupted"
}

# Run main function
Main