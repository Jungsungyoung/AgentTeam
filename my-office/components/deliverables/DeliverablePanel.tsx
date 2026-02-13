'use client';

import { useState } from 'react';
import { DeliverablesList } from './DeliverablesList';
import { useDeliverableStore } from '@/lib/store/deliverableStore';
import { useMissionStore } from '@/lib/store/missionStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DeliverablePanelProps {
  className?: string;
}

export function DeliverablePanel({ className }: DeliverablePanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(
    null
  );

  const deliverables = useDeliverableStore((state) => state.deliverables);
  const missions = useMissionStore((state) => state.missions);

  const completedMissions = missions.filter((m) => m.status === 'completed');

  const deliverableCount = selectedMissionId
    ? deliverables.filter((d) => d.missionId === selectedMissionId).length
    : deliverables.length;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl uppercase">
              📦 Deliverables
            </CardTitle>
            <Badge variant="outline" className="text-sm">
              {deliverableCount} items
            </Badge>
          </div>
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            size="sm"
            variant="outline"
            className="uppercase font-bold"
          >
            {isExpanded ? '▼ Collapse' : '▲ Expand'}
          </Button>
        </div>

        {/* Mission Filter */}
        {isExpanded && completedMissions.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={selectedMissionId === null ? 'default' : 'outline'}
              onClick={() => setSelectedMissionId(null)}
              className="uppercase"
            >
              All Missions
            </Button>
            {completedMissions.map((mission) => (
              <Button
                key={mission.id}
                size="sm"
                variant={
                  selectedMissionId === mission.id ? 'default' : 'outline'
                }
                onClick={() => setSelectedMissionId(mission.id)}
                className="uppercase"
              >
                {mission.content.substring(0, 30)}
                {mission.content.length > 30 ? '...' : ''}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <DeliverablesList missionId={selectedMissionId || undefined} />
        </CardContent>
      )}
    </Card>
  );
}
