# Context Usage Analysis

I'll analyze your Claude Code session's token usage and context efficiency for the current project, automatically detecting your project's `.claude` configuration.

**Automated Analysis Available:**
The `/context` command now uses global scripts that work from any directory:
```bash
# Quick automated analysis
node ~/.claude/scripts/context-cmd.js

# Detailed analysis mode
node ~/.claude/scripts/context-cmd.js standard

# Summary mode
node ~/.claude/scripts/context-cmd.js summary
```

**What This Analyzes:**
- **System Prompt**: Base Claude Code instructions (~8.5k tokens)
- **System Tools**: Built-in tools like Read, Write, Edit (~15.2k tokens)  
- **MCP Tools**: Active Model Context Protocol servers and their tools
- **Custom Agents**: Agent configurations in `.claude/agents/`
- **Memory Files**: `.claude/CLAUDE.md` and other context files
- **Project Detection**: Automatically finds nearest `.claude` directory

**Smart Project Detection:**
The global scripts automatically:
- Walk up directory tree to find nearest `.claude` folder
- Use that project's configuration for analysis
- Work from any subdirectory within a Claude Code project
- Fall back gracefully if no `.claude` directory is found

**Analysis Phases:**

**Phase 1: Project Discovery**
- Detect current project by finding nearest `.claude/` directory
- Load project-specific MCP server configurations
- Scan custom agent files and memory files
- Display project path and name for context

**Phase 2: Token Estimation**
- **System Components**: ~23.7k tokens (system prompt + built-in tools)
- **MCP Servers**: Variable based on enabled servers in settings.local.json
- **Custom Agents**: Calculated from actual `.md` files in `agents/`
- **Memory Files**: Actual token count from `CLAUDE.md`
- **Total Context**: Sum of all components

**Phase 3: Optimization Analysis**
Identifies potential inefficiencies:
- **High MCP Usage**: >100k tokens suggests server consolidation
- **Large Agent Files**: >10k tokens suggests agent optimization
- **Excessive MCP Servers**: >15 servers suggests selective loading
- **Oversized Memory**: Large CLAUDE.md files that could be summarized

**Usage Patterns:**
- `/context` - Run automated analysis for current project
- `/context summary` - Condensed view with percentages only  
- `/context standard` - Full analysis with recommendations
- Direct script execution from any directory within a project

**Sample Output Format:**
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

     MCP tools · /mcp
     └ mcp__zen__chat (zen): 1234 tokens
     └ mcp__zen__thinkdeep (zen): 1456 tokens
     └ mcp__zen__planner (zen): 1123 tokens
     └ mcp__github-official__create_or_update_file (github-official): 567 tokens
     └ mcp__github-official__search_repositories (github-official): 434 tokens
     └ mcp__fetch__fetch (fetch): 643 tokens

     Custom agents · /agents
     └ system-integration-specialist (Project): 8234 tokens
     └ workflow-orchestrator (Project): 4523 tokens
     └ complexity-analyzer (Project): 2456 tokens

     Memory files · /memory
     └ Project (/workspace/CLAUDE.md): 2543 tokens

Optimization Recommendations:

High Impact (>10% token reduction):
- **Consolidate MCP Servers**: Consider disabling unused MCP servers (20-40k tokens)
```

**When I Run `/context` for You:**
I'll execute the global analysis script and provide:
1. **Current Project Detection**: Which project's `.claude` config is being analyzed
2. **Token Breakdown**: Actual percentages and counts from your configuration
3. **Top Resource Consumers**: MCP servers and agents using the most tokens
4. **Specific Recommendations**: Concrete optimization steps for your setup
5. **Project-Aware**: Analysis specific to whichever project you're currently in

**Performance Optimizations:**
- **Fast Execution**: Sub-2-second analysis with intelligent caching
- **Parallel Processing**: Concurrent analysis of system components
- **Smart Caching**: 2-minute cache for rapid repeated queries
- **Timeout Protection**: 10-second execution limit prevents hangs
- **Efficient Data**: Pre-calculated MCP tool token estimates

**Unicode Display Features:**
- **Proper Box Characters**: Uses ⎿ for box structure
- **Progress Bars**: Accurate ⛁⛀⛶ character progression
- **Hierarchical Layout**: Tree structure with └ characters
- **Model Info**: Clear "claude-sonnet-4 • 177k/200k tokens (89%)" format
- **Individual Tool Breakdown**: Each MCP tool with server and token count

**Benefits of Global Implementation:**
- **Universal Access**: Works from any directory in any Claude Code project
- **No Project Setup**: No need to copy scripts to each project
- **Dynamic Detection**: Automatically finds and analyzes the right project
- **Consistent Results**: Same analysis methodology across all projects
- **Performance Focused**: Optimized for speed and reliability

This helps you monitor and optimize Claude Code context usage across all your projects from anywhere in your filesystem.