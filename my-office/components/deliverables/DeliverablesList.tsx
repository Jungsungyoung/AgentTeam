'use client';

import { useState } from 'react';
import { DeliverableCard } from './DeliverableCard';
import { DeliverableViewer } from './DeliverableViewer';
import { useDeliverableStore } from '@/lib/store/deliverableStore';
import type { Deliverable } from '@/lib/types/deliverable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DeliverablesListProps {
  missionId?: string;
  className?: string;
}

export function DeliverablesList({
  missionId,
  className,
}: DeliverablesListProps) {
  const [selectedDeliverable, setSelectedDeliverable] =
    useState<Deliverable | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);

  const getDeliverablesByMission = useDeliverableStore(
    (state) => state.getDeliverablesByMission
  );
  const allDeliverables = useDeliverableStore((state) => state.deliverables);

  const deliverables = missionId
    ? getDeliverablesByMission(missionId)
    : allDeliverables;

  const filteredDeliverables = filterType
    ? deliverables.filter((d) => d.type === filterType)
    : deliverables;

  const deliverableTypes = Array.from(
    new Set(deliverables.map((d) => d.type))
  );

  if (selectedDeliverable) {
    return (
      <DeliverableViewer
        deliverable={selectedDeliverable}
        onClose={() => setSelectedDeliverable(null)}
        className={className}
      />
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold uppercase">Deliverables</h2>
          <Badge variant="outline" className="text-lg">
            {filteredDeliverables.length} items
          </Badge>
        </div>

        {/* Filters */}
        {deliverableTypes.length > 1 && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={filterType === null ? 'default' : 'outline'}
              onClick={() => setFilterType(null)}
              className="uppercase"
            >
              All
            </Button>
            {deliverableTypes.map((type) => (
              <Button
                key={type}
                size="sm"
                variant={filterType === type ? 'default' : 'outline'}
                onClick={() => setFilterType(type)}
                className="uppercase"
              >
                {type}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Deliverables List */}
      {filteredDeliverables.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
          <div className="mb-4 text-6xl">📦</div>
          <p className="text-lg font-bold uppercase">No Deliverables Yet</p>
          <p className="text-sm">
            Deliverables will appear here when agents complete their tasks
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[600px] pr-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDeliverables.map((deliverable) => (
              <DeliverableCard
                key={deliverable.id}
                deliverable={deliverable}
                onView={() => setSelectedDeliverable(deliverable)}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
