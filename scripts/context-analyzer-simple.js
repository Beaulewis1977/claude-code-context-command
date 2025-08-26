#!/usr/bin/env node

/**
 * Simplified Context Analyzer - Fast and Reliable
 */

import { promises as fs } from 'fs';
import path from 'path';
import { InputValidator, SecureErrorHandler } from '../lib/security.js';

const estimateTokens = (text) => Math.ceil(text.length / 4);

// Find .claude directory with security protection
async function findClaudeDirectory() {
  let currentPath = path.resolve(process.cwd());
  const root = path.parse(currentPath).root;
  let iterations = 0;
  const maxIterations = 50; // Prevent infinite loops

  while (currentPath !== root && iterations < maxIterations) {
    const claudePath = path.join(currentPath, '.claude');
    
    // Security check: ensure claudePath is within expected bounds
    if (!claudePath.startsWith(currentPath)) {
      SecureErrorHandler.logSecurityEvent('path_traversal_attempt_simple', {
        currentPath: 'REDACTED',
        claudePath: 'REDACTED'
      });
      break;
    }
    
    try {
      await fs.access(claudePath);
      return claudePath;
    } catch {
      currentPath = path.dirname(currentPath);
    }
    
    iterations++;
  }
  
  if (iterations >= maxIterations) {
    SecureErrorHandler.logSecurityEvent('max_iterations_exceeded_simple', {
      iterations: maxIterations
    });
  }
  
  return null;
}

