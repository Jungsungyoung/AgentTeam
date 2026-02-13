'use client';

import { AGENT_COLORS } from '@/lib/types/agent';
import type { AgentId } from '@/lib/types/agent';

export interface ChatMessageProps {
  from: 'user' | AgentId;
  message: string;
  timestamp: string;
}

/**
 * ChatMessage Component
 *
 * Displays a single chat message with sender identification
 * - User messages: Right-aligned, purple background
 * - Agent messages: Left-aligned, agent color background
 */
export function ChatMessage({ from, message, timestamp }: ChatMessageProps) {
  const isUser = from === 'user';
  const agentColor = !isUser ? AGENT_COLORS[from as AgentId] : '#bb44ff';

  // Format timestamp for display
  const time = new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 animate-in fade-in slide-in-from-bottom-2 duration-300`}
    >
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Sender label */}
        <div className="text-xs text-gray-500 mb-1 px-2 font-mono">
          {isUser ? 'You' : from.toUpperCase()} • {time}
        </div>

        {/* Message bubble */}
        <div
          className="rounded-lg px-4 py-2 shadow-sm border"
          style={{
            backgroundColor: isUser ? '#bb44ff' : agentColor,
            color: '#ffffff',
            borderColor: isUser ? '#9933dd' : adjustColorBrightness(agentColor, -20),
          }}
        >
          <div className="text-sm font-mono leading-relaxed whitespace-pre-wrap break-words">
            {message}
          </div>
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
