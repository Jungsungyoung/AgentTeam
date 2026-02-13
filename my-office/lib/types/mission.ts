export type MissionStatus = 'pending' | 'processing' | 'completed';

export interface Mission {
  id: string;
  content: string;
  status: MissionStatus;
  assignedAgents: string[];
  createdAt: Date;
  completedAt?: Date;
  deliverables?: string[]; // Array of deliverable IDs
}
