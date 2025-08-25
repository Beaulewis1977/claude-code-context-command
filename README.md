# Claude Code Context Command

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-14%2B-green.svg)](https://nodejs.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux%20%7C%20WSL-blue.svg)](#platform-compatibility)

> **Universal context usage analyzer for Claude Code** - Works from any directory in any project

A powerful `/context` command and supporting scripts that provide detailed analysis of your Claude Code session's token usage and context efficiency. Automatically detects your project configuration and works universally across all your Claude Code projects.

## 🎯 What This Does

The Claude Code Context Command analyzes your current session's token usage breakdown:

- **System Prompt**: Base Claude Code instructions (~8.5k tokens)
- **System Tools**: Built-in tools like Read, Write, Edit (~15.2k tokens)  
- **MCP Tools**: Active Model Context Protocol servers and their tools (variable)
- **Custom Agents**: Agent configurations in `.claude/agents/` (project-specific)
- **Memory Files**: `.claude/CLAUDE.md` and other context files (project-specific)

## 📊 Sample Output

```
  ⎿  ⛁⛁⛁⛁⛁⛁⛁⛁⛁⛁⛁⛁⛁⛁⛁⛀⛶⛶⛶⛶
     ⛁⛁⛁⛁⛁⛁⛁⛁⛁⛁⛁⛁⛁⛁⛁⛀⛶⛶⛶⛶   Context Usage
     ⛁⛁⛁⛁⛁⛁⛁⛁⛁⛁⛁⛁⛁⛁⛁⛀⛶⛶⛶⛶   claude-sonnet-4 • 177k/200k tokens (89%)
     ⛁⛁⛁⛁⛁⛁⛁⛁⛁⛁⛁⛁⛁⛁⛁⛀⛶⛶⛶⛶
     ⛁⛁⛀⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶   ⛁ System prompt: 8.5k tokens (4.8%)
     ⛁⛁⛁⛁⛀⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶   ⛁ System tools: 15.2k tokens (8.6%)
     ⛁⛁⛁⛁⛁⛁⛁⛁⛁⛁⛁⛁⛁⛁⛁⛀⛶⛶⛶⛶   ⛁ MCP tools: 135.6k tokens (76.6%)
     ⛁⛁⛁⛀⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶   ⛁ Custom agents: 15.2k tokens (8.6%)
     ⛁⛀⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶   ⛁ Memory files: 2.5k tokens (1.4%)
     ⛁⛁⛁⛁⛀⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶⛶   ⛶ Free space: 23k (11%)

     MCP tools • /mcp
     └ mcp__zen__chat (zen): 1234 tokens
     └ mcp__github-official__create_or_update_file (github-official): 567 tokens
     └ mcp__fetch__fetch (fetch): 643 tokens

     Custom agents • /agents  
     └ system-integration-specialist (Project): 8234 tokens
     └ workflow-orchestrator (Project): 4523 tokens

     Memory files • /memory
     └ Project (/workspace/CLAUDE.md): 2543 tokens

Optimization Recommendations:
High Impact (>10% token reduction):
- **Consolidate MCP Servers**: Consider disabling unused MCP servers (20-40k tokens)
```

## ✨ Key Features

- **🌐 Universal Project Detection**: Automatically finds and analyzes the nearest `.claude` directory
- **📁 Works From Anywhere**: Run from any subdirectory within any Claude Code project
- **⚡ Fast & Cached**: Sub-2-second analysis with intelligent 2-5 minute caching
- **🎨 Beautiful Output**: Unicode progress bars and hierarchical display
- **🔧 Multiple Modes**: Standard, summary, and detailed analysis options
- **🚀 Cross-Platform**: Windows, macOS, Linux, and WSL support
- **📊 Comprehensive Analysis**: Breaks down all token usage components
- **💡 Smart Recommendations**: Suggests concrete optimization steps

## 🛠 Requirements

- **Claude Code**: Must be installed and configured
- **Node.js**: Version 14.0.0 or later
- **Platform**: Windows, macOS, Linux, or WSL

## 📦 Installation Options

Choose your preferred installation method:

### Option 1: Quick Install (Recommended)

**Linux/macOS/WSL:**
```bash
git clone https://github.com/Beaulewis1977/claude-code-context-command.git
cd claude-code-context-command
./installers/install.sh
```

**Windows (PowerShell):**
```powershell
git clone https://github.com/Beaulewis1977/claude-code-context-command.git
cd claude-code-context-command
.\installers\install.ps1
```

### Option 2: One-Liner Web Install

```bash
curl -sSL https://raw.githubusercontent.com/Beaulewis1977/claude-code-context-command/main/installers/install-web.sh | bash
```

### Option 3: NPM Global Package

```bash
npm install -g claude-code-context-command
```

*Note: NPM package will be available after initial repository setup*

### Option 4: Manual Installation

1. **Create directories:**
   ```bash
   mkdir -p ~/.claude/scripts ~/.claude/commands
   ```

2. **Download and copy files:**
   ```bash
   # Download repository
   git clone https://github.com/Beaulewis1977/claude-code-context-command.git
   cd claude-code-context-command
   
   # Copy files
   cp scripts/* ~/.claude/scripts/
   cp commands/context.md ~/.claude/commands/
   
   # Set permissions (Linux/macOS/WSL)
   chmod +x ~/.claude/scripts/*.js
   ```

3. **Test installation:**
   ```bash
   node ~/.claude/scripts/context-cmd.js summary
   ```

### Option 5: GitHub Template

1. Click the **"Use this template"** button on the GitHub repository
2. Clone your new repository
3. Run the installation script for your platform
4. Customize as needed for your workflow

## 🚀 Usage

### Basic Usage

Once installed, use the `/context` command in Claude Code:

```
/context                    # Standard analysis with recommendations
/context summary           # Condensed view with percentages only  
/context standard          # Full analysis with detailed breakdown
```

### Manual Command Line Usage

You can also run the analyzer directly:

```bash
# From any directory in a Claude Code project
node ~/.claude/scripts/context-cmd.js
node ~/.claude/scripts/context-cmd.js summary
node ~/.claude/scripts/context-cmd.js standard
```

### Output Modes

**Summary Mode** (`/context summary`):
- Condensed token usage percentages
- Quick overview without detailed breakdowns
- Fast execution for frequent checks

**Standard Mode** (`/context` or `/context standard`):
- Complete token breakdown by category
- Individual MCP tool and agent listings  
- Optimization recommendations
- Visual progress bars and hierarchical display

## 🧭 How It Works

### Smart Project Detection

The tool automatically:

1. **Walks up the directory tree** from your current location
2. **Finds the nearest `.claude` directory** (your project root)
3. **Analyzes that project's configuration** including:
   - MCP servers from `settings.local.json`
   - Custom agents from `.claude/agents/`
   - Memory files like `.claude/CLAUDE.md`
4. **Provides project-specific analysis** with accurate token counts

### Token Analysis Components

| Component | Description | Typical Size |
|-----------|-------------|--------------|
| **System Prompt** | Base Claude Code instructions | ~8.5k tokens |
| **System Tools** | Built-in Read, Write, Edit, etc. | ~15.2k tokens |
| **MCP Tools** | Active MCP server tools | Variable (0-150k+) |
| **Custom Agents** | Project-specific agent files | Variable (0-50k+) |
| **Memory Files** | CLAUDE.md and context files | Variable (0-20k+) |

### Performance Features

- **Intelligent Caching**: 2-5 minute cache prevents redundant analysis
- **Project-Specific Caching**: Separate cache per project
- **Timeout Protection**: 10-second execution limit prevents hangs
- **Parallel Processing**: Concurrent analysis of system components
- **Error Recovery**: Graceful fallbacks when analysis fails

## 📋 Examples

### High MCP Usage Scenario
```
MCP tools: 145.6k tokens (76.3%)
└ mcp__github-official__ (15 tools): 45.2k tokens
└ mcp__database-tools__ (8 tools): 32.1k tokens  
└ mcp__web-scraper__ (12 tools): 28.3k tokens

Recommendation: Consider disabling unused MCP servers
```

### Agent-Heavy Project
```
Custom agents: 42.1k tokens (22.3%)
└ api-integration-specialist: 15.2k tokens
└ database-architect: 12.8k tokens
└ security-auditor: 14.1k tokens

Recommendation: Review agent file sizes and consolidate
```

### Balanced Usage
```
Context Usage: 165k/200k tokens (82.5%)
⛁ System: 23.7k (12.1%) ⛁ MCP: 85.2k (43.4%) 
⛁ Agents: 28.1k (14.3%) ⛁ Memory: 15.2k (7.7%)
⛁ Free: 22.8k (11.4%)

Status: Well-optimized project setup
```

## 🔧 Platform Compatibility

| Platform | Shell Script | PowerShell | NPM | Manual |
|----------|--------------|------------|-----|--------|
| **Windows** | ✅ (WSL/Git Bash) | ✅ | ✅ | ✅ |
| **macOS** | ✅ | ❌ | ✅ | ✅ |
| **Linux** | ✅ | ❌ | ✅ | ✅ |
| **WSL** | ✅ | ✅ | ✅ | ✅ |

## 🐛 Troubleshooting

### Common Issues

**"No .claude directory found"**
```bash
# Make sure you're in a Claude Code project directory
ls -la .claude/  # Should show project configuration
```

**"Node.js not found"**
```bash
# Install Node.js from https://nodejs.org/
node --version  # Should show v14.0.0 or later
```

**"Permission denied"**
```bash
# Fix script permissions (Linux/macOS/WSL)
chmod +x ~/.claude/scripts/*.js
```

**"Analysis timeout"**
```bash
# The analyzer includes a 10-second timeout for safety
# Large projects with many MCP servers may need optimization
```

### Getting Help

- **Installation Issues**: Check our [Installation Guide](docs/INSTALLATION.md)
- **Usage Questions**: See [Usage Documentation](docs/USAGE.md)
- **Bug Reports**: [Open an issue](https://github.com/Beaulewis1977/claude-code-context-command/issues)

## 🔄 Updating

**Git-based installations:**
```bash
cd claude-code-context-command
git pull
./installers/install.sh  # Re-run installer
```

**NPM installations:**
```bash
npm update -g claude-code-context-command
```

## 🗑 Uninstalling

**Remove files:**
```bash
rm -rf ~/.claude/scripts/context-*.js
rm ~/.claude/scripts/package.json
rm ~/.claude/commands/context.md
```

**NPM installations:**
```bash
npm uninstall -g claude-code-context-command
# Then manually remove files as above
```

## 🏗 Development

### Project Structure

```
claude-code-context-command/
├── scripts/                    # Core analysis scripts
│   ├── context-analyzer.js     # Main analysis engine  
│   ├── context-analyzer-simple.js  # Fast analyzer
│   ├── context-cmd.js          # Command wrapper with caching
│   └── package.json            # Node.js module config
├── commands/
│   └── context.md              # Claude Code slash command
├── installers/                 # Installation scripts
│   ├── install.sh              # Linux/macOS/WSL
│   ├── install.ps1             # Windows PowerShell
│   └── install-web.sh          # Web installer
├── npm/                        # NPM package files
└── docs/                       # Documentation
```

### Contributing

1. Fork this repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test on multiple platforms
5. Submit a pull request

### Local Development

```bash
# Clone and test
git clone https://github.com/Beaulewis1977/claude-code-context-command.git
cd claude-code-context-command

# Test scripts directly
node scripts/context-analyzer.js summary

# Test installation
./installers/install.sh
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/Beaulewis1977/claude-code-context-command/issues)
- **Documentation**: [Full documentation](docs/)
- **Repository**: [Source code](https://github.com/Beaulewis1977/claude-code-context-command)

## 🎉 Acknowledgments

- Built for the [Claude Code](https://claude.ai/code) community
- Inspired by the need for better context management in AI development
- Thanks to all contributors and users providing feedback

---

**Made with ❤️ for the Claude Code community**