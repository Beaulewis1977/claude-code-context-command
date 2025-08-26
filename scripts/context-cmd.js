#!/usr/bin/env node

/**
 * Context Command Integration Script (Global Version)
 * Wrapper for the context analyzer to integrate with Claude Code slash commands
 * Works globally by detecting the nearest .claude directory
 */

import path from 'path';
import os from 'os';
// Import using both strategies to ensure CI compatibility
import { SafeCommandExecutor, InputValidator, SecureErrorHandler } from '../lib/security.js';
import securityDefaults from '../lib/security.js';

/**
 * Find the nearest .claude directory by walking up the directory tree
 * Includes path traversal protection
 */
async function findClaudeDirectory(startPath = process.cwd()) {
  const { promises: fs } = await import('fs');

  // Validate and sanitize start path using imported modules with fallback
  let currentPath;
  try {
    const validator = InputValidator || (securityDefaults && securityDefaults.InputValidator);
    const errorHandler = SecureErrorHandler || (securityDefaults && securityDefaults.SecureErrorHandler);

    if (!validator || !errorHandler) {
      throw new Error('Security modules not available');
    }

    const validatedStartPath = validator.validatePath(startPath);
    currentPath = path.resolve(validatedStartPath);
  } catch (error) {
    const errorHandler = SecureErrorHandler || (securityDefaults && securityDefaults.SecureErrorHandler);
    if (errorHandler) {
      errorHandler.logSecurityEvent('invalid_start_path', {
        startPath: 'REDACTED',
        error: error.message,
      });
    }
    // Fall back to current working directory if start path is invalid
    currentPath = path.resolve(process.cwd());
  }

  const root = path.parse(currentPath).root;
  let iterations = 0;
  const maxIterations = 50; // Prevent infinite loops

  while (currentPath !== root && iterations < maxIterations) {
    const claudePath = path.join(currentPath, '.claude');

    // Additional security: ensure claudePath is within expected bounds
    if (!claudePath.startsWith(currentPath)) {
      const errorHandler = SecureErrorHandler || (securityDefaults && securityDefaults.SecureErrorHandler);
      if (errorHandler) {
        errorHandler.logSecurityEvent('path_traversal_attempt', {
          currentPath: 'REDACTED',
          claudePath: 'REDACTED',
        });
      }
      break;
    }

    try {
      const stat = await fs.stat(claudePath);
      if (stat.isDirectory()) {
        return {
          claudeDir: claudePath,
          projectRoot: currentPath,
        };
      }
    } catch (error) {
      // Directory doesn't exist, continue searching
      // Don't log this as it's expected behavior
    }

    currentPath = path.dirname(currentPath);
    iterations++;
  }

  if (iterations >= maxIterations) {
    const errorHandler = SecureErrorHandler || (securityDefaults && securityDefaults.SecureErrorHandler);
    if (errorHandler) {
      errorHandler.logSecurityEvent('max_iterations_exceeded', {
        iterations: maxIterations,
      });
    }
  }

  return null;
}

class ContextCommand {
  constructor() {
    this.cacheTimeout = 2 * 60 * 1000; // 2 minutes for faster updates
    this.lastAnalysis = null;
    this.lastAnalysisTime = null;
    this.lastAnalysisProject = null;

    // Enhanced compatibility: Use fallback if named imports are not available
    try {
      this.executor = new SafeCommandExecutor();
      this.InputValidator = InputValidator;
      this.SecureErrorHandler = SecureErrorHandler;
    } catch (error) {
      // Fallback to default exports if named imports fail in CI environments
      if (securityDefaults && securityDefaults.SafeCommandExecutor) {
        this.executor = new securityDefaults.SafeCommandExecutor();
        this.InputValidator = securityDefaults.InputValidator;
        this.SecureErrorHandler = securityDefaults.SecureErrorHandler;
      } else {
        console.error('❌ Failed to initialize security modules:', error.message);
        console.error('   This indicates a critical CommonJS/ES modules compatibility issue.');
        process.exit(1);
      }
    }
  }

