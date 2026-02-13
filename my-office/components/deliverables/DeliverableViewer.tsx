'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AGENT_COLORS, AGENT_ROLES } from '@/lib/types/agent';
import type { Deliverable } from '@/lib/types/deliverable';
import { cn } from '@/lib/utils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';

interface DeliverableViewerProps {
  deliverable: Deliverable;
  onClose?: () => void;
  className?: string;
}

export function DeliverableViewer({
  deliverable,
  onClose,
  className,
}: DeliverableViewerProps) {
  const agentColor = AGENT_COLORS[deliverable.agentId];
  const agentRole = AGENT_ROLES[deliverable.agentId];

  const handleDownload = () => {
    const extension = deliverable.metadata?.fileExtension || '.txt';
    const timestamp = new Date(deliverable.createdAt).getTime();
    const fileName = `${deliverable.title.replace(/\s+/g, '_')}_${timestamp}${extension}`;

    const blob = new Blob([deliverable.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderContent = () => {
    switch (deliverable.type) {
      case 'code':
        return (
          <SyntaxHighlighter
            language={deliverable.metadata?.language || 'typescript'}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontFamily: '"Courier New", monospace',
            }}
            showLineNumbers
          >
            {deliverable.content}
          </SyntaxHighlighter>
        );

      case 'document':
        if (deliverable.metadata?.format === 'markdown') {
          return (
            <div className="prose prose-sm max-w-none dark:prose-invert p-4">
              <ReactMarkdown>{deliverable.content}</ReactMarkdown>
            </div>
          );
        }
        return (
          <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 font-mono text-sm">
            {deliverable.content}
          </pre>
        );

      case 'analysis':
      case 'plan':
        // For analysis and plans, render as formatted text with markdown support
        return (
          <div className="prose prose-sm max-w-none dark:prose-invert p-4">
            <ReactMarkdown>{deliverable.content}</ReactMarkdown>
          </div>
        );

      default:
        return (
          <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 font-mono text-sm">
            {deliverable.content}
          </pre>
        );
    }
  };

  return (
    <div className={cn('fixed inset-0 z-50 bg-background/80 backdrop-blur-sm', className)}>
      <div className="fixed inset-4 flex items-center justify-center">
        <Card className="w-full max-w-5xl max-h-full flex flex-col" style={{ borderColor: agentColor }}>
          <CardHeader className="border-b">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl uppercase">
                    {deliverable.title}
                  </CardTitle>
                  <Badge className="uppercase" variant="outline">
                    {deliverable.type}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span
                    className="font-bold uppercase"
                    style={{ color: agentColor }}
                  >
                    {deliverable.agentId}
                  </span>
                  <span>•</span>
                  <span>{agentRole}</span>
                  <span>•</span>
                  <span>
                    {new Date(deliverable.createdAt).toLocaleString()}
                  </span>
                  {deliverable.metadata?.language && (
                    <>
                      <span>•</span>
                      <span className="uppercase font-mono">
                        {deliverable.metadata.language}
                      </span>
                    </>
                  )}
                </div>
                {deliverable.metadata?.tags && deliverable.metadata.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {deliverable.metadata.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleDownload}
                  size="sm"
                  variant="outline"
                  className="uppercase font-bold"
                >
                  ⬇ Download
                </Button>
                {onClose && (
                  <Button
                    onClick={onClose}
                    size="sm"
                    variant="ghost"
                    className="uppercase font-bold"
                  >
                    ✕ Close
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full max-h-[calc(100vh-16rem)]">
              <div className="p-6">{renderContent()}</div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
