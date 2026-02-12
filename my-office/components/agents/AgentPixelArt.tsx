'use client';

import { agentPixelDataMap } from '@/lib/pixelData';
import type { AgentId, AgentStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AgentPixelArtProps {
  agentId: AgentId;
  status?: AgentStatus;
  scale?: number;
  className?: string;
}

export function AgentPixelArt({
  agentId,
  status = 'IDLE',
  scale = 3,
  className,
}: AgentPixelArtProps) {
  const pixelData = agentPixelDataMap[agentId];
  const { grid, colors } = pixelData;

  const pixelSize = scale;
  const gridSize = 16;
  const totalSize = gridSize * pixelSize;

  const getAnimationClass = () => {
    switch (status) {
      case 'MOVING':
        return 'animate-jumping';
      case 'WORKING':
        return 'animate-pulsing';
      case 'COMMUNICATING':
        return 'animate-talking';
      case 'RESTING':
        return 'animate-floating';
      default:
        return '';
    }
  };

  return (
    <div
      className={cn('inline-block', getAnimationClass(), className)}
      style={{
        width: `${totalSize}px`,
        height: `${totalSize}px`,
      }}
      aria-label={`Agent ${agentId.toUpperCase()}, status: ${status}`}
      role="img"
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, ${pixelSize}px)`,
          gridTemplateRows: `repeat(${gridSize}, ${pixelSize}px)`,
          gap: 0,
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((pixel, colIndex) => {
            let backgroundColor = 'transparent';
            if (pixel === 1) backgroundColor = colors.primary;
            if (pixel === 2) backgroundColor = colors.dark;

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                style={{
                  width: `${pixelSize}px`,
                  height: `${pixelSize}px`,
                  backgroundColor,
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