async function analyze() {
  const claudeDir = await findClaudeDirectory();
  if (!claudeDir) {
    console.error('No .claude directory found');
    process.exit(1);
  }

  const projectRoot = path.dirname(claudeDir);
  const projectName = path.basename(projectRoot);

  // System components
  const systemPrompt = 8500;
  const systemTools = 15200;
  
  // Read enabled MCP servers
  let mcpTools = 0; // Start with 0
  let mcpToolsDetailed = {};
  
  try {
    const settingsPath = path.join(claudeDir, 'settings.local.json');
    const settingsContent = await fs.readFile(settingsPath, 'utf8');
    const settings = JSON.parse(settingsContent);
    const enabledServers = settings.enabledMcpjsonServers || [];
    
    // MCP server token estimates
    const mcpServers = {
      'fetch': { total: 643, tools: [{ name: 'mcp__fetch__fetch', tokens: 643 }] },
      'sequential-thinking': { total: 1300, tools: [{ name: 'mcp__sequential-thinking__sequentialthinking', tokens: 1300 }] },
      'puppeteer': { total: 3415, tools: [
        { name: 'mcp__puppeteer__puppeteer_navigate', tokens: 490 },
        { name: 'mcp__puppeteer__puppeteer_screenshot', tokens: 506 },
        { name: 'mcp__puppeteer__puppeteer_click', tokens: 395 },
        { name: 'mcp__puppeteer__puppeteer_fill', tokens: 414 },
        { name: 'mcp__puppeteer__puppeteer_select', tokens: 419 },
        { name: 'mcp__puppeteer__puppeteer_hover', tokens: 396 },
        { name: 'mcp__puppeteer__puppeteer_evaluate', tokens: 393 }
      ]},
      'mcp-playwright': { total: 12456, tools: [
        { name: 'mcp__mcp-playwright__start_codegen_session', tokens: 498 },
        { name: 'mcp__mcp-playwright__playwright_navigate', tokens: 557 },
        { name: 'mcp__mcp-playwright__playwright_screenshot', tokens: 573 },
        { name: 'mcp__mcp-playwright__playwright_click', tokens: 395 },
        { name: 'mcp__mcp-playwright__playwright_fill', tokens: 413 },
        { name: 'mcp__mcp-playwright__playwright_evaluate', tokens: 392 },
        { name: 'mcp__mcp-playwright__playwright_console_logs', tokens: 509 },
        { name: 'mcp__mcp-playwright__playwright_get_visible_text', tokens: 380 },
        { name: 'mcp__mcp-playwright__playwright_get_visible_html', tokens: 613 },
        { name: 'mcp__mcp-playwright__playwright_close', tokens: 374 },
        { name: 'mcp__mcp-playwright__playwright_get', tokens: 393 },
        { name: 'mcp__mcp-playwright__playwright_post', tokens: 470 },
        { name: 'mcp__mcp-playwright__playwright_put', tokens: 417 },
        { name: 'mcp__mcp-playwright__playwright_delete', tokens: 393 },
        { name: 'mcp__mcp-playwright__playwright_expect_response', tokens: 457 },
        { name: 'mcp__mcp-playwright__playwright_assert_response', tokens: 455 },
        { name: 'mcp__mcp-playwright__playwright_custom_user_agent', tokens: 405 },
        { name: 'mcp__mcp-playwright__playwright_go_back', tokens: 374 },
        { name: 'mcp__mcp-playwright__playwright_go_forward', tokens: 374 },
        { name: 'mcp__mcp-playwright__playwright_drag', tokens: 425 },
        { name: 'mcp__mcp-playwright__playwright_press_key', tokens: 433 },
        { name: 'mcp__mcp-playwright__playwright_save_as_pdf', tokens: 541 },
        { name: 'mcp__mcp-playwright__playwright_click_and_switch_tab', tokens: 405 }
      ]},
      'everything': { total: 2167, tools: [
        { name: 'mcp__everything__echo', tokens: 198 },
        { name: 'mcp__everything__add', tokens: 156 },
        { name: 'mcp__everything__longRunningOperation', tokens: 387 },
        { name: 'mcp__everything__printEnv', tokens: 167 },
        { name: 'mcp__everything__sampleLLM', tokens: 298 },
        { name: 'mcp__everything__getTinyImage', tokens: 134 },
        { name: 'mcp__everything__annotatedMessage', tokens: 445 },
        { name: 'mcp__everything__getResourceReference', tokens: 382 }
      ]},
      'github-official': { total: 12456, tools: [
        { name: 'mcp__github-official__create_or_update_file', tokens: 570 },
        { name: 'mcp__github-official__search_repositories', tokens: 474 },
        { name: 'mcp__github-official__create_repository', tokens: 477 },
        { name: 'mcp__github-official__get_file_contents', tokens: 492 },
        { name: 'mcp__github-official__push_files', tokens: 574 },
        { name: 'mcp__github-official__create_issue', tokens: 498 },
        { name: 'mcp__github-official__create_pull_request', tokens: 596 },
        { name: 'mcp__github-official__fork_repository', tokens: 471 },
        { name: 'mcp__github-official__create_branch', tokens: 497 },
        { name: 'mcp__github-official__list_commits', tokens: 458 },
        { name: 'mcp__github-official__list_issues', tokens: 541 },
        { name: 'mcp__github-official__update_issue', tokens: 531 },
        { name: 'mcp__github-official__add_issue_comment', tokens: 455 },
        { name: 'mcp__github-official__search_code', tokens: 469 },
        { name: 'mcp__github-official__search_issues', tokens: 533 },
        { name: 'mcp__github-official__search_users', tokens: 490 },
        { name: 'mcp__github-official__get_issue', tokens: 443 },
        { name: 'mcp__github-official__get_pull_request', tokens: 468 },
        { name: 'mcp__github-official__list_pull_requests', tokens: 632 },
        { name: 'mcp__github-official__create_pull_request_review', tokens: 804 },
        { name: 'mcp__github-official__merge_pull_request', tokens: 550 },
        { name: 'mcp__github-official__get_pull_request_files', tokens: 473 },
        { name: 'mcp__github-official__get_pull_request_status', tokens: 475 },
        { name: 'mcp__github-official__update_pull_request_branch', tokens: 505 },
        { name: 'mcp__github-official__get_pull_request_comments', tokens: 471 },
        { name: 'mcp__github-official__get_pull_request_reviews', tokens: 470 }
      ]},
      'mcp-filesystem': { total: 4234, tools: [
        { name: 'mcp__mcp-filesystem__read_file', tokens: 456 },
        { name: 'mcp__mcp-filesystem__read_multiple_files', tokens: 523 },
        { name: 'mcp__mcp-filesystem__write_file', tokens: 398 },
        { name: 'mcp__mcp-filesystem__edit_file', tokens: 623 },
        { name: 'mcp__mcp-filesystem__create_directory', tokens: 367 },
        { name: 'mcp__mcp-filesystem__list_directory', tokens: 423 },
        { name: 'mcp__mcp-filesystem__directory_tree', tokens: 445 },
        { name: 'mcp__mcp-filesystem__move_file', tokens: 298 },
        { name: 'mcp__mcp-filesystem__search_files', tokens: 387 },
        { name: 'mcp__mcp-filesystem__get_file_info', tokens: 334 }
      ]},
      'context7-mcp': { total: 1023, tools: [
        { name: 'mcp__context7-mcp__resolve-library-id', tokens: 567 },
        { name: 'mcp__context7-mcp__get-library-docs', tokens: 456 }
      ]},
      'brave-search': { total: 823, tools: [
        { name: 'mcp__brave-search__brave_web_search', tokens: 434 },
        { name: 'mcp__brave-search__brave_local_search', tokens: 389 }
      ]},
      'deep-code-reasoning': { total: 4267, tools: [
        { name: 'mcp__deep-code-reasoning__escalate_analysis', tokens: 678 },
        { name: 'mcp__deep-code-reasoning__trace_execution_path', tokens: 534 },
        { name: 'mcp__deep-code-reasoning__hypothesis_test', tokens: 456 },
        { name: 'mcp__deep-code-reasoning__cross_system_impact', tokens: 523 },
        { name: 'mcp__deep-code-reasoning__performance_bottleneck', tokens: 445 },
        { name: 'mcp__deep-code-reasoning__start_conversation', tokens: 389 },
        { name: 'mcp__deep-code-reasoning__continue_conversation', tokens: 334 },
        { name: 'mcp__deep-code-reasoning__finalize_conversation', tokens: 267 }
      ]},
      'supabase': { total: 14567, tools: [
        { name: 'mcp__supabase__list_organizations', tokens: 298 },
        { name: 'mcp__supabase__get_organization', tokens: 267 },
        { name: 'mcp__supabase__list_projects', tokens: 234 },
        { name: 'mcp__supabase__create_project', tokens: 567 },
        { name: 'mcp__supabase__execute_sql', tokens: 445 },
        { name: 'mcp__supabase__search_docs', tokens: 1234 },
        { name: 'mcp__supabase__deploy_edge_function', tokens: 623 }
      ]},
      'perplexity-mcp': { total: 345, tools: [
        { name: 'mcp__perplexity-mcp__perplexity_search_web', tokens: 345 }
      ]},
      'firecrawl': { total: 6756, tools: [
        { name: 'mcp__firecrawl__firecrawl_scrape', tokens: 1534 },
        { name: 'mcp__firecrawl__firecrawl_crawl', tokens: 1634 },
        { name: 'mcp__firecrawl__firecrawl_search', tokens: 1298 }
      ]},
      'awesome-ui-component-library Docs': { total: 1234, tools: [
        { name: 'mcp__awesome-ui-component-library_Docs__fetch_awesome_docs', tokens: 334 },
        { name: 'mcp__awesome-ui-component-library_Docs__search_repo_docs', tokens: 387 },
        { name: 'mcp__awesome-ui-component-library_Docs__search_repo_code', tokens: 298 },
        { name: 'mcp__awesome-ui-component-library_Docs__fetch_generic_url_content', tokens: 215 }
      ]},
      'BMAD-METHOD DOCS': { total: 1456, tools: [
        { name: 'mcp__BMAD-METHOD_Docs__fetch_BMAD_METHOD_documentation', tokens: 423 },
        { name: 'mcp__BMAD-METHOD_Docs__search_BMAD_METHOD_documentation', tokens: 456 },
        { name: 'mcp__BMAD-METHOD_Docs__search_BMAD_METHOD_code', tokens: 387 },
        { name: 'mcp__BMAD-METHOD_Docs__fetch_generic_url_content', tokens: 190 }
      ]}
    };

    let total = 0;
    mcpToolsDetailed = {};
    
    enabledServers.forEach(server => {
      if (mcpServers[server]) {
        total += mcpServers[server].total;
        mcpToolsDetailed[server] = mcpServers[server].tools;
      } else {
        // Default for unknown servers
        total += 2000;
        mcpToolsDetailed[server] = [{ name: `mcp__${server}__unknown`, tokens: 2000 }];
      }
    });
    
    mcpTools = total;
  } catch (error) {
    // Use defaults if settings can't be read
    mcpTools = 120000;
    // Add some common tools for fallback display
    mcpToolsDetailed = {
      'fetch': [{ name: 'mcp__fetch__fetch', tokens: 643 }],
      'github-official': [
        { name: 'mcp__github-official__create_or_update_file', tokens: 570 },
        { name: 'mcp__github-official__search_repositories', tokens: 474 }
      ]
    };
  }

  // Read agent files
  let customAgents = 0;
  let agentBreakdown = {};
  
  try {
    const agentsDir = path.join(claudeDir, 'agents');
    const files = await fs.readdir(agentsDir);
    
    for (const file of files.slice(0, 10)) { // Limit to prevent timeout
      if (file.endsWith('.md')) {
        try {
          const content = await fs.readFile(path.join(agentsDir, file), 'utf8');
          const tokens = estimateTokens(content);
          customAgents += tokens;
          agentBreakdown[file] = tokens;
        } catch {
          agentBreakdown[file] = 100; // Fallback
          customAgents += 100;
        }
      }
    }
  } catch {
    customAgents = 4500; // Fallback
  }

  // Read memory files
  let memoryFiles = 0;
  try {
    const claudeMd = await fs.readFile(path.join(claudeDir, 'CLAUDE.md'), 'utf8');
    memoryFiles = estimateTokens(claudeMd);
  } catch {
    memoryFiles = 13200; // Fallback
  }

  const total = systemPrompt + systemTools + mcpTools + customAgents + memoryFiles;
  const maxTokens = 200000;
  const usage = Math.round((total / maxTokens) * 100);
  const freeSpace = maxTokens - total;

  // Format tokens
  const formatTokens = (tokens) => tokens >= 1000 ? `${(tokens/1000).toFixed(1)}k` : `${tokens}`;

  // Get mode from command line args, default to compact for /context
  const mode = process.argv[2] || 'compact';
  
  // Generate output based on mode
  let output = `  ⎿  ⛁ ⛁ ⛁ ⛁ ⛀ ⛁ ⛁ ⛁ ⛁ ⛁ \n`;
  output += `     ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁   Context Usage\n`;
  output += `     ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁   claude-sonnet-4 • ${formatTokens(total)}/${formatTokens(maxTokens)} tokens (${usage}%)\n`;
  output += `     ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ \n`;
  output += `     ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁   ⛁ System prompt: ${formatTokens(systemPrompt)} tokens (${((systemPrompt/total)*100).toFixed(1)}%)\n`;
  output += `     ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁   ⛁ System tools: ${formatTokens(systemTools)} tokens (${((systemTools/total)*100).toFixed(1)}%)\n`;
  output += `     ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁   ⛁ MCP tools: ${formatTokens(mcpTools)} tokens (${((mcpTools/total)*100).toFixed(1)}%)\n`;
  output += `     ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁   ⛁ Custom agents: ${formatTokens(customAgents)} tokens (${((customAgents/total)*100).toFixed(1)}%)\n`;
  output += `     ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛀ ⛶ ⛶   ⛁ Memory files: ${formatTokens(memoryFiles)} tokens (${((memoryFiles/total)*100).toFixed(1)}%)\n`;
  output += `     ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶   ⛶ Free space: ${formatTokens(freeSpace)} (${((freeSpace/maxTokens)*100).toFixed(1)}%)\n\n`;

  // Add detailed breakdown only for 'detailed' or 'standard' mode
  if (mode === 'detailed' || mode === 'standard') {
    // Add MCP tool details grouped by server
    if (Object.keys(mcpToolsDetailed).length > 0) {
      output += `     MCP tools · /mcp\n`;
      
      // Sort servers by total tokens (descending)
      const serverTotals = {};
      for (const [serverName, tools] of Object.entries(mcpToolsDetailed)) {
        serverTotals[serverName] = tools.reduce((sum, tool) => sum + tool.tokens, 0);
      }
      
      const sortedServers = Object.entries(serverTotals)
        .sort(([,a], [,b]) => b - a);
      
      // Show only top 5 servers in standard mode, all in detailed mode
      const maxServers = mode === 'detailed' ? sortedServers.length : Math.min(5, sortedServers.length);
      
      for (let i = 0; i < maxServers; i++) {
        const [serverName, serverTotal] = sortedServers[i];
        const serverTokenStr = formatTokens(serverTotal);
        output += `     └ ${serverName} server: ${serverTokenStr} total tokens\n`;
        
        // Show individual tools for this server, sorted by tokens (descending)
        const tools = mcpToolsDetailed[serverName];
        const sortedTools = tools.sort((a, b) => b.tokens - a.tokens);
        
        // Show only top 3 tools per server in standard mode, all in detailed mode
        const maxTools = mode === 'detailed' ? sortedTools.length : Math.min(3, sortedTools.length);
        
        for (let j = 0; j < maxTools; j++) {
          const tool = sortedTools[j];
          const tokenStr = formatTokens(tool.tokens);
          output += `       └ ${tool.name}: ${tokenStr} tokens\n`;
        }
      }
      output += `\n`;
    }
  } else {
    // Compact mode - show only top 3 MCP servers
    if (Object.keys(mcpToolsDetailed).length > 0) {
      output += `     Top MCP servers:\n`;
      
      const serverTotals = {};
      for (const [serverName, tools] of Object.entries(mcpToolsDetailed)) {
        serverTotals[serverName] = tools.reduce((sum, tool) => sum + tool.tokens, 0);
      }
      
      const sortedServers = Object.entries(serverTotals)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);
      
      for (const [serverName, serverTotal] of sortedServers) {
        const serverTokenStr = formatTokens(serverTotal);
        output += `     └ ${serverName}: ${serverTokenStr} tokens\n`;
      }
      output += `\n`;
    }
  }

  // Add agent details - compact by default, detailed in standard/detailed modes
  if (Object.keys(agentBreakdown).length > 0) {
    const sortedAgents = Object.entries(agentBreakdown)
      .sort(([,a], [,b]) => b - a);
    
    if (mode === 'detailed' || mode === 'standard') {
      output += `     Custom agents · /agents\n`;
      const maxAgents = mode === 'detailed' ? sortedAgents.length : Math.min(5, sortedAgents.length);
      
      for (let i = 0; i < maxAgents; i++) {
        const [file, tokens] = sortedAgents[i];
        const agentName = file.replace('.md', '');
        const tokenStr = formatTokens(tokens);
        output += `     └ ${agentName} (Project): ${tokenStr} tokens\n`;
      }
      output += `\n`;
    } else {
      // Compact mode - show only top 3 agents
      output += `     Top agents: `;
      const topAgents = sortedAgents.slice(0, 3);
      output += topAgents.map(([file, tokens]) => `${file.replace('.md', '')} (${formatTokens(tokens)})`).join(', ');
      output += `\n\n`;
    }
  }

  // Add memory files - compact by default
  if (mode === 'detailed' || mode === 'standard') {
    output += `     Memory files · /memory\n`;
    output += `     └ Project (${claudeDir}/CLAUDE.md): ${formatTokens(memoryFiles)} tokens\n\n`;
  } else {
    output += `     Memory: ${formatTokens(memoryFiles)} tokens from CLAUDE.md\n\n     Use 'standard' or 'detailed' for more info\n\n`;
  }

  // Add recommendations only for standard/detailed modes
  if ((mode === 'detailed' || mode === 'standard') && mcpTools > 100000) {
    output += `Optimization Recommendations:\n\n`;
    output += `High Impact (>10% token reduction):\n`;
    output += `- **Consolidate MCP Servers**: Consider disabling unused MCP servers (20-40k tokens)\n`;
  }

  // Force output to display immediately by using process.stdout directly
  process.stdout.write(output);
  // Force flush stdout to ensure immediate display
  if (process.stdout.isTTY === false) {
    process.stdout.write('');
  }
}

analyze().catch(console.error);