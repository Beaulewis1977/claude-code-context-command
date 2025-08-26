#!/usr/bin/env node

/**
 * Security Test Suite for Claude Code Context Command
 * Tests various security vulnerabilities and protections
 */

import { describe, it, expect, beforeEach, afterEach } from 'mocha';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { InputValidator, SafeCommandExecutor, SecureFileOperations, SecureErrorHandler, IntegrityVerifier } from '../lib/security.js';

describe('Security Test Suite', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'security-test-'));
  });

  afterEach(async () => {
    if (tempDir) {
      await fs.rmdir(tempDir, { recursive: true });
    }
  });

  describe('Input Validation', () => {
    describe('validateMode', () => {
      it('should accept valid modes', () => {
        const validModes = ['compact', 'summary', 'standard', 'detailed'];
        validModes.forEach(mode => {
          expect(() => InputValidator.validateMode(mode)).not.to.throw();
        });
      });

      it('should reject invalid modes', () => {
        const invalidModes = [
          'invalid',
          'compact; rm -rf /',
          'standard && echo "pwned"',
          'detailed | cat /etc/passwd',
          'summary`whoami`',
          'standard$(id)',
          '../../../etc/passwd',
          null,
          undefined,
          42,
          []
        ];

        invalidModes.forEach(mode => {
          expect(() => InputValidator.validateMode(mode)).to.throw();
        });
      });

      it('should prevent command injection attempts', () => {
        const injectionAttempts = [
          '; rm -rf /',
          '&& whoami',
          '| cat /etc/passwd',
          '`id`',
          '$(whoami)',
          '$USER',
          '${PATH}',
          '\nwhoami',
          '\r\nid',
          'standard\0rm',
          'summary%00id'
        ];

        injectionAttempts.forEach(attempt => {
          expect(() => InputValidator.validateMode(attempt)).to.throw();
        });
      });
    });

    describe('validatePath', () => {
      it('should accept valid paths', () => {
        const validPaths = [
          '/home/user/project',
          './relative/path',
          'simple-filename.txt',
          '/usr/local/bin/script',
          'C:\\\\Users\\\\user\\\\project' // Windows path
        ];

        validPaths.forEach(pathStr => {
          expect(() => InputValidator.validatePath(pathStr)).not.to.throw();
        });
      });

      it('should reject path traversal attempts', () => {
        const traversalAttempts = [
          '../../../etc/passwd',
          '..\\\\..\\\\..\\\\windows\\\\system32',
          './../../root/.ssh/id_rsa',
          '/../etc/shadow',
          '\\\\..\\\\..\\\\boot.ini',
          'file/../../etc/hosts',
          '/var/www/../../../etc/passwd',
          'C:\\\\..\\\\..\\\\Windows\\\\System32'
        ];

        traversalAttempts.forEach(attempt => {
          expect(() => InputValidator.validatePath(attempt)).to.throw(/traversal/i);
        });
      });

      it('should reject null byte attacks', () => {
        const nullByteAttempts = [
          'normal-file\\0/etc/passwd',
          'script.js\\0.txt',
          '/tmp/safe\\0/../../../etc/shadow',
          'file%00.txt',
          'path\\x00injection'
        ];

        nullByteAttempts.forEach(attempt => {
          expect(() => InputValidator.validatePath(attempt)).to.throw(/null/i);
        });
      });

      it('should reject dangerous characters', () => {
        const dangerousChars = [
          'file<script>alert()</script>',
          'path>output.txt',
          'file:with:colons',
          'file"quotes"',
          'file|pipe',
          'file?query',
          'file*wildcard'
        ];

        dangerousChars.forEach(path => {
          const cleaned = InputValidator.validatePath(path);
          expect(cleaned).not.to.contain(['<', '>', ':', '"', '|', '?', '*']);
        });
      });
    });

    describe('validateJSON', () => {
      it('should accept valid JSON', () => {
        const validJSON = [
          '{"key": "value"}',
          '[1, 2, 3]',
          'true',
          'null',
          '"string"',
          '42'
        ];

        validJSON.forEach(json => {
          expect(() => InputValidator.validateJSON(json)).not.to.throw();
        });
      });

      it('should reject invalid JSON', () => {
        const invalidJSON = [
          '{invalid: json}',
          '{key: "value"}', // unquoted key
          "{'key': 'value'}", // single quotes
          '{key: value}', // unquoted value
          '{,}',
          '[,]',
          '{',
          '}',
          'undefined',
          'function() {}',
          null,
          undefined,
          42,
          []
        ];

        invalidJSON.forEach(json => {
          expect(() => InputValidator.validateJSON(json)).to.throw();
        });
      });
    });
  });

  describe('Safe Command Execution', () => {
    let executor;

    beforeEach(() => {
      executor = new SafeCommandExecutor();
    });

    describe('command validation', () => {
      it('should reject unauthorized commands', async () => {
        const unauthorizedCommands = [
          'rm',
          'cat',
          'wget',
          'curl',
          'bash',
          'sh',
          'exec',
          'eval'
        ];

        for (const cmd of unauthorizedCommands) {
          try {
            await executor.execute(cmd, '/tmp/script.js');
            expect.fail(`Should have rejected command: ${cmd}`);
          } catch (error) {
            expect(error.message).to.contain('not allowed');
          }
        }
      });

      it('should validate script paths', async () => {
        const invalidPaths = [
          '../../../etc/passwd',
          '/etc/shadow',
          'C:\\\\Windows\\\\System32\\\\cmd.exe',
          '/tmp/malicious.py', // wrong extension
          '/usr/bin/rm' // not in allowed directory
        ];

        for (const path of invalidPaths) {
          try {
            await executor.execute('analyze', path);
            expect.fail(`Should have rejected path: ${path}`);
          } catch (error) {
            expect(error.message).to.match(/not allowed|JavaScript files|allowed directory/);
          }
        }
      });

      it('should sanitize arguments', () => {
        const dangerousArgs = [
          '; rm -rf /',
          '&& whoami',
          '| cat /etc/passwd',
          '`id`',
          '$(whoami)',
          '$USER',
          '${PATH}'
        ];

        dangerousArgs.forEach(arg => {
          const sanitized = executor.sanitizeArg(arg);
          expect(sanitized).not.to.contain([';', '&', '|', '`', '$', '(', ')', '<', '>', '\\\\', "'", '"']);
        });
      });
    });

    describe('timeout protection', () => {
      it('should timeout long-running commands', async () => {
        // This test would need a mock long-running script
        // Implementation depends on test environment
      });
    });

    describe('buffer protection', () => {
      it('should limit output buffer size', async () => {
        // This test would need a mock script that generates large output
        // Implementation depends on test environment
      });
    });
  });

  describe('Secure File Operations', () => {
    let fileOps;

    beforeEach(() => {
      fileOps = new SecureFileOperations([tempDir]);
    });

    describe('path validation', () => {
      it('should allow access to files in allowed directories', async () => {
        const testFile = path.join(tempDir, 'test.txt');
        await fs.writeFile(testFile, 'test content');

        const content = await fileOps.readFile(testFile);
        expect(content).to.equal('test content');
      });

      it('should deny access to files outside allowed directories', async () => {
        const forbiddenPaths = [
          '/etc/passwd',
          '/tmp/outside.txt',
          '../../../etc/shadow',
          path.join(tempDir, '../forbidden.txt')
        ];

        for (const filePath of forbiddenPaths) {
          try {
            await fileOps.readFile(filePath);
            expect.fail(`Should have denied access to: ${filePath}`);
          } catch (error) {
            expect(error.message).to.contain('denied');
          }
        }
      });

      it('should reject files with null bytes in path', async () => {
        const nullBytePaths = [
          `${tempDir}/file\\0.txt`,
          `${tempDir}/normal\\0../../../etc/passwd`
        ];

        for (const filePath of nullBytePaths) {
          try {
            await fileOps.readFile(filePath);
            expect.fail(`Should have rejected null byte path: ${filePath}`);
          } catch (error) {
            expect(error.message).to.contain('null');
          }
        }
      });
    });

    describe('file size limits', () => {
      it('should reject files that are too large', async () => {
        const largeFile = path.join(tempDir, 'large.txt');
        const largeContent = 'x'.repeat(11 * 1024 * 1024); // 11MB
        await fs.writeFile(largeFile, largeContent);

        try {
          await fileOps.readFile(largeFile);
          expect.fail('Should have rejected large file');
        } catch (error) {
          expect(error.message).to.contain('too large');
        }
      });

      it('should accept files within size limit', async () => {
        const normalFile = path.join(tempDir, 'normal.txt');
        const normalContent = 'x'.repeat(1024); // 1KB
        await fs.writeFile(normalFile, normalContent);

        const content = await fileOps.readFile(normalFile);
        expect(content).to.equal(normalContent);
      });
    });

    describe('file type validation', () => {
      it('should only allow regular files', async () => {
        // Create a directory instead of a file
        const dirPath = path.join(tempDir, 'directory');
        await fs.mkdir(dirPath);

        try {
          await fileOps.readFile(dirPath);
          expect.fail('Should have rejected directory');
        } catch (error) {
          expect(error.message).to.contain('not a regular file');
        }
      });
    });

    describe('atomic writes', () => {
      it('should write files atomically', async () => {
        const testFile = path.join(tempDir, 'atomic.txt');
        const content = 'atomic write test';

        const writtenPath = await fileOps.writeFile(testFile, content);
        expect(writtenPath).to.equal(testFile);

        const readContent = await fs.readFile(testFile, 'utf8');
        expect(readContent).to.equal(content);
      });
    });
  });

  describe('Error Handling', () => {
    describe('error sanitization', () => {
      it('should sanitize error messages to prevent information disclosure', () => {
        const sensitiveErrors = [
          new Error('ENOENT: no such file or directory, open \'/home/user/secret/password.txt\''),
          new Error('Connection failed to mysql://user:password@localhost:3306/db'),
          new Error('Failed to read /etc/shadow: Permission denied'),
          { code: 'EACCES', message: 'Permission denied accessing /root/.ssh/id_rsa' },
          { message: 'SQL injection detected in user input' }
        ];

        sensitiveErrors.forEach(error => {
          const sanitized = SecureErrorHandler.sanitizeError(error);
          
          // Should not contain sensitive paths or information
          expect(sanitized.error).not.to.contain([
            '/home/user/secret',
            'password',
            '/etc/shadow',
            '/root/.ssh',
            'mysql://',
            'SQL injection'
          ]);

          // Should contain safe, generic messages
          expect(sanitized.error).to.be.a('string');
          expect(sanitized.timestamp).to.be.a('string');
          expect(sanitized.id).to.be.a('string');
        });
      });

      it('should map common error codes to safe messages', () => {
        const errorMappings = [
          { code: 'ENOENT', expectedMessage: 'File or directory not found' },
          { code: 'EACCES', expectedMessage: 'Permission denied' },
          { code: 'EINVAL', expectedMessage: 'Invalid input provided' },
          { code: 'TIMEOUT', expectedMessage: 'Operation timed out' }
        ];

        errorMappings.forEach(({ code, expectedMessage }) => {
          const error = { code, message: 'Original sensitive message' };
          const sanitized = SecureErrorHandler.sanitizeError(error);
          expect(sanitized.error).to.equal(expectedMessage);
        });
      });
    });

    describe('security event logging', () => {
      it('should log security events with safe details', () => {
        const events = [
          { event: 'invalid_input', details: { userInput: 'malicious; rm -rf /', userId: 'user123' } },
          { event: 'path_traversal', details: { attemptedPath: '../../../etc/passwd' } },
          { event: 'command_injection', details: { command: 'ls; rm -rf /' } }
        ];

        // Mock console.warn to capture logs
        const originalWarn = console.warn;
        const logs = [];
        console.warn = (...args) => logs.push(args);

        events.forEach(({ event, details }) => {
          SecureErrorHandler.logSecurityEvent(event, details);
        });

        console.warn = originalWarn;

        // Verify logs were created and sensitive data was redacted
        expect(logs.length).to.be.greaterThan(0);
        logs.forEach(log => {
          const logString = log.join(' ');
          expect(logString).not.to.contain(['malicious; rm -rf /', '/etc/passwd', 'user123']);
        });
      });
    });
  });

  describe('Integrity Verification', () => {
    describe('checksum verification', () => {
      it('should verify correct checksums', async () => {
        const testFile = path.join(tempDir, 'checksum-test.txt');
        const content = 'test content for checksum';
        await fs.writeFile(testFile, content);

        // Calculate expected hash
        const expectedHash = IntegrityVerifier.generateChecksum(content);

        const isValid = await IntegrityVerifier.verifyChecksum(testFile, expectedHash);
        expect(isValid).to.be.true;
      });

      it('should reject incorrect checksums', async () => {
        const testFile = path.join(tempDir, 'tampered-test.txt');
        const content = 'original content';
        await fs.writeFile(testFile, content);

        const wrongHash = 'test-fake-hash-for-security-validation-12345';

        const isValid = await IntegrityVerifier.verifyChecksum(testFile, wrongHash);
        expect(isValid).to.be.false;
      });

      it('should handle different hash algorithms', () => {
        const content = 'test content';
        const algorithms = ['sha256', 'sha512', 'md5'];

        algorithms.forEach(algo => {
          const hash = IntegrityVerifier.generateChecksum(content, algo);
          expect(hash).to.be.a('string');
          expect(hash.length).to.be.greaterThan(0);
        });
      });
    });
  });

  describe('Integration Tests', () => {
    it('should prevent command injection in real scenario', async () => {
      // Test that malicious mode parameter cannot execute commands
      const maliciousModes = [
        'summary; rm -rf /',
        'standard && whoami',
        'detailed | cat /etc/passwd'
      ];

      const executor = new SafeCommandExecutor();

      for (const mode of maliciousModes) {
        try {
          // This should fail at validation stage
          InputValidator.validateMode(mode);
          expect.fail(`Should have rejected malicious mode: ${mode}`);
        } catch (error) {
          expect(error.message).to.contain('Invalid');
        }
      }
    });

    it('should prevent path traversal in directory search', () => {
      // Test that findClaudeDirectory cannot be exploited
      const maliciousPaths = [
        '../../../etc',
        '../../../../../../root',
        '/etc/../../../etc/passwd'
      ];

      maliciousPaths.forEach(path => {
        try {
          InputValidator.validatePath(path);
          expect.fail(`Should have rejected traversal path: ${path}`);
        } catch (error) {
          expect(error.message).to.contain('traversal');
        }
      });
    });

    it('should ensure all security layers work together', async () => {
      // End-to-end test that combines multiple security measures
      const testScenario = {
        mode: 'summary; rm -rf /',
        path: '../../../etc/passwd',
        json: '{"key": malicious_value}'
      };

      // Each layer should reject the malicious input
      expect(() => InputValidator.validateMode(testScenario.mode)).to.throw();
      expect(() => InputValidator.validatePath(testScenario.path)).to.throw();
      expect(() => InputValidator.validateJSON(testScenario.json)).to.throw();
    });
  });
});

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Running security tests...');
  // Test runner would be configured separately
}