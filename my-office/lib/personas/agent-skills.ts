import type { AgentId } from '@/lib/types/agent';
import fs from 'fs/promises';
import path from 'path';

/**
 * Agent Skill Interface
 * Represents a specialized knowledge document for an agent
 */
export interface AgentSkill {
  id: string;
  agentId: AgentId;
  skillName: string;
  skillDocument: string; // Markdown format
  priority: number; // 1 (highest) to 10 (lowest)
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Skill Library Interface
 * Collection of skills organized by agent
 */
export interface SkillLibrary {
  leo: AgentSkill[];
  momo: AgentSkill[];
  alex: AgentSkill[];
  boss: AgentSkill[];
}

/**
 * Load skills for a specific agent from the skills directory
 * @param agentId - The agent to load skills for
 * @param skillsDir - Base directory for skills (defaults to project root/skills)
 * @returns Array of agent skills
 */
export async function loadAgentSkills(
  agentId: AgentId,
  skillsDir?: string
): Promise<AgentSkill[]> {
  // Default to skills/ directory in project root
  const baseDir =
    skillsDir || path.join(process.cwd(), '..', 'skills', agentId);

  try {
    // Check if directory exists
    await fs.access(baseDir);

    // Read all .md files in the agent's directory
    const files = await fs.readdir(baseDir);
    const mdFiles = files.filter((file) => file.endsWith('.md'));

    // Load each skill document
    const skills: AgentSkill[] = [];
    for (const file of mdFiles) {
      const filePath = path.join(baseDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const skillName = file.replace('.md', '');

      skills.push({
        id: `${agentId}-${skillName}`,
        agentId,
        skillName,
        skillDocument: content,
        priority: extractPriorityFromContent(content) || 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Sort by priority (lower number = higher priority)
    return skills.sort((a, b) => a.priority - b.priority);
  } catch (error) {
    // If directory doesn't exist or can't be read, return empty array
    console.warn(`No skills found for ${agentId}:`, error);
    return [];
  }
}

/**
 * Extract priority from skill document frontmatter or metadata
 * Looks for "Priority: N" in the first few lines
 */
function extractPriorityFromContent(content: string): number | null {
  const lines = content.split('\n').slice(0, 10); // Check first 10 lines
  for (const line of lines) {
    const match = line.match(/priority:\s*(\d+)/i);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  return null;
}

/**
 * Load all skills for all agents
 * @param skillsDir - Base directory for skills
 * @returns Complete skill library
 */
export async function loadAllAgentSkills(
  skillsDir?: string
): Promise<SkillLibrary> {
  const [leo, momo, alex, boss] = await Promise.all([
    loadAgentSkills('leo', skillsDir),
    loadAgentSkills('momo', skillsDir),
    loadAgentSkills('alex', skillsDir),
    loadAgentSkills('boss', skillsDir),
  ]);

  return { leo, momo, alex, boss };
}

/**
 * Format skills into a system prompt section
 * @param skills - Array of skills for an agent
 * @returns Formatted markdown string for system prompt
 */
export function formatSkillsForPrompt(skills: AgentSkill[]): string {
  if (skills.length === 0) {
    return '';
  }

  let formatted = '\n---\n## Your Skills Library\n\n';
  formatted +=
    'You have access to the following specialized skills and knowledge:\n\n';

  skills.forEach((skill, index) => {
    formatted += `### Skill ${index + 1}: ${skill.skillName}\n`;
    formatted += `${skill.skillDocument}\n\n`;
  });

  formatted +=
    'When working on tasks, refer to these skills to provide optimized, high-quality results.\n';

  return formatted;
}

/**
 * Create a complete system prompt with persona and skills
 * @param personaPrompt - Base persona system prompt
 * @param skills - Agent's skills
 * @returns Complete system prompt
 */
export function createSystemPromptWithSkills(
  personaPrompt: string,
  skills: AgentSkill[]
): string {
  return personaPrompt + formatSkillsForPrompt(skills);
}
