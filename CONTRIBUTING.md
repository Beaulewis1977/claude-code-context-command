# Contributing to Claude Code Context Command

Thanks for your interest in contributing! 🎉 This project helps Claude Code users better understand and optimize their context usage, and we'd love your help making it even better.

## 🤝 Ways to Contribute

- **🐛 Bug Reports**: Found something broken? Let us know!
- **💡 Feature Requests**: Have ideas for improvements? Share them!
- **📝 Documentation**: Help improve our docs, examples, or guides
- **🔧 Code Contributions**: Fix bugs, add features, or optimize performance
- **🧪 Testing**: Test on different platforms and report issues
- **🎨 UI/UX**: Improve the visual output or user experience

## 🚀 Getting Started

### Prerequisites

- **Node.js** 14.0.0 or later
- **Git** for version control
- **Claude Code** installed for testing
- Basic familiarity with JavaScript/Shell scripting

### Development Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR-USERNAME/claude-code-context-command.git
   cd claude-code-context-command
   ```

2. **Create a development branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

3. **Set up development environment**
   ```bash
   # Create symlinks for testing (Linux/macOS)
   ln -sf "$(pwd)/scripts/context-cmd.js" ~/.claude/scripts/context-cmd-dev.js
   ln -sf "$(pwd)/commands/context.md" ~/.claude/commands/context-dev.md
   
   # Windows (PowerShell as Administrator)
   New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.claude\scripts\context-cmd-dev.js" -Target "$(pwd)\scripts\context-cmd.js"
   ```

4. **Test your setup**
   ```bash
   # Test the analyzer directly
   node scripts/context-analyzer.js summary
   
   # Test the command wrapper
   node scripts/context-cmd.js
   ```

## 📋 Development Guidelines

### Code Style

**JavaScript:**
- Use ES6+ features (import/export, async/await, etc.)
- 2-space indentation
- Semicolons required
- Descriptive variable names
- JSDoc comments for functions

**Shell Scripts:**
- Use `#!/bin/bash` for cross-platform compatibility
- Set `set -euo pipefail` for error handling
- Quote variables: `"$variable"`
- Use functions for reusable code

**Example JavaScript:**
```javascript
/**
 * Analyzes MCP server token usage
 * @param {Object} serverConfig - MCP server configuration
 * @returns {Promise<Object>} Token usage breakdown
 */
async function analyzeMcpServer(serverConfig) {
  const tools = await loadMcpTools(serverConfig);
  return {
    serverName: serverConfig.name,
    totalTokens: calculateTokens(tools),
    toolCount: tools.length
  };
}
```

### File Structure

```
claude-code-context-command/
├── scripts/
│   ├── context-analyzer.js      # Main analysis engine
│   ├── context-analyzer-simple.js  # Lightweight version  
│   ├── context-cmd.js           # Command wrapper
│   └── package.json             # Module config
├── commands/
│   └── context.md               # Claude Code slash command
├── installers/
│   ├── install.sh               # Unix installer
│   ├── install.ps1              # Windows installer
│   └── install-web.sh           # Web installer
├── docs/                        # Documentation
├── examples/                    # Sample outputs
└── tests/                       # Test files (add as needed)
```

### Commit Messages

Use conventional commit format:

```
type(scope): description

- feat(analyzer): add support for new MCP server format
- fix(installer): handle spaces in directory paths
- docs(readme): update installation instructions
- test(analyzer): add unit tests for token calculation
- refactor(cache): improve performance and memory usage
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `style`: Code style/formatting
- `ci`: CI/CD changes

## 🧪 Testing

### Manual Testing

**Test all platforms:**
```bash
# Test installation scripts
./installers/install.sh          # Linux/macOS/WSL
.\installers\install.ps1         # Windows PowerShell

# Test analyzer in different project types
cd /path/to/minimal-project && node ~/.claude/scripts/context-cmd.js
cd /path/to/complex-project && node ~/.claude/scripts/context-cmd.js summary
```

**Test edge cases:**
- Projects without `.claude` directory
- Large MCP server configurations
- Empty or missing configuration files
- Unicode characters in file paths
- Very long file paths

### Automated Testing

We welcome contributions to add automated testing:

```bash
# Future test structure
npm test                    # Run all tests
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests
npm run test:cross-platform # Platform-specific tests
```

## 🐛 Bug Reports

**Before submitting:**
1. Check [existing issues](https://github.com/Beaulewis1977/claude-code-context-command/issues)
2. Test with the latest version
3. Try reproducing in a clean environment

**Include in your report:**
- **System info**: OS, Node.js version, Claude Code version
- **Steps to reproduce**: Detailed steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Error output**: Full error messages
- **Context configuration**: Anonymized `.claude` directory structure

**Template:**
```markdown
## Bug Description
Brief description of the issue

