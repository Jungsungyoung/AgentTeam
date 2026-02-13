'use client';

import { useState } from 'react';
import { AGENT_COLORS } from '@/lib/types/agent';
import type { AgentCollaborationEvent } from '@/lib/types/sse';
import type { AgentId } from '@/lib/types/agent';

export interface ConversationTimelineProps {
  collaborationEvents: AgentCollaborationEvent[];
  className?: string;
}

type CollaborationType = AgentCollaborationEvent['collaborationType'] | 'all';

/**
 * ConversationTimeline Component
 *
 * Visualizes agent-to-agent collaboration messages in a timeline view
 * - Displays collaboration flow with agent colors
 * - Filters by collaboration type
 * - Shows timestamps and message content
 */
export function ConversationTimeline({
  collaborationEvents,
  className = '',
}: ConversationTimelineProps) {
  const [filterType, setFilterType] = useState<CollaborationType>('all');

  // Filter events by type
  const filteredEvents =
    filterType === 'all'
      ? collaborationEvents
      : collaborationEvents.filter((event) => event.collaborationType === filterType);

  // Count events by type
  const counts = {
    all: collaborationEvents.length,
    question: collaborationEvents.filter((e) => e.collaborationType === 'question').length,
    answer: collaborationEvents.filter((e) => e.collaborationType === 'answer').length,
    proposal: collaborationEvents.filter((e) => e.collaborationType === 'proposal').length,
    approval: collaborationEvents.filter((e) => e.collaborationType === 'approval').length,
    handoff: collaborationEvents.filter((e) => e.collaborationType === 'handoff').length,
  };

  // Empty state
  if (collaborationEvents.length === 0) {
    return (
      <div className={`bg-gray-900 rounded-lg border border-gray-700 p-6 ${className}`}>
        <h3 className="text-lg font-bold text-white mb-4 font-mono uppercase">
          Agent Collaboration Timeline
        </h3>
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <div className="text-6xl mb-4">💬</div>
          <div className="text-sm font-mono">No agent collaborations yet</div>
          <div className="text-xs mt-2">Agents will communicate here during missions</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-700 ${className}`}>
      {/* Header with filters */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-bold text-white mb-3 font-mono uppercase">
          Agent Collaboration Timeline ({collaborationEvents.length})
        </h3>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2">
          <FilterButton
            type="all"
            count={counts.all}
            active={filterType === 'all'}
            onClick={() => setFilterType('all')}
          />
          <FilterButton
            type="question"
            count={counts.question}
            active={filterType === 'question'}
            onClick={() => setFilterType('question')}
          />
          <FilterButton
            type="answer"
            count={counts.answer}
            active={filterType === 'answer'}
            onClick={() => setFilterType('answer')}
          />
          <FilterButton
            type="proposal"
            count={counts.proposal}
            active={filterType === 'proposal'}
            onClick={() => setFilterType('proposal')}
          />
          <FilterButton
            type="approval"
            count={counts.approval}
            active={filterType === 'approval'}
            onClick={() => setFilterType('approval')}
          />
          <FilterButton
            type="handoff"
            count={counts.handoff}
            active={filterType === 'handoff'}
            onClick={() => setFilterType('handoff')}
          />
        </div>
      </div>

      {/* Timeline content */}
      <div className="p-4 max-h-[500px] overflow-y-auto">
        {filteredEvents.length === 0 ? (
          <div className="text-center text-gray-500 py-8 font-mono text-sm">
            No {filterType} events
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((event, index) => (
              <CollaborationMessage key={`${event.timestamp}-${index}`} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Filter Button Component
 */
interface FilterButtonProps {
  type: CollaborationType;
  count: number;
  active: boolean;
  onClick: () => void;
}

function FilterButton({ type, count, active, onClick }: FilterButtonProps) {
  const typeIcons: Record<CollaborationType, string> = {
    all: '📋',
    question: '❓',
    answer: '💬',
    proposal: '💡',
    approval: '✅',
    handoff: '🔄',
  };

  const typeColors: Record<CollaborationType, string> = {
    all: 'bg-gray-700',
    question: 'bg-blue-700',
    answer: 'bg-green-700',
    proposal: 'bg-purple-700',
    approval: 'bg-cyan-700',
    handoff: 'bg-orange-700',
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded text-xs font-mono transition-all ${
        active
          ? `${typeColors[type]} text-white shadow-md`
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
      }`}
    >
      {typeIcons[type]} {type.toUpperCase()} ({count})
    </button>
  );
}

/**
 * Collaboration Message Component
 */
interface CollaborationMessageProps {
  event: AgentCollaborationEvent;
}

function CollaborationMessage({ event }: CollaborationMessageProps) {
  const fromColor = AGENT_COLORS[event.fromAgentId];
  const toColor = AGENT_COLORS[event.toAgentId];

  // Format timestamp
  const time = new Date(event.timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });

  // Collaboration type icon
  const typeIcon: Record<AgentCollaborationEvent['collaborationType'], string> = {
    question: '❓',
    answer: '💬',
    proposal: '💡',
    approval: '✅',
    handoff: '🔄',
  };

  return (
    <div className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* From agent indicator */}
      <div
        className="flex-shrink-0 w-12 h-12 rounded flex items-center justify-center font-bold text-white text-sm border-2"
        style={{
          backgroundColor: fromColor,
          borderColor: adjustColorBrightness(fromColor, -30),
        }}
      >
        {event.fromAgentId.toUpperCase().slice(0, 2)}
      </div>

      {/* Arrow and type */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center pt-3">
        <div className="text-xs mb-1">{typeIcon[event.collaborationType]}</div>
        <div className="text-gray-500 text-2xl">→</div>
      </div>

      {/* To agent indicator */}
      <div
        className="flex-shrink-0 w-12 h-12 rounded flex items-center justify-center font-bold text-white text-sm border-2"
        style={{
          backgroundColor: toColor,
          borderColor: adjustColorBrightness(toColor, -30),
        }}
      >
        {event.toAgentId.toUpperCase().slice(0, 2)}
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="text-xs text-gray-500 mb-1 font-mono">
          <span style={{ color: fromColor }} className="font-bold">
            {event.fromAgentId.toUpperCase()}
          </span>{' '}
          →
          <span style={{ color: toColor }} className="font-bold">
            {event.toAgentId.toUpperCase()}
          </span>{' '}
          • {time}
        </div>

        {/* Message bubble */}
        <div
          className="rounded-lg px-3 py-2 border"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderColor: fromColor,
          }}
        >
          <div className="text-sm text-gray-200 font-mono leading-relaxed whitespace-pre-wrap break-words">
            {event.message}
          </div>
        </div>

        {/* Collaboration type badge */}
        <div className="mt-1">
          <span className="inline-block px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded font-mono">
            {event.collaborationType}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Adjust color brightness
 * @param color Hex color string
 * @param amount Brightness adjustment (-100 to 100)
 */
function adjustColorBrightness(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
