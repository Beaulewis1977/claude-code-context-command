# Usage Guide

Complete guide for using the Claude Code Context Command effectively.

## Quick Start

Once installed, you have two main ways to use the context analyzer:

### 1. Claude Code Slash Command (Recommended)

```
/context                    # Standard analysis with recommendations
/context summary           # Quick overview with percentages
/context standard          # Full detailed analysis
```

### 2. Direct Command Line Usage

```bash
node ~/.claude/scripts/context-cmd.js
node ~/.claude/scripts/context-cmd.js summary  
node ~/.claude/scripts/context-cmd.js standard
```

## Understanding the Output

### Standard Mode Output

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
```

#### Visual Elements Explained

- **⛁** (filled blocks): Used tokens
- **⛶** (empty blocks): Free space
- **⛀** (transition): Visual separator
- **⎿** (corner): Frame decoration

#### Header Information

- **Model**: Shows current Claude model (e.g., claude-sonnet-4)
- **Usage**: Current/Total tokens (e.g., 177k/200k)
- **Percentage**: Overall context utilization (e.g., 89%)

#### Token Categories

1. **System Prompt** (~8.5k tokens)
   - Base Claude Code instructions
   - Fixed size, always present

2. **System Tools** (~15.2k tokens)  
   - Built-in tools: Read, Write, Edit, Bash, etc.
   - Fixed size, always present

3. **MCP Tools** (Variable)
   - Model Context Protocol server tools
   - Depends on enabled MCP servers
   - Usually the largest category

4. **Custom Agents** (Variable)
   - Project-specific agent files from `.claude/agents/`
   - Size depends on agent complexity

5. **Memory Files** (Variable)
   - `.claude/CLAUDE.md` and other context files
   - Project-specific memory and notes

### Detailed Breakdown Sections

#### MCP Tools Section
```
     MCP tools • /mcp
     └ mcp__zen__chat (zen): 1234 tokens
     └ mcp__github-official__create_or_update_file (github-official): 567 tokens
     └ mcp__fetch__fetch (fetch): 643 tokens
```

- Shows individual MCP tools and their token usage
- Format: `tool_name (server): token_count`
- Helps identify high-usage MCP servers

#### Custom Agents Section
```
     Custom agents • /agents
     └ system-integration-specialist (Project): 8234 tokens
     └ workflow-orchestrator (Project): 4523 tokens
```

- Lists project-specific agents
- Shows token consumption per agent
- Helps identify large agent files

#### Memory Files Section
```
     Memory files • /memory
     └ Project (/workspace/CLAUDE.md): 2543 tokens
```

- Shows memory files and context
- Path information for reference
- Token count for each file

### Summary Mode Output

```
Context Usage: 177k/200k tokens (89%)
⛁ System: 23.7k (12.1%) ⛁ MCP: 135.6k (76.6%) 
⛁ Agents: 15.2k (8.6%) ⛁ Memory: 2.5k (1.4%) 
⛁ Free: 23k (11.4%)
```

- Condensed single-line format
- Quick percentages for each category
- Ideal for frequent monitoring

## Usage Scenarios

### 1. Project Health Check

**When to use:** Starting work on a project

```bash
cd /path/to/your/project
/context
```

**What to look for:**
- Overall context usage percentage
- Unusually high MCP or agent usage
- Free space remaining for conversation

### 2. Performance Troubleshooting

**When to use:** Claude Code feels slow or unresponsive

```bash
/context standard
```

**What to look for:**
- MCP tools >100k tokens (consider reducing servers)
- Large individual agents >10k tokens
- Total usage >90% (near context limit)

### 3. Quick Status Check

**When to use:** Frequent monitoring during development

```bash
/context summary
```

**Benefits:**
- Fast execution with caching
- Minimal visual noise
- Easy to scan multiple times

### 4. Context Optimization

**When to use:** Preparing for large tasks or imports

```bash
/context standard
```

**Actions based on results:**
- Disable unused MCP servers
- Optimize large agent files  
- Clear unnecessary memory files
- Review project configuration

### 5. Multi-Project Comparison

**When to use:** Working with multiple projects

```bash
# Project A
cd ~/projects/project-a
/context summary

# Project B  
cd ~/projects/project-b
/context summary
```

**Compare:**
- Different MCP server configurations
- Agent usage patterns
- Memory file sizes

## Advanced Usage

### Command Line Flags and Options

Currently supported arguments:

```bash
node ~/.claude/scripts/context-cmd.js [mode]
```

**Modes:**
- `summary` - Condensed output
- `standard` - Full analysis (default)
- No argument - Same as standard

### Environment Variables

**Debug Mode:**
```bash
export DEBUG=context-*
/context
```

**Custom Timeout:**
```bash
export CONTEXT_TIMEOUT=15000  # 15 seconds
/context
```

### Working with Different Projects

The analyzer automatically detects projects:

```bash
# Works from any subdirectory
cd /path/to/project/src/components
/context  # Analyzes the project root configuration

