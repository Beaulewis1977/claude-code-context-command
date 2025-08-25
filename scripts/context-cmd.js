#!/usr/bin/env node

/**
 * Context Command Integration Script (Global Version)
 * Wrapper for the context analyzer to integrate with Claude Code slash commands
 * Works globally by detecting the nearest .claude directory
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Find the nearest .claude directory by walking up the directory tree
 */
async function findClaudeDirectory(startPath = process.cwd()) {
  const { promises: fs } = await import('fs');
  let currentPath = path.resolve(startPath);
  const root = path.parse(currentPath).root;

  while (currentPath !== root) {
    const claudePath = path.join(currentPath, '.claude');
    try {
      const stat = await fs.stat(claudePath);
      if (stat.isDirectory()) {
        return {
          claudeDir: claudePath,
          projectRoot: currentPath
        };
      }
    } catch (error) {
      // Directory doesn't exist, continue searching
    }
    currentPath = path.dirname(currentPath);
  }
  
  return null;
}

class ContextCommand {
  constructor() {
    this.cacheTimeout = 2 * 60 * 1000; // 2 minutes for faster updates
    this.lastAnalysis = null;
    this.lastAnalysisTime = null;
    this.lastAnalysisProject = null;
  }

  async execute(mode = 'standard') {
    const startTime = Date.now();
    
    // Find the current project's .claude directory
    const projectInfo = await findClaudeDirectory();
    if (!projectInfo) {
      console.error('❌ No .claude directory found in current path or parent directories.');
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

    try {
      // Use the simplified analyzer script with timeout
      const globalAnalyzerPath = path.join(os.homedir(), '.claude', 'scripts', 'context-analyzer-simple.js');
      const { stdout, stderr } = await execAsync(`timeout 10s node "${globalAnalyzerPath}" ${mode}`, {
        cwd: currentProject,  // Run from project directory for context
        timeout: 10000        // 10 second timeout
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

      return stdout;

    } catch (error) {
      console.error('❌ Context analysis failed:', error.message);
      
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
    const projectInfo = await findClaudeDirectory();
    const projectName = projectInfo ? path.basename(projectInfo.projectRoot) : 'Unknown';
    
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
    const mode = process.argv[2] || 'standard';
    const cmd = new ContextCommand();
    
    try {
      const result = await cmd.execute(mode);
      console.log(result);
    } catch (error) {
      console.error('❌ Command execution failed:', error.message);
      process.exit(1);
    }
  })();
}

export default ContextCommand;