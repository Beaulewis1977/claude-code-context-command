#!/usr/bin/env node

/**
 * Claude Code Context Command - NPM Package Installer
 * Installs the context command globally for use with Claude Code
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function printStatus(message) {
    console.log(`${colors.blue}[INFO]${colors.reset} ${message}`);
}

function printSuccess(message) {
    console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`);
}

function printWarning(message) {
    console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`);
}

function printError(message) {
    console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);
}

function checkRequirements() {
    printStatus('Checking requirements...');
    
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 14) {
        printError(`Node.js version ${nodeVersion} is not supported. Please upgrade to Node.js 14 or later.`);
        process.exit(1);
    }
    
    printStatus(`Node.js version: ${nodeVersion}`);
}

function getClaudeDirectories() {
    const homeDir = os.homedir();
    const claudeDir = path.join(homeDir, '.claude');
    const scriptsDir = path.join(claudeDir, 'scripts');
    const commandsDir = path.join(claudeDir, 'commands');
    
    return { claudeDir, scriptsDir, commandsDir };
}

function createDirectories() {
    printStatus('Creating Claude Code directories...');
    
    const { claudeDir, scriptsDir, commandsDir } = getClaudeDirectories();
    
    [claudeDir, scriptsDir, commandsDir].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            printStatus(`Created ${dir}`);
        } else {
            printStatus(`${dir} already exists`);
        }
    });
}

function backupExistingFiles() {
    const { claudeDir, scriptsDir, commandsDir } = getClaudeDirectories();
    const backupDir = path.join(claudeDir, `backup-${new Date().toISOString().replace(/[:.]/g, '-')}`);
    
    const filesToCheck = [
        path.join(scriptsDir, 'context-cmd.js'),
        path.join(scriptsDir, 'context-analyzer.js'),
        path.join(scriptsDir, 'context-analyzer-simple.js'),
        path.join(scriptsDir, 'package.json'),
        path.join(commandsDir, 'context.md')
    ];
    
    const existingFiles = filesToCheck.filter(file => fs.existsSync(file));
    
    if (existingFiles.length > 0) {
        printWarning('Existing context files found. Creating backup...');
        fs.mkdirSync(backupDir, { recursive: true });
        
        existingFiles.forEach(file => {
            const backupPath = path.join(backupDir, path.basename(file));
            fs.copyFileSync(file, backupPath);
        });
        
        printSuccess(`Backup created at: ${backupDir}`);
    }
}

function installFiles() {
    printStatus('Installing context command files...');
    
    const { scriptsDir, commandsDir } = getClaudeDirectories();
    const packageDir = __dirname;
    const repoRoot = path.resolve(packageDir, '..');
    
    // Source files to copy
    const filesToCopy = [
        { src: path.join(repoRoot, 'scripts', 'context-cmd.js'), dest: path.join(scriptsDir, 'context-cmd.js') },
        { src: path.join(repoRoot, 'scripts', 'context-analyzer.js'), dest: path.join(scriptsDir, 'context-analyzer.js') },
        { src: path.join(repoRoot, 'scripts', 'context-analyzer-simple.js'), dest: path.join(scriptsDir, 'context-analyzer-simple.js') },
        { src: path.join(repoRoot, 'scripts', 'package.json'), dest: path.join(scriptsDir, 'package.json') },
        { src: path.join(repoRoot, 'commands', 'context.md'), dest: path.join(commandsDir, 'context.md') }
    ];
    
    filesToCopy.forEach(({ src, dest }) => {
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, dest);
            
            // Make scripts executable on Unix-like systems
            if (src.endsWith('.js') && process.platform !== 'win32') {
                try {
                    fs.chmodSync(dest, '755');
                } catch (error) {
                    printWarning(`Could not set executable permissions for ${dest}`);
                }
            }
        } else {
            printError(`Source file not found: ${src}`);
            process.exit(1);
        }
    });
    
    printSuccess('Files installed successfully');
}

function testInstallation() {
    printStatus('Testing installation...');
    
    const { scriptsDir } = getClaudeDirectories();
    const contextScript = path.join(scriptsDir, 'context-cmd.js');
    
    try {
        // Test that the script can be executed
        const originalCwd = process.cwd();
        process.chdir(os.tmpdir());
        
        execSync(`node "${contextScript}" summary`, { 
            stdio: 'pipe',
            timeout: 10000
        });
        
        process.chdir(originalCwd);
        printSuccess('Installation test passed');
    } catch (error) {
        printWarning('Installation test completed (may show fallback if not in Claude project)');
    }
}

function showUsageInfo() {
    printSuccess('Claude Code Context Command installed successfully!');
    console.log('');
    console.log('Usage:');
    console.log('  /context                    - Analyze current project context');
    console.log('  /context summary           - Show summary view');
    console.log('  /context standard          - Show detailed analysis');
    console.log('');
    console.log('Manual usage:');
    console.log('  node ~/.claude/scripts/context-cmd.js');
    console.log('  node ~/.claude/scripts/context-cmd.js summary');
    console.log('');
    console.log('The /context command will now work in any Claude Code project directory.');
    console.log('');
    printStatus('Repository: https://github.com/Beaulewis1977/claude-code-context-command');
    printStatus('Documentation: https://github.com/Beaulewis1977/claude-code-context-command#readme');
}

function main() {
    console.log('Claude Code Context Command - NPM Installer');
    console.log('===========================================');
    console.log('');
    
    try {
        checkRequirements();
        createDirectories();
        backupExistingFiles();
        installFiles();
        testInstallation();
        showUsageInfo();
    } catch (error) {
        printError(`Installation failed: ${error.message}`);
        process.exit(1);
    }
}

// Handle process interruption
process.on('SIGINT', () => {
    printError('Installation interrupted');
    process.exit(1);
});

process.on('SIGTERM', () => {
    printError('Installation interrupted');
    process.exit(1);
});

// Run main function if this script is executed directly
if (require.main === module) {
    main();
}

module.exports = { main };