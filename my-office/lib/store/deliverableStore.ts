import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Deliverable } from '@/lib/types/deliverable';

/**
 * Deliverable Store State
 */
interface DeliverableState {
  deliverables: Deliverable[];

  // Actions
  addDeliverable: (deliverable: Deliverable) => void;
  getDeliverablesByMission: (missionId: string) => Deliverable[];
  getDeliverablesByAgent: (agentId: string) => Deliverable[];
  getDeliverableById: (id: string) => Deliverable | undefined;
  clearDeliverables: () => void;
  removeDeliverable: (id: string) => void;
}

/**
 * Deliverable Store
 * Manages mission deliverables (code, documents, analysis, plans)
 */
export const useDeliverableStore = create<DeliverableState>()(
  devtools(
    (set, get) => ({
      deliverables: [],

      addDeliverable: (deliverable) => {
        set((state) => ({
          deliverables: [...state.deliverables, deliverable],
        }));
      },

      getDeliverablesByMission: (missionId) => {
        return get().deliverables.filter((d) => d.missionId === missionId);
      },

      getDeliverablesByAgent: (agentId) => {
        return get().deliverables.filter((d) => d.agentId === agentId);
      },

      getDeliverableById: (id) => {
        return get().deliverables.find((d) => d.id === id);
      },

      clearDeliverables: () => {
        set({ deliverables: [] });
      },

      removeDeliverable: (id) => {
        set((state) => ({
          deliverables: state.deliverables.filter((d) => d.id !== id),
        }));
      },
    }),
    {
      name: 'deliverable-store',
    }
  )
);
