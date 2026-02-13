'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AGENT_COLORS } from '@/lib/types/agent';
import type { Deliverable } from '@/lib/types/deliverable';
import { cn } from '@/lib/utils';

interface DeliverableCardProps {
  deliverable: Deliverable;
  onView?: () => void;
  onDownload?: () => void;
  className?: string;
}

const TYPE_COLORS: Record<string, string> = {
  code: 'bg-purple-500',
  document: 'bg-blue-500',
  analysis: 'bg-green-500',
  plan: 'bg-orange-500',
};

const TYPE_ICONS: Record<string, string> = {
  code: '{ }',
  document: '📄',
  analysis: '📊',
  plan: '📋',
};

export function DeliverableCard({
  deliverable,
  onView,
  onDownload,
  className,
}: DeliverableCardProps) {
  const agentColor = AGENT_COLORS[deliverable.agentId];
  const typeColor = TYPE_COLORS[deliverable.type] || 'bg-gray-500';
  const typeIcon = TYPE_ICONS[deliverable.type] || '📦';

  const downloadFileName = () => {
    const extension = deliverable.metadata?.fileExtension || '.txt';
    const timestamp = new Date(deliverable.createdAt).getTime();
    return `${deliverable.title.replace(/\s+/g, '_')}_${timestamp}${extension}`;
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Default download behavior
      const blob = new Blob([deliverable.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadFileName();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Card className={cn('w-full', className)} style={{ borderColor: agentColor }}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{typeIcon}</span>
            <CardTitle className="text-lg uppercase">
              {deliverable.title}
            </CardTitle>
          </div>
          <Badge className={cn(typeColor, 'text-white uppercase')}>
            {deliverable.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metadata */}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span
            className="font-bold uppercase"
            style={{ color: agentColor }}
          >
            {deliverable.agentId}
          </span>
          <span>•</span>
          <span>{new Date(deliverable.createdAt).toLocaleString()}</span>
          {deliverable.metadata?.language && (
            <>
              <span>•</span>
              <span className="uppercase">{deliverable.metadata.language}</span>
            </>
          )}
        </div>

        {/* Content Preview */}
        <div className="rounded border bg-muted p-3">
          <pre className="font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap">
            {deliverable.content.substring(0, 100)}
            {deliverable.content.length > 100 ? '...' : ''}
          </pre>
        </div>

        {/* Tags */}
        {deliverable.metadata?.tags && deliverable.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {deliverable.metadata.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {onView && (
            <Button
              onClick={onView}
              size="sm"
              className="flex-1 uppercase font-bold"
              style={{ backgroundColor: agentColor }}
            >
              View
            </Button>
          )}
          <Button
            onClick={handleDownload}
            size="sm"
            variant="outline"
            className="flex-1 uppercase font-bold"
          >
            ⬇ Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
