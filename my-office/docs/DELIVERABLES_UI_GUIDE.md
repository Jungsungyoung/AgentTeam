# Deliverables UI System Documentation

## Overview

The Deliverables UI system provides a comprehensive interface for displaying, viewing, and downloading mission deliverables produced by AI agents. It includes syntax highlighting for code, Markdown rendering for documents, and export functionality.

## Architecture

### Components

#### 1. DeliverableCard (`components/deliverables/DeliverableCard.tsx`)

**Purpose**: Display individual deliverable as a compact card with preview and actions.

**Props**:
- `deliverable: Deliverable` - The deliverable data
- `onView?: () => void` - Callback when View button clicked
- `onDownload?: () => void` - Custom download handler (optional)
- `className?: string` - Additional CSS classes

**Features**:
- Type-specific badges and icons (code 💻, document 📄, analysis 📊, plan 📋)
- Agent color-coded borders
- Content preview (first 100 characters)
- Metadata display (agent, timestamp, language)
- Tag support
- Default download functionality

**Usage**:
```tsx
import { DeliverableCard } from '@/components/deliverables';

<DeliverableCard
  deliverable={deliverable}
  onView={() => setSelectedDeliverable(deliverable)}
/>
```

#### 2. DeliverablesList (`components/deliverables/DeliverablesList.tsx`)

**Purpose**: Display collection of deliverables with filtering and grid layout.

**Props**:
- `missionId?: string` - Filter deliverables by mission (optional)
- `className?: string` - Additional CSS classes

**Features**:
- Grid layout (responsive: 1/2/3 columns)
- Type filtering (All, Code, Document, Analysis, Plan)
- Empty state UI
- Scrollable area (600px height)
- Integrated DeliverableViewer for full view
- Auto-counts deliverables by type

**Usage**:
```tsx
import { DeliverablesList } from '@/components/deliverables';

// Show all deliverables
<DeliverablesList />

// Filter by mission
<DeliverablesList missionId="mission-123" />
```

#### 3. DeliverableViewer (`components/deliverables/DeliverableViewer.tsx`)

**Purpose**: Full-screen modal viewer with syntax highlighting and markdown rendering.

**Props**:
- `deliverable: Deliverable` - The deliverable to view
- `onClose?: () => void` - Callback when Close button clicked
- `className?: string` - Additional CSS classes

**Features**:
- Full-screen modal with backdrop
- Type-specific rendering:
  - **Code**: Syntax highlighting with line numbers (react-syntax-highlighter)
  - **Document**: Markdown rendering (react-markdown) or plain text
  - **Analysis/Plan**: Markdown with prose styling
- Scrollable content area
- Download button
- Agent-colored border
- Metadata display with tags

**Syntax Highlighting**:
- Theme: VS Code Dark Plus
- Line numbers enabled
- Language detection from metadata
- Supports: TypeScript, JavaScript, Python, JSON, HTML, CSS, etc.

**Usage**:
```tsx
import { DeliverableViewer } from '@/components/deliverables';

<DeliverableViewer
  deliverable={selectedDeliverable}
  onClose={() => setSelectedDeliverable(null)}
/>
```

#### 4. DeliverablePanel (`components/deliverables/DeliverablePanel.tsx`)

**Purpose**: Collapsible panel for integration into main application layout.

**Props**:
- `className?: string` - Additional CSS classes

**Features**:
- Expand/collapse functionality
- Mission filtering for completed missions
- Deliverable count badge
- Integrates DeliverablesList
- Minimal UI when collapsed

**Usage**:
```tsx
import { DeliverablePanel } from '@/components/deliverables';

<DeliverablePanel />
```

## State Management

### Store: `deliverableStore`

**Location**: `lib/store/deliverableStore.ts`

**State**:
```typescript
interface DeliverableState {
  deliverables: Deliverable[];
  // ... actions
}
```

**Actions**:
- `addDeliverable(deliverable: Deliverable)` - Add new deliverable
- `getDeliverablesByMission(missionId: string)` - Filter by mission
- `getDeliverablesByAgent(agentId: string)` - Filter by agent
- `getDeliverableById(id: string)` - Get single deliverable
- `clearDeliverables()` - Remove all deliverables
- `removeDeliverable(id: string)` - Remove specific deliverable

**Redux DevTools**: Store name `deliverable-store`

## Types

### Deliverable Type

**Location**: `lib/types/deliverable.ts`

```typescript
export type DeliverableType = 'code' | 'document' | 'analysis' | 'plan';

export interface Deliverable {
  id: string;
  type: DeliverableType;
  title: string;
  content: string;
  agentId: AgentId;
  missionId: string;
  createdAt: Date;
  metadata?: {
    language?: string;      // e.g., 'typescript', 'javascript'
    format?: string;        // e.g., 'markdown', 'plain'
    tags?: string[];        // Categorization tags
    fileExtension?: string; // For download (e.g., '.tsx', '.md')
  };
}
```

### Helper Function

```typescript
createDeliverable(
  type: DeliverableType,
  title: string,
  content: string,
  agentId: AgentId,
  missionId: string,
  metadata?: Deliverable['metadata']
): Deliverable
```

## Dependencies

### Installed Packages

