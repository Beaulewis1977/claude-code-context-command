# Troubleshooting Guide

Common issues and solutions for the Claude Code Context Command.

## Installation Issues

### "Node.js not found" or "node: command not found"

**Problem:** Node.js is not installed or not in your PATH.

**Solutions:**

1. **Install Node.js:**
   - Download from [nodejs.org](https://nodejs.org/)
   - Choose LTS (Long Term Support) version
   - Restart your terminal after installation

2. **Verify installation:**
   ```bash
   node --version  # Should show v14.0.0 or later
   which node      # Should show path to node executable
   ```

3. **Fix PATH issues (Linux/macOS):**
   ```bash
   # Add to ~/.bashrc or ~/.zshrc
   export PATH="$PATH:/usr/local/bin"
   source ~/.bashrc  # Reload configuration
   ```

4. **Windows PATH issues:**
   - Search "Environment Variables" in Start Menu
   - Add Node.js installation directory to PATH
   - Restart Command Prompt/PowerShell

### "Permission denied" (Linux/macOS/WSL)

**Problem:** Scripts don't have execute permissions.

**Solutions:**

1. **Fix script permissions:**
   ```bash
   chmod +x ~/.claude/scripts/*.js
   ```

2. **Fix directory permissions:**
   ```bash
   chmod 755 ~/.claude
   chmod 755 ~/.claude/scripts
   chmod 755 ~/.claude/commands
   ```

3. **Check ownership:**
   ```bash
   ls -la ~/.claude/
   # Should be owned by your user
   
   # Fix ownership if needed:
   chown -R $USER:$USER ~/.claude/
   ```

### "Cannot create directory ~/.claude"

**Problem:** Directory creation fails due to permissions.

**Solutions:**

1. **Check parent directory permissions:**
   ```bash
   ls -la ~/
   # Home directory should be writable
   ```

2. **Create directory manually:**
   ```bash
   mkdir -p ~/.claude/scripts ~/.claude/commands
   ```

3. **Check disk space:**
   ```bash
   df -h ~/  # Make sure you have free space
   ```

### PowerShell Execution Policy (Windows)

**Problem:** "Execution of scripts is disabled on this system"

**Solutions:**

1. **Check current policy:**
   ```powershell
   Get-ExecutionPolicy
   ```

2. **Set policy to allow scripts:**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. **Alternative: Bypass for single execution:**
   ```powershell
   PowerShell.exe -ExecutionPolicy Bypass -File .\installers\install.ps1
   ```

### Git Clone Fails

**Problem:** Cannot clone repository.

**Solutions:**

1. **Use HTTPS instead of SSH:**
   ```bash
   git clone https://github.com/Beaulewis1977/claude-code-context-command.git
   ```

2. **Download as ZIP:**
   ```bash
   wget https://github.com/Beaulewis1977/claude-code-context-command/archive/main.zip
   unzip main.zip
   cd claude-code-context-command-main
   ```

3. **Check internet connection:**
   ```bash
   ping github.com
   ```

## Runtime Issues

### "No .claude directory found"

**Problem:** Command runs but shows this error message.

**Cause:** You're not in a Claude Code project directory.

**Solutions:**

1. **Navigate to a Claude Code project:**
   ```bash
   cd /path/to/your/claude/project
   ls -la .claude/  # Should show project configuration
   ```

2. **Verify you're in the right directory:**
   ```bash
   pwd  # Show current directory
   find . -name ".claude" -type d  # Find .claude directories
   ```

3. **Initialize a Claude Code project if needed:**
   - Create `.claude` directory in your project
   - Add basic configuration files

### "Analysis timeout" or Script Hangs

**Problem:** Analysis takes too long or appears to hang.

**Cause:** Large projects with many MCP servers can take time to analyze.

**Solutions:**

1. **Use summary mode for faster analysis:**
   ```bash
   node ~/.claude/scripts/context-cmd.js summary
   ```

2. **Check for stuck processes:**
   ```bash
   ps aux | grep context  # Linux/macOS
   tasklist | findstr node  # Windows
   ```

3. **Kill stuck processes:**
   ```bash
   pkill -f context-cmd  # Linux/macOS
   taskkill /f /im node.exe  # Windows (careful - kills all node processes)
   ```

4. **Clear cache and retry:**
   ```bash
   # Cache is stored in memory, so just wait 2-5 minutes or restart terminal
   ```

### "Cannot read property" or JavaScript Errors

**Problem:** Script crashes with JavaScript errors.

**Cause:** Corrupted files or incompatible Node.js version.

**Solutions:**

1. **Check Node.js version:**
   ```bash
   node --version  # Should be v14.0.0 or later
   ```

2. **Reinstall files:**
   ```bash
   # Remove existing files
   rm ~/.claude/scripts/context-*.js
   rm ~/.claude/commands/context.md
   
   # Reinstall
   cd claude-code-context-command
   ./installers/install.sh
   ```

3. **Test with simple Node.js script:**
   ```bash
   node -e "console.log('Node.js works')"
   ```

### "/context command not recognized" in Claude Code

**Problem:** Claude Code doesn't recognize the `/context` command.

**Cause:** Command file not in the correct location or Claude Code cache.

**Solutions:**

1. **Verify command file location:**
   ```bash
   ls -la ~/.claude/commands/context.md
   # File should exist and be readable
   ```

2. **Check file content:**
   ```bash
   head ~/.claude/commands/context.md
   # Should start with "# Context Usage Analysis"
   ```

3. **Restart Claude Code:**
   - Close and reopen Claude Code
   - Commands are loaded at startup

4. **Check Claude Code configuration:**
   ```bash
   ls -la ~/.claude/
   # Should contain commands/ and scripts/ directories
   ```

## Performance Issues

### Slow Analysis Performance

**Problem:** Context analysis takes a long time.

**Solutions:**

1. **Use the simple analyzer:**
   ```bash
   node ~/.claude/scripts/context-analyzer-simple.js
   ```

2. **Check for large configuration files:**
   ```bash
   du -sh ~/.claude/  # Check total size
   find .claude -name "*.md" -exec wc -l {} +  # Find large files
   ```

3. **Optimize MCP server configuration:**
   - Disable unused MCP servers in settings
   - Review large agent files in `.claude/agents/`

### Memory Usage Issues

**Problem:** High memory consumption.

**Solutions:**

1. **Monitor memory usage:**
   ```bash
   # Linux/macOS
   top -p $(pgrep node)
   
   # Windows
   taskmgr  # Task Manager, find node.exe processes
   ```

2. **Use lighter analysis mode:**
   ```bash
   node ~/.claude/scripts/context-cmd.js summary
   ```

3. **Clear Node.js cache:**
   ```bash
   node -e "console.log(require.cache)" # See cached modules
   # Restart terminal to clear cache
   ```

## Platform-Specific Issues

### Windows-Specific

**"'node' is not recognized as an internal or external command"**
- Add Node.js to PATH environment variable
- Restart Command Prompt/PowerShell

**"Access denied" on file operations**
- Run PowerShell as Administrator for installation
- Check Windows Defender isn't blocking files

**PowerShell ISE compatibility issues**
- Use regular PowerShell instead of ISE
- Some Unicode characters may not display correctly in ISE

### macOS-Specific

**"Operation not permitted" errors**
- Check macOS security settings
- Grant terminal access to required directories
- Use `sudo` if necessary for directory creation

**Homebrew Node.js issues**
```bash
brew uninstall node
brew install node@18  # Install specific version
```

### WSL-Specific

**Mixed Windows/Linux paths**
- Use Linux paths within WSL: `~/.claude/`
- Windows paths: `/mnt/c/Users/username/.claude/`

**Permission issues between Windows and WSL**
```bash
# Fix permissions in WSL
chmod -R 755 ~/.claude/
```

### Linux Distribution Issues

**Ubuntu/Debian Node.js version too old**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**CentOS/RHEL package manager**
```bash
sudo dnf install nodejs npm
# Or use NodeSource repository
```

## Configuration Issues

### MCP Server Detection Problems

**Problem:** MCP servers not detected correctly.

**Solutions:**

1. **Check settings file:**
   ```bash
   ls -la .claude/settings.local.json
   cat .claude/settings.local.json  # Verify MCP server configuration
   ```

2. **Verify JSON syntax:**
   ```bash
   node -e "JSON.parse(require('fs').readFileSync('.claude/settings.local.json'))"
   ```

3. **Check MCP server status:**
   - Verify MCP servers are actually running
   - Check Claude Code settings for enabled servers

### Custom Agent Detection Issues

**Problem:** Custom agents not showing in analysis.

**Solutions:**

1. **Check agents directory:**
   ```bash
   ls -la .claude/agents/
   ```

2. **Verify agent file format:**
   ```bash
   head .claude/agents/your-agent.md
   # Should have proper frontmatter with agent definition
   ```

3. **Check file encoding:**
   ```bash
   file .claude/agents/*.md  # Should show UTF-8 text
   ```

## Network Issues

### Web Installer Fails

**Problem:** curl/wget installer fails to download.

**Solutions:**

1. **Check internet connectivity:**
   ```bash
   ping github.com
   ```

2. **Try alternative download method:**
   ```bash
   # If curl fails, try wget
   wget -qO- https://raw.githubusercontent.com/Beaulewis1977/claude-code-context-command/main/installers/install-web.sh | bash
   ```

3. **Use proxy if needed:**
   ```bash
   export HTTP_PROXY=http://proxy:port
   export HTTPS_PROXY=http://proxy:port
   ```

4. **Download manually:**
   - Visit GitHub repository in browser
   - Download files manually
   - Use manual installation method

## Cache Issues

### Stale Cache Data

**Problem:** Analysis shows old data or incorrect information.

**Cause:** Cache hasn't expired yet.

**Solutions:**

1. **Wait for cache expiration:**
   - Cache expires after 2-5 minutes
   - Just wait and try again

2. **Force cache refresh:**
   ```bash
   # No direct cache clear command, but you can:
   # 1. Wait 5 minutes
   # 2. Restart terminal
   # 3. Modify any file in .claude/ directory
   ```

3. **Use different working directory:**
   ```bash
   cd /tmp
   cd - # Go back
   # This changes the project context and clears cache
   ```

## Getting More Help

### Diagnostic Information Collection

When reporting issues, please include:

1. **System information:**
   ```bash
   uname -a  # Linux/macOS
   systeminfo  # Windows
   ```

2. **Node.js version:**
   ```bash
   node --version
   npm --version
   ```

3. **File verification:**
   ```bash
   ls -la ~/.claude/scripts/
   ls -la ~/.claude/commands/
   ```

4. **Error output:**
   ```bash
   node ~/.claude/scripts/context-cmd.js summary 2>&1
   ```

### Debug Mode

Enable verbose output for troubleshooting:

```bash
# Set debug environment variable
export DEBUG=context-*
node ~/.claude/scripts/context-cmd.js

# Windows PowerShell
$env:DEBUG="context-*"
node $env:USERPROFILE\.claude\scripts\context-cmd.js
```

### Getting Support

1. **Check existing issues:**
   - Visit [GitHub Issues](https://github.com/Beaulewis1977/claude-code-context-command/issues)
   - Search for similar problems

2. **Create new issue:**
   - Use issue template
   - Include system information
   - Provide error messages and steps to reproduce

3. **Community support:**
   - Check discussions in repository
   - Share solutions with other users

4. **Documentation:**
   - [Installation Guide](INSTALLATION.md)
   - [Usage Guide](USAGE.md)
   - [README](../README.md)

Remember: Most issues are related to Node.js installation, file permissions, or being in the wrong directory. Check these basics first!