/**
 * Claude Code CLI Wrapper
 *
 * Manages Claude Code CLI as a child process, enabling:
 * - Team creation and management
 * - Task assignment
 * - Message sending
 * - Real-time output parsing and event streaming
 */

import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import {
  ClaudeCodeConfig,
  TeamProcess,
  TeamEvent,
  TeamEventType,
  CreateTeamOptions,
  CreateTaskOptions,
  SendMessageOptions,
  CLIResponse,
} from './types';

export class ClaudeCodeWrapper extends EventEmitter {
  private config: Required<ClaudeCodeConfig>;
  private teams: Map<string, TeamProcess>;

  constructor(config: ClaudeCodeConfig = {}) {
    super();

    // Default configuration
    this.config = {
      cliPath: config.cliPath || 'claude-code',
      workingDirectory: config.workingDirectory || process.cwd(),
      timeout: config.timeout || 300000, // 5 minutes default
      maxBufferSize: config.maxBufferSize || 10 * 1024 * 1024, // 10MB
    };

    this.teams = new Map();
  }

  /**
   * Create a new agent team
   *
   * @param options Team creation options
   * @returns CLI response with team creation result
   */
  async createTeam(
    options: CreateTeamOptions
  ): Promise<CLIResponse<{ teamName: string }>> {
    const { teamName, agents = [], maxAgents = 5 } = options;

    try {
      // Check if team already exists
      if (this.teams.has(teamName)) {
        return {
          success: false,
          error: `Team "${teamName}" already exists`,
        };
      }

      // Build CLI command
      const args = ['team', 'create', teamName];

      if (agents.length > 0) {
        args.push('--agents', agents.join(','));
      }

      if (maxAgents) {
        args.push('--max-agents', maxAgents.toString());
      }

      // Execute command
      const result = await this.executeCommand(args);

      if (result.success) {
        // Create team process entry
        const teamProcess: TeamProcess = {
          teamName,
          process: null, // Will be set when monitoring starts
          status: 'running',
          createdAt: new Date(),
          events: [],
        };

        this.teams.set(teamName, teamProcess);

        // Emit team created event
        this.emitTeamEvent({
          type: 'TEAM_CREATED',
          timestamp: new Date(),
          data: { teamName, agents },
        });

        return {
          success: true,
          data: { teamName },
          rawOutput: result.rawOutput,
        };
      }

      return {
        success: false,
        error: result.error || 'Failed to create team',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.emitTeamEvent({
        type: 'TEAM_ERROR',
        timestamp: new Date(),
        data: { error: errorMessage, teamName },
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Create a task for the team
   *
   * @param options Task creation options
   * @returns CLI response with task creation result
   */
  async createTask(
    options: CreateTaskOptions
  ): Promise<CLIResponse<{ taskId: string }>> {
    const { teamName, subject, description, activeForm } = options;

    try {
      if (!this.teams.has(teamName)) {
        return {
          success: false,
          error: `Team "${teamName}" not found`,
        };
      }

      const args = [
        'team',
        teamName,
        'task',
        'create',
        '--subject',
        subject,
        '--description',
        description,
      ];

      if (activeForm) {
        args.push('--active-form', activeForm);
      }

      const result = await this.executeCommand(args);

      if (result.success) {
        this.emitTeamEvent({
          type: 'TASK_CREATED',
          timestamp: new Date(),
          data: { teamName, subject },
        });

        return {
          success: true,
          data: { taskId: 'task-' + Date.now() }, // TODO: Parse actual taskId from CLI output
          rawOutput: result.rawOutput,
        };
      }

      return {
        success: false,
        error: result.error || 'Failed to create task',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Send a message to an agent
   *
   * @param options Message sending options
   * @returns CLI response
   */
  async sendMessage(
    options: SendMessageOptions
  ): Promise<CLIResponse<void>> {
    const { teamName, recipient, message, type = 'message' } = options;

    try {
      if (!this.teams.has(teamName)) {
        return {
          success: false,
          error: `Team "${teamName}" not found`,
        };
      }

      const args = [
        'team',
        teamName,
        'message',
        'send',
        '--recipient',
        recipient,
        '--message',
        message,
        '--type',
        type,
      ];

      const result = await this.executeCommand(args);

      return {
        success: result.success,
        error: result.error,
        rawOutput: result.rawOutput,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Monitor team activity by parsing CLI output
   *
   * @param teamName Team to monitor
   * @returns Promise that resolves when monitoring starts
   */
  async monitorTeam(teamName: string): Promise<void> {
    const team = this.teams.get(teamName);

    if (!team) {
      throw new Error(`Team "${teamName}" not found`);
    }

    // Spawn process to monitor team output
    const args = ['team', teamName, 'monitor', '--format', 'json'];

    const childProcess = spawn(this.config.cliPath, args, {
      cwd: this.config.workingDirectory,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });

    team.process = childProcess;

    // Parse stdout for events
    childProcess.stdout?.on('data', (data: Buffer) => {
      const output = data.toString();
      this.parseOutput(teamName, output);
    });

    // Handle stderr
    childProcess.stderr?.on('data', (data: Buffer) => {
      const error = data.toString();
      this.emitTeamEvent({
        type: 'STDERR',
        timestamp: new Date(),
        data: { teamName, error },
        rawOutput: error,
      });
    });

    // Handle process exit
    childProcess.on('exit', (code, signal) => {
      const teamData = this.teams.get(teamName);
      if (teamData) {
        teamData.status = code === 0 ? 'stopped' : 'error';
      }

      this.emit('teamExit', { teamName, code, signal });
    });

    // Handle process errors
    childProcess.on('error', (error: Error) => {
      const teamData = this.teams.get(teamName);
      if (teamData) {
        teamData.status = 'error';
      }

      this.emitTeamEvent({
        type: 'TEAM_ERROR',
        timestamp: new Date(),
        data: { teamName, error: error.message },
      });
    });
  }

  /**
   * Shutdown a team and cleanup resources
   *
   * @param teamName Team to shutdown
   */
  async shutdownTeam(teamName: string): Promise<void> {
    const team = this.teams.get(teamName);

    if (!team) {
      throw new Error(`Team "${teamName}" not found`);
    }

    // Kill the process if it exists
    if (team.process) {
      team.process.kill('SIGTERM');

      // Force kill after timeout
      setTimeout(() => {
        if (team.process && !team.process.killed) {
          team.process.kill('SIGKILL');
        }
      }, 5000);
    }

    // Remove from teams map
    this.teams.delete(teamName);
  }

  /**
   * Shutdown all teams
   */
  async shutdownAll(): Promise<void> {
    const teamNames = Array.from(this.teams.keys());

    await Promise.all(
      teamNames.map((teamName) => this.shutdownTeam(teamName))
    );
  }

  /**
   * Get status of a team
   *
   * @param teamName Team name
   * @returns Team process info or undefined
   */
  getTeamStatus(teamName: string): TeamProcess | undefined {
    return this.teams.get(teamName);
  }

  /**
   * Get all active teams
   *
   * @returns Array of team names
   */
  getActiveTeams(): string[] {
    return Array.from(this.teams.keys());
  }

  /**
   * Execute a CLI command and return result
   *
   * @private
   * @param args Command arguments
   * @returns CLI response
   */
  private executeCommand(args: string[]): Promise<CLIResponse> {
    return new Promise((resolve, reject) => {
      const childProcess = spawn(this.config.cliPath, args, {
        cwd: this.config.workingDirectory,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
        timeout: this.config.timeout,
      });

      let stdout = '';
      let stderr = '';

      childProcess.stdout?.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      childProcess.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      childProcess.on('exit', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            rawOutput: stdout,
          });
        } else {
          resolve({
            success: false,
            error: stderr || `Process exited with code ${code}`,
            rawOutput: stdout,
          });
        }
      });

      childProcess.on('error', (error) => {
        reject(error);
      });

      // Handle timeout
      setTimeout(() => {
        if (!childProcess.killed) {
          childProcess.kill('SIGTERM');
          reject(new Error('Command timeout'));
        }
      }, this.config.timeout);
    });
  }

  /**
   * Parse CLI output and emit events
   *
   * Supports both JSON and plain text output formats.
   * JSON format: {"type": "AGENT_MESSAGE", "data": {...}}
   * Plain text: Extracted using pattern matching
   *
   * @private
   * @param teamName Team name
   * @param output Raw output string
   */
  private parseOutput(teamName: string, output: string): void {
    const team = this.teams.get(teamName);
    if (!team) return;

    // Split output by newlines to process line by line
    const lines = output.split('\n').filter(line => line.trim().length > 0);

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Try to parse as JSON first
      if (this.tryParseJSON(teamName, team, trimmedLine)) {
        continue;
      }

      // Fallback: Parse as plain text
      this.parsePlainText(teamName, team, trimmedLine);
    }

    // Store raw output event for debugging
    const rawEvent: TeamEvent = {
      type: 'STDOUT',
      timestamp: new Date(),
      data: { teamName, output },
      rawOutput: output,
    };

    team.events.push(rawEvent);
    this.emit('teamOutput', rawEvent);
    this.emit(`team:${teamName}:output`, rawEvent);
  }

  /**
   * Try to parse line as JSON and emit structured event
   *
   * @private
   * @param teamName Team name
   * @param team Team process
   * @param line Line to parse
   * @returns true if successfully parsed as JSON
   */
  private tryParseJSON(teamName: string, team: TeamProcess, line: string): boolean {
    try {
      const json = JSON.parse(line);

      // Validate JSON structure
      if (!json.type || typeof json.type !== 'string') {
        return false;
      }

      // Map JSON type to TeamEventType
      const eventType = this.mapEventType(json.type);
      if (!eventType) {
        return false;
      }

      // Create structured event
      const event: TeamEvent = {
        type: eventType,
        timestamp: new Date(),
        data: json.data || {},
        rawOutput: line,
      };

      team.events.push(event);
      this.emitTeamEvent(event);

      return true;
    } catch {
      // Not a valid JSON, return false to try plain text parsing
      return false;
    }
  }

  /**
   * Parse plain text output and extract events
   *
   * @private
   * @param teamName Team name
   * @param team Team process
   * @param line Line to parse
   */
  private parsePlainText(teamName: string, team: TeamProcess, line: string): void {
    // Pattern 1: Agent message - "[AGENT_ID] message text"
    const agentMsgMatch = line.match(/^\[(\w+)\]\s+(.+)$/);
    if (agentMsgMatch) {
      const [, agentId, message] = agentMsgMatch;
      const event: TeamEvent = {
        type: 'AGENT_MESSAGE',
        timestamp: new Date(),
        data: { agentId: agentId.toLowerCase(), message },
        rawOutput: line,
      };
      team.events.push(event);
      this.emitTeamEvent(event);
      return;
    }

    // Pattern 2: Task update - "Task #123: status"
    const taskMatch = line.match(/^Task\s+#(\d+):\s+(\w+)/i);
    if (taskMatch) {
      const [, taskId, status] = taskMatch;
      const event: TeamEvent = {
        type: 'TASK_UPDATED',
        timestamp: new Date(),
        data: { taskId, status: status.toLowerCase() },
        rawOutput: line,
      };
      team.events.push(event);
      this.emitTeamEvent(event);
      return;
    }

    // Pattern 3: Agent status - "Agent LEO: status"
    const statusMatch = line.match(/^Agent\s+(\w+):\s+(\w+)/i);
    if (statusMatch) {
      const [, agentId, status] = statusMatch;
      const event: TeamEvent = {
        type: 'AGENT_STATUS',
        timestamp: new Date(),
        data: { agentId: agentId.toLowerCase(), status: status.toLowerCase() },
        rawOutput: line,
      };
      team.events.push(event);
      this.emitTeamEvent(event);
      return;
    }

    // Pattern 4: Team created - "Team 'name' created"
    const teamCreatedMatch = line.match(/^Team\s+'([^']+)'\s+created/i);
    if (teamCreatedMatch) {
      const [, createdTeamName] = teamCreatedMatch;
      const event: TeamEvent = {
        type: 'TEAM_CREATED',
        timestamp: new Date(),
        data: { teamName: createdTeamName, agents: [] },
        rawOutput: line,
      };
      team.events.push(event);
      this.emitTeamEvent(event);
      return;
    }

    // If no pattern matches, emit as generic STDOUT
    const event: TeamEvent = {
      type: 'STDOUT',
      timestamp: new Date(),
      data: { teamName, message: line },
      rawOutput: line,
    };
    team.events.push(event);
    this.emit('teamOutput', event);
  }

  /**
   * Map JSON event type string to TeamEventType
   *
   * @private
   * @param type Event type string from JSON
   * @returns TeamEventType or null if invalid
   */
  private mapEventType(type: string): TeamEventType | null {
    const validTypes: TeamEventType[] = [
      'TEAM_CREATED',
      'TEAM_ERROR',
      'AGENT_MESSAGE',
      'AGENT_STATUS',
      'TASK_CREATED',
      'TASK_UPDATED',
      'STDOUT',
      'STDERR',
    ];

    const normalized = type.toUpperCase() as TeamEventType;
    return validTypes.includes(normalized) ? normalized : null;
  }

  /**
   * Emit a team event to all listeners
   *
   * @private
   * @param event Team event
   */
  private emitTeamEvent(event: TeamEvent): void {
    this.emit('teamEvent', event);

    // Also emit specific event type
    this.emit(`event:${event.type}`, event);
  }
}

// Export singleton instance for convenience
export const claudeCode = new ClaudeCodeWrapper();
