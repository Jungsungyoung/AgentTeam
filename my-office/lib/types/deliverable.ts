import type { AgentId } from './agent';

/**
 * Deliverable Types
 * Represents different types of outputs that agents can produce
 */
export type DeliverableType = 'code' | 'document' | 'analysis' | 'plan';

/**
 * Deliverable Interface
 * Represents a concrete output/artifact from an agent
 */
export interface Deliverable {
  id: string;
  type: DeliverableType;
  title: string;
  content: string;
  agentId: AgentId;
  missionId: string;
  createdAt: Date;
  metadata?: {
    language?: string; // For code deliverables (e.g., 'typescript', 'javascript')
    format?: string; // For document deliverables (e.g., 'markdown', 'plain')
    tags?: string[]; // Categorization tags
    fileExtension?: string; // For download functionality
  };
}

/**
 * Deliverable Format Tags
 * Common format identifiers for deliverables
 */
export const DELIVERABLE_FORMATS = {
  code: ['typescript', 'javascript', 'python', 'json', 'html', 'css'],
  document: ['markdown', 'plain', 'html'],
  analysis: ['report', 'metrics', 'findings'],
  plan: ['roadmap', 'tasks', 'architecture'],
} as const;

/**
 * Helper to create a new deliverable
 */
export function createDeliverable(
  type: DeliverableType,
  title: string,
  content: string,
  agentId: AgentId,
  missionId: string,
  metadata?: Deliverable['metadata']
): Deliverable {
  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    content,
    agentId,
    missionId,
    createdAt: new Date(),
    metadata,
  };
}