cd /path/to/project/docs  
/context  # Same project, same analysis

cd /different/project
/context  # Different project configuration
```

### Integration with Scripts

**Bash script integration:**
```bash
#!/bin/bash
cd /path/to/project

# Get context status
context_output=$(node ~/.claude/scripts/context-cmd.js summary)
echo "Current context: $context_output"

# Check if context is too high
if [[ $context_output == *"9[0-9]%"* ]]; then
    echo "Warning: High context usage!"
fi
```

**PowerShell integration:**
```powershell
# Get context analysis
$context = & node $env:USERPROFILE\.claude\scripts\context-cmd.js summary

# Parse and act on results
if ($context -match "([0-9]+)%") {
    $usage = [int]$matches[1]
    if ($usage -gt 85) {
        Write-Warning "High context usage: $usage%"
    }
}
```

## Interpreting Results

### Healthy Context Distribution

**Typical healthy project:**
- System components: ~20-30% (fixed baseline)
- MCP tools: ~40-60% (moderate server usage)
- Custom agents: ~10-25% (project-specific)
- Memory files: ~5-15% (reasonable context)
- Free space: ~15%+ (room for conversation)

### Warning Signs

**High MCP Usage (>80%):**
```
⛁ MCP tools: 165.2k tokens (82.6%)
```
- Too many enabled MCP servers
- Consider disabling unused servers
- Review server configurations

**Large Agent Files (>20k each):**
```
└ comprehensive-specialist (Project): 25234 tokens
```
- Agent file is too large
- Break into smaller, focused agents
- Review agent content for redundancy

**Near Context Limit (>95%):**
```
claude-sonnet-4 • 195k/200k tokens (97%)
```
- Very little room for conversation
- Immediate optimization needed
- Consider project restructuring

**Memory File Bloat (>20%):**
```
⛁ Memory files: 45.2k tokens (22.6%)
```
- CLAUDE.md file too large
- Archive old conversations
- Summarize and compress content

### Optimization Recommendations

Based on analysis results, the tool provides specific recommendations:

**High Impact Optimizations (>10% reduction):**
- Disable unused MCP servers
- Consolidate large agent files
- Archive memory content

**Medium Impact Optimizations (5-10% reduction):**
- Review agent configurations
- Clean up project-specific settings
- Optimize memory file content

**Low Impact Optimizations (<5% reduction):**
- Fine-tune individual agent prompts
- Remove redundant MCP tools
- Clean up temporary context files

## Best Practices

### 1. Regular Monitoring

- Run `/context summary` when starting work sessions
- Monitor before large imports or code generation
- Check after adding new MCP servers or agents

### 2. Project Setup

- Start new projects with minimal MCP servers
- Add agents incrementally as needed
- Keep memory files focused and current

### 3. Performance Optimization

- Review context usage weekly
- Disable MCP servers you're not actively using
- Archive old memory content regularly

### 4. Team Collaboration

- Share context analysis when debugging performance
- Document optimal MCP server configurations
- Standardize agent usage patterns across team

### 5. Development Workflow

```bash
# Morning routine
cd ~/current-project
/context summary  # Quick health check

# Before large tasks
/context standard  # Full analysis and optimization

# After configuration changes
/context  # Verify impact of changes
```

## Caching and Performance

### Cache Behavior

- **Cache Duration**: 2-5 minutes depending on analysis complexity
- **Cache Scope**: Per-project (different projects = different cache)
- **Cache Invalidation**: Automatic timeout or project change

### Cache Indicators

**Using cached results:**
```
⚡ Using cached analysis (45s ago)
```

**Fresh analysis:**
```
⚡ Analysis completed in 1.2s
```

### When Cache Helps

- Frequent `/context` commands during development
- Rapid iteration and testing
- Multiple team members checking same project

### When to Bypass Cache

- After configuration changes
- When debugging cache-related issues
- For most accurate real-time analysis

*Note: Currently no manual cache clear - wait 5 minutes or change directories*

## Troubleshooting Usage Issues

### "No .claude directory found"

**Cause:** Not in a Claude Code project directory

**Solution:**
```bash
# Navigate to your project
cd /path/to/claude/project
ls .claude/  # Verify project configuration

# Or create new project structure
mkdir .claude
# Add your project configuration
```

### Inconsistent Results

**Cause:** Cache showing stale data

**Solution:**
- Wait 5 minutes for cache expiration
- Change directory and change back
- Restart terminal session

### Missing MCP Tools or Agents

**Cause:** Configuration not detected properly

**Solution:**
```bash
# Verify configuration files exist
ls -la .claude/settings.local.json  # MCP servers
ls -la .claude/agents/              # Custom agents

# Check file formats
cat .claude/settings.local.json | head
```

## Getting Help

- **Installation Issues**: See [INSTALLATION.md](INSTALLATION.md)
- **Technical Problems**: See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Feature Requests**: [GitHub Issues](https://github.com/Beaulewis1977/claude-code-context-command/issues)
- **Bug Reports**: Include context output and system information