/**
 * Security utilities for Claude Code Context Command
 * Provides secure input validation, command execution, and file operations
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Input validation with security focus
 */
export class InputValidator {
  static validateMode(mode) {
    if (typeof mode !== 'string') {
      throw new Error('Mode must be a string');
    }
    
    // Only allow alphanumeric characters
    if (!/^[a-zA-Z]+$/.test(mode)) {
      throw new Error('Mode contains invalid characters');
    }
    
    // Allowlist of valid modes
    const allowedModes = ['compact', 'summary', 'standard', 'detailed'];
    if (!allowedModes.includes(mode)) {
      throw new Error(`Invalid mode: ${mode}`);
    }
    
    return mode;
  }
  
  static validatePath(userPath) {
    if (typeof userPath !== 'string') {
      throw new Error('Path must be a string');
    }
    
    // Check for null bytes and dangerous characters
    if (userPath.includes('\0') || userPath.includes('%00')) {
      throw new Error('Path contains null bytes');
    }
    
    // Remove dangerous characters but preserve valid path chars
    const cleaned = userPath.replace(/[<>:"|?*]/g, '');
    
    // Check for directory traversal attempts
    if (cleaned.includes('../') || cleaned.includes('..\\')) {
      throw new Error('Directory traversal detected');
    }
    
    return cleaned;
  }
  
  static validateJSON(jsonString) {
    if (typeof jsonString !== 'string') {
      throw new Error('JSON input must be a string');
    }
    
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error('Invalid JSON input');
    }
  }
}

/**
 * Secure command execution using spawn instead of exec
 */
export class SafeCommandExecutor {
  constructor() {
    // Allowlist of permitted commands with their arguments
    this.allowedCommands = new Map([
      ['analyze', { 
        cmd: 'node', 
        baseArgs: [],
        timeout: 10000,
        maxBuffer: 1024 * 1024
      }],
      ['timeout-analyze', {
        cmd: 'timeout',
        baseArgs: ['10s', 'node'],
        timeout: 10000,
        maxBuffer: 1024 * 1024
      }]
    ]);
  }
  