## Environment
- OS: [Windows 11 / macOS 13 / Ubuntu 22.04 / WSL2]
- Node.js: [version]
- Claude Code: [version]

## Steps to Reproduce
1. Navigate to project directory
2. Run `/context` command
3. Observe error

## Expected Behavior
Context analysis should display token breakdown

## Actual Behavior
Error message: "Cannot read property..."

## Additional Context
- Project has 15 MCP servers configured
- Large CLAUDE.md file (50k+ tokens)
- Error started after recent Claude Code update
```

## 💡 Feature Requests

**Good feature requests include:**
- **Clear use case**: Why is this needed?
- **Proposed solution**: How should it work?
- **Alternatives considered**: Other approaches
- **Implementation ideas**: Technical details if you have them

**Examples of welcome features:**
- New output formats (JSON, CSV, etc.)
- Additional optimization recommendations  
- Integration with other Claude Code features
- Performance improvements
- Better error handling
- New installation methods

## 🔧 Pull Request Process

### Before Submitting

1. **Test thoroughly** on multiple platforms
2. **Update documentation** if needed
3. **Add examples** for new features
4. **Follow code style** guidelines
5. **Write descriptive commit messages**

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)  
- [ ] Breaking change (existing functionality changes)
- [ ] Documentation update

## Testing
- [ ] Tested on Linux/macOS
- [ ] Tested on Windows  
- [ ] Tested with minimal Claude project
- [ ] Tested with complex Claude project
- [ ] Manual testing completed
- [ ] All existing functionality works

## Screenshots (if applicable)
Before/after screenshots of output changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.log() statements left in code
- [ ] Commit messages follow conventional format
```

### Review Process

1. **Automated checks** (when implemented)
2. **Manual review** by maintainers
3. **Testing** on different platforms
4. **Feedback and iteration**
5. **Merge** when approved

## 📚 Areas Needing Help

**High Priority:**
- **Cross-platform testing**: Especially Windows PowerShell edge cases
- **Performance optimization**: Large project analysis
- **Error handling**: Better error messages and recovery
- **Documentation**: More examples and troubleshooting

**Medium Priority:**
- **Automated testing**: Unit and integration tests
- **New output formats**: JSON export, CSV reports
- **Configuration validation**: Better config file checking
- **Caching improvements**: More intelligent cache invalidation

**Low Priority:**
- **UI enhancements**: Better progress indicators
- **Plugin system**: Extensible analysis modules
- **Integration**: Other Claude Code tools
- **Localization**: Multi-language support

## 🎨 Design Principles

**Keep it simple:**
- Single-purpose tool focused on context analysis
- Easy installation and setup
- Minimal dependencies

**Make it reliable:**
- Graceful error handling
- Fallback behaviors when analysis fails
- Consistent cross-platform behavior

**Prioritize performance:**
- Fast analysis even for large projects
- Intelligent caching
- Timeout protection

**Stay user-focused:**
- Clear, actionable output
- Helpful error messages
- Good documentation

## 🆘 Getting Help

**Stuck? Need guidance?**

- **Email**: blewisxx@gmail.com
- **GitHub Discussions**: Ask questions in discussions
- **Issues**: Tag with `question` label
- **Documentation**: Check [docs/](docs/) directory

**For major changes:**
- Open an issue first to discuss the approach
- Get feedback before writing lots of code
- Consider breaking large changes into smaller PRs

## 📄 Code of Conduct

**Be respectful:**
- Welcoming to contributors of all experience levels
- Constructive feedback only
- Focus on the code, not the person

**Be helpful:**
- Patient with questions
- Share knowledge and best practices
- Help others learn

**Be collaborative:**
- Open to different approaches
- Willing to compromise
- Credit others for their contributions

## 🎉 Recognition

Contributors are recognized in:
- **GitHub contributors list**
- **Release notes** for significant contributions
- **README acknowledgments** for major features

Thanks for helping make Claude Code better for everyone! 🚀

---

**Questions? Ideas? Just want to chat about the project?**  
Reach out to Beau Lewis at blewisxx@gmail.com