```json
{
  "dependencies": {
    "react-syntax-highlighter": "^15.x",
    "react-markdown": "^9.x"
  },
  "devDependencies": {
    "@types/react-syntax-highlighter": "^15.x"
  }
}
```

### Install Command

```bash
npm install react-syntax-highlighter react-markdown @types/react-syntax-highlighter
```

## Integration Guide

### 1. Add to Existing Page

```tsx
import { DeliverablePanel } from '@/components/deliverables';

export default function MyPage() {
  return (
    <div>
      {/* Your existing content */}

      {/* Add Deliverables Panel */}
      <DeliverablePanel />
    </div>
  );
}
```

### 2. Add Deliverable from Code

```tsx
import { useDeliverableStore } from '@/lib/store/deliverableStore';
import { createDeliverable } from '@/lib/types/deliverable';

function MyComponent() {
  const addDeliverable = useDeliverableStore(state => state.addDeliverable);

  const handleAddCode = () => {
    const deliverable = createDeliverable(
      'code',
      'My Component',
      'const x = 42;',
      'leo',
      'mission-id',
      {
        language: 'typescript',
        fileExtension: '.ts',
        tags: ['example'],
      }
    );
    addDeliverable(deliverable);
  };

  return <button onClick={handleAddCode}>Add Code</button>;
}
```

### 3. Parse SSE Events (Future Integration)

```typescript
// When receiving deliverable event from Claude API
socket.on('deliverable_created', (data) => {
  const deliverable = createDeliverable(
    data.type,
    data.title,
    data.content,
    data.agentId,
    data.missionId,
    data.metadata
  );

  addDeliverable(deliverable);
});
```

## Testing

### Test Page

Visit `/deliverables-test` to see the UI in action:

**Features**:
- Load sample deliverables (5 examples)
- Test all deliverable types
- Verify syntax highlighting
- Test download functionality
- Check filtering

**Sample Data**: `lib/utils/test-deliverables.ts`

### Manual Testing Checklist

- [ ] DeliverableCard displays correctly for each type
- [ ] Type badges show correct colors and icons
- [ ] Agent color borders match agent theme
- [ ] Content preview truncates at 100 chars
- [ ] Tags display when present
- [ ] Download button creates file with correct name and extension
- [ ] View button opens DeliverableViewer
- [ ] DeliverableViewer shows correct syntax highlighting for code
- [ ] Markdown renders properly for documents/plans/analysis
- [ ] Close button returns to list view
- [ ] Type filters work correctly
- [ ] Mission filters work correctly (when multiple missions)
- [ ] Empty state shows when no deliverables
- [ ] Panel expands/collapses correctly

## Styling

### Color Scheme (8-bit Retro)

**Type Colors**:
- Code: `bg-purple-500` (Purple)
- Document: `bg-blue-500` (Blue)
- Analysis: `bg-green-500` (Green)
- Plan: `bg-orange-500` (Orange)

**Agent Colors**: Inherited from `AGENT_COLORS`
- BOSS: `#bb44ff` (Purple)
- LEO: `#ff4466` (Red)
- MOMO: `#ffbb33` (Orange)
- ALEX: `#00ddff` (Cyan)

**Typography**:
- Headers: Uppercase, bold
- Code: `font-mono` (Courier New)
- Body: System font stack

**Layout**:
- Cards: Rounded borders, shadow
- Grid: Responsive (1/2/3 columns)
- Modal: Full-screen with backdrop blur

## Performance Considerations

### Optimizations

1. **Selective Subscriptions**: Components only subscribe to needed store slices
2. **Lazy Loading**: DeliverableViewer only renders when opened
3. **Code Splitting**: Syntax highlighter loaded on-demand
4. **Virtualization**: Consider for large lists (100+ deliverables)

### Current Limits

- No pagination (showing all deliverables)
- Syntax highlighting may lag on very large files (>10,000 lines)
- Recommended max: 50 deliverables per mission

### Future Improvements

- [ ] Virtual scrolling for large lists
- [ ] Lazy load syntax highlighting
- [ ] Search/filter by content
- [ ] Sort by date/agent/type
- [ ] Bulk download (ZIP)
- [ ] Copy to clipboard
- [ ] Share via link

## Accessibility

- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] ARIA labels
- [ ] Focus management in modal
- [ ] Color contrast compliance

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile: ✅ Responsive (may need UX improvements)

## Troubleshooting

### Issue: Syntax highlighting not working

**Solution**: Verify language is correctly set in metadata:
```typescript
metadata: {
  language: 'typescript' // Must match Prism language key
}
```

### Issue: Markdown not rendering

**Solution**: Ensure format is set to 'markdown':
```typescript
metadata: {
  format: 'markdown'
}
```

### Issue: Download creates empty file

**Solution**: Check content is non-empty and fileExtension is set:
```typescript
content: 'Your content here',
metadata: {
  fileExtension: '.tsx'
}
```

## API Reference

See also:
- [Type System](../lib/types/deliverable.ts)
- [Store Implementation](../lib/store/deliverableStore.ts)
- [Component Source](../components/deliverables/)

---

**Last Updated**: 2026-02-13
**Version**: 1.0.0
**Maintainer**: UI Specialist Team