  async execute(commandName, scriptPath, args = [], options = {}) {
    // Validate command is allowed
    const command = this.allowedCommands.get(commandName);
    if (!command) {
      throw new Error(`Command not allowed: ${commandName}`);
    }
    
    // Validate script path
    const validatedPath = this.validateScriptPath(scriptPath);
    
    // Sanitize arguments
    const safeArgs = args.map(arg => this.sanitizeArg(arg));
    
    // Build final command
    let finalCmd = command.cmd;
    let finalArgs = [...command.baseArgs];
    
    if (commandName === 'timeout-analyze') {
      finalArgs.push(validatedPath, ...safeArgs);
    } else {
      finalArgs.push(validatedPath, ...safeArgs);
    }
    
    return new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';
      
      const child = spawn(finalCmd, finalArgs, {
        cwd: options.cwd,
        encoding: 'utf8',
        timeout: command.timeout
      });
      
      child.stdout.on('data', (data) => {
        stdout += data;
        if (stdout.length > command.maxBuffer) {
          child.kill();
          reject(new Error('Output buffer exceeded'));
          return;
        }
      });
      
      child.stderr.on('data', (data) => {
        stderr += data;
        if (stderr.length > command.maxBuffer) {
          child.kill();
          reject(new Error('Error buffer exceeded'));
          return;
        }
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });
      
      child.on('error', (error) => {
        reject(new Error(`Command execution failed: ${error.message}`));
      });
      
      // Set timeout
      setTimeout(() => {
        if (!child.killed) {
          child.kill();
          reject(new Error('Command execution timed out'));
        }
      }, command.timeout);
    });
  }
  
  validateScriptPath(scriptPath) {
    // Resolve path to prevent traversal
    const resolved = path.resolve(scriptPath);
    
    // Ensure it's a JavaScript file
    if (!resolved.endsWith('.js')) {
      throw new Error('Only JavaScript files are allowed');
    }
    
    // Ensure it's in an allowed directory (home/.claude/scripts)
    const allowedDir = path.resolve(path.join(process.env.HOME || process.env.USERPROFILE, '.claude', 'scripts'));
    if (!resolved.startsWith(allowedDir)) {
      throw new Error('Script must be in allowed directory');
    }
    
    return resolved;
  }
  
  sanitizeArg(arg) {
    if (typeof arg !== 'string') {
      throw new Error('Argument must be a string');
    }
    
    // Remove potentially dangerous characters
    return arg.replace(/[;&|`$()<>\\'"]/g, '');
  }
}

/**
 * Secure file operations with path validation
 */
export class SecureFileOperations {
  constructor(allowedBasePaths = []) {
    this.allowedPaths = allowedBasePaths.map(p => path.resolve(p));
  }
  
  validateFilePath(filePath) {
    const resolved = path.resolve(filePath);
    
    // Check if path is within allowed base paths
    const isAllowed = this.allowedPaths.length === 0 || 
                     this.allowedPaths.some(allowed => resolved.startsWith(allowed));
    
    if (!isAllowed) {
      throw new Error('File access denied - path not in allowed directories');
    }
    
    // Additional security checks
    if (resolved.includes('\0') || resolved.includes('%00')) {
      throw new Error('Path contains null bytes');
    }
    
    return resolved;
  }
  
  async readFile(filePath, options = {}) {
    const validPath = this.validateFilePath(filePath);
    
    try {
      const stats = await fs.stat(validPath);
      
      // Check file size limit (default 10MB)
      const maxSize = options.maxSize || 10 * 1024 * 1024;
      if (stats.size > maxSize) {
        throw new Error('File too large');
      }
      
      // Only allow regular files
      if (!stats.isFile()) {
        throw new Error('Path is not a regular file');
      }
      
      return await fs.readFile(validPath, options.encoding || 'utf8');
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }
  
  async writeFile(filePath, content, options = {}) {
    const validPath = this.validateFilePath(filePath);
    
    try {
      // Atomic write using temporary file
      const tempPath = `${validPath}.tmp.${Date.now()}`;
      
      await fs.writeFile(tempPath, content, options.encoding || 'utf8');
      await fs.rename(tempPath, validPath);
      
      return validPath;
    } catch (error) {
      // Clean up temp file if it exists
      try {
        await fs.unlink(`${validPath}.tmp.${Date.now()}`);
      } catch {}
      
      throw new Error(`Failed to write file: ${error.message}`);
    }
  }
}

/**
 * Secure error handling with information disclosure prevention
 */
export class SecureErrorHandler {
  static sanitizeError(error) {
    // Log full error internally (in production, this should go to secure logging)
    console.error('[Security] Internal error:', error);
    
    // Map of error codes to safe messages
    const safeMessages = {
      'ENOENT': 'File or directory not found',
      'EACCES': 'Permission denied',
      'EINVAL': 'Invalid input provided',
      'ENOTDIR': 'Path is not a directory', 
      'EISDIR': 'Path is a directory',
      'EMFILE': 'Too many open files',
      'ENOMEM': 'Not enough memory',
      'TIMEOUT': 'Operation timed out',
      'BUFFER_EXCEEDED': 'Output too large',
      'COMMAND_NOT_ALLOWED': 'Command not permitted',
      'PATH_TRAVERSAL': 'Invalid path detected',
      'INVALID_INPUT': 'Input validation failed',
      'DEFAULT': 'An error occurred'
    };
    
    // Determine error type
    let errorCode = 'DEFAULT';
    if (error.code && safeMessages[error.code]) {
      errorCode = error.code;
    } else if (error.message) {
      // Map common error message patterns to codes
      if (error.message.includes('traversal')) errorCode = 'PATH_TRAVERSAL';
      else if (error.message.includes('validation')) errorCode = 'INVALID_INPUT';
      else if (error.message.includes('timeout')) errorCode = 'TIMEOUT';
      else if (error.message.includes('buffer')) errorCode = 'BUFFER_EXCEEDED';
      else if (error.message.includes('not allowed')) errorCode = 'COMMAND_NOT_ALLOWED';
    }
    
    return {
      error: safeMessages[errorCode],
      timestamp: new Date().toISOString(),
      id: crypto.randomUUID()
    };
  }
  
  static logSecurityEvent(event, details = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details: {
        ...details,
        // Remove sensitive information
        userAgent: details.userAgent ? 'REDACTED' : undefined,
        sessionId: details.sessionId ? 'REDACTED' : undefined
      }
    };
    
    // In production, this should go to a secure logging system
    console.warn('[Security Event]', JSON.stringify(logEntry));
  }
}

/**
 * Integrity verification utilities
 */
export class IntegrityVerifier {
  static async verifyChecksum(filePath, expectedHash, algorithm = 'sha256') {
    try {
      const fileBuffer = await fs.readFile(filePath);
      const hash = crypto.createHash(algorithm);
      hash.update(fileBuffer);
      const actualHash = hash.digest('hex');
      
      return actualHash === expectedHash;
    } catch (error) {
      throw new Error(`Checksum verification failed: ${error.message}`);
    }
  }
  
  static generateChecksum(content, algorithm = 'sha256') {
    const hash = crypto.createHash(algorithm);
    hash.update(content);
    return hash.digest('hex');
  }
}