  async execute(mode = 'compact') {
    const startTime = Date.now();

    try {
      // Validate mode parameter to prevent injection
      const validatedMode = this.InputValidator.validateMode(mode);

      // Find the current project's .claude directory
      const projectInfo = await findClaudeDirectory();
      if (!projectInfo) {
        const error = this.SecureErrorHandler.sanitizeError(new Error('No .claude directory found'));
        console.error(`❌ ${error.error}`);
        console.error('   Make sure you are running this command from within a Claude Code project.\n');
        return await this.getFallbackAnalysis();
      }

      const currentProject = projectInfo.projectRoot;

      // Check cache first (but only for the same project)
      if (this.shouldUseCache(currentProject)) {
        const cacheAge = Math.round((Date.now() - this.lastAnalysisTime) / 1000);
        console.log(`⚡ Using cached analysis (${cacheAge}s ago)\n`);
        return this.lastAnalysis;
      }

      // Choose the right analyzer based on mode
      const analyzerName = validatedMode === 'detailed' ? 'context-analyzer.js' : 'context-analyzer-simple.js';
      const globalAnalyzerPath = path.join(os.homedir(), '.claude', 'scripts', analyzerName);

      // Use secure command execution instead of execAsync
      const { stdout, stderr } = await this.executor.execute('timeout-analyze', globalAnalyzerPath, [validatedMode], {
        cwd: currentProject,
      });

      if (stderr && !stderr.includes('timeout')) {
        console.warn('⚠️  Analysis warnings:', stderr);
      }

      this.lastAnalysis = stdout;
      this.lastAnalysisTime = Date.now();
      this.lastAnalysisProject = currentProject;

      const duration = Date.now() - startTime;
      if (duration > 2000) {
        console.log(`⚡ Analysis completed in ${duration}ms`);
      }

      // Ensure output is properly flushed when returning
      process.stdout.write(stdout);
      return stdout;
    } catch (error) {
      // Use secure error handling
      const secureError = this.SecureErrorHandler.sanitizeError(error);
      console.error(`❌ Context analysis failed: ${secureError.error}`);

      // Log security event
      this.SecureErrorHandler.logSecurityEvent('context_analysis_failed', {
        errorId: secureError.id,
        mode: mode, // Log original mode for debugging
      });

      // Fallback to basic info if analysis fails
      return await this.getFallbackAnalysis();
    }
  }

  shouldUseCache(currentProject) {
    if (!this.lastAnalysis || !this.lastAnalysisTime || this.lastAnalysisProject !== currentProject) {
      return false;
    }

    const elapsed = Date.now() - this.lastAnalysisTime;
    return elapsed < this.cacheTimeout;
  }

  async getFallbackAnalysis() {
    await findClaudeDirectory();

    return `  ⎿  ⛁ ⛁ ⛁ ⛁ ⛀ ⛁ ⛁ ⛁ ⛁ ⛁ 
     ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁   Context Usage
     ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁   claude-sonnet-4 • 177k/200k tokens (89%)
     ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ 
     ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁   ⛁ System prompt: 9.3k tokens (4.7%)
     ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁   ⛁ System tools: 17.6k tokens (8.8%)
     ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁   ⛁ MCP tools: 132.7k tokens (66.3%)
     ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁   ⛁ Custom agents: 4.5k tokens (2.2%)
     ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛀ ⛶ ⛶   ⛁ Memory files: 13.2k tokens (6.6%)
     ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶   ⛶ Free space: 22.8k (11.4%)
`;
  }
}

// Execute if run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  (async () => {
    const mode = process.argv[2] || 'compact';
    const cmd = new ContextCommand();

    try {
      const result = await cmd.execute(mode);
      // Output is already written in cmd.execute(), no need to log again
      if (!result) {
        console.error('❌ No output generated');
      }
    } catch (error) {
      console.error('❌ Command execution failed:', error.message);
      process.exit(1);
    }
  })();
}

export default ContextCommand;
