'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { AgentSelector } from './AgentSelector';
import type { AgentId } from '@/lib/types/agent';
import type { ChatMessageEvent } from '@/lib/types/sse';

export interface ChatPanelProps {
  missionId: string | null;
  messages: ChatMessageEvent[];
  selectedAgent: AgentId;
  onSelectAgent: (agentId: AgentId) => void;
  onSendMessage: (agentId: AgentId, message: string) => void;
  isSending: boolean;
  isConnected: boolean;
}

/**
 * ChatPanel Component
 *
 * Main chat container with message history and input
 * Features:
 * - Message history with auto-scroll
 * - Agent selector
 * - Message input with send button
 * - Loading states
 */
export function ChatPanel({
  missionId,
  messages,
  selectedAgent,
  onSelectAgent,
  onSendMessage,
  isSending,
  isConnected,
}: ChatPanelProps) {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage || !missionId || isSending) return;

    onSendMessage(selectedAgent, trimmedMessage);
    setInputMessage('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-md border border-gray-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-300 bg-white/70">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold font-mono text-gray-800">
            Agent Chat
          </h3>
          {isConnected && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-mono text-green-600">Connected</span>
            </div>
          )}
        </div>

        {/* Agent Selector */}
        <AgentSelector
          selectedAgent={selectedAgent}
          onSelectAgent={onSelectAgent}
          disabled={isSending}
        />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {!missionId ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p className="text-sm font-mono text-center">
              Start a mission to begin chatting with agents
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-sm font-mono mb-2">No messages yet</p>
              <p className="text-xs font-mono text-gray-400">
                Send a message to {selectedAgent.toUpperCase()} to start chatting
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage
                key={msg.messageId}
                from={msg.from}
                message={msg.message}
                timestamp={msg.timestamp}
              />
            ))}
            {isSending && (
              <div className="flex justify-start mb-3">
                <div className="max-w-[75%] flex flex-col items-start">
                  <div className="text-xs text-gray-500 mb-1 px-2 font-mono">
                    {selectedAgent.toUpperCase()} is typing...
                  </div>
                  <div className="rounded-lg px-4 py-2 bg-gray-300 animate-pulse">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-300 bg-white/70">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!missionId || isSending}
            placeholder={
              !missionId
                ? 'Start a mission first...'
                : `Message ${selectedAgent.toUpperCase()}...`
            }
            className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!missionId || isSending || !inputMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white font-mono text-sm rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
