'use client';

import { useEffect } from 'react';
import { DeliverablesList } from '@/components/deliverables';
import { useDeliverableStore } from '@/lib/store/deliverableStore';
import { getSampleDeliverables } from '@/lib/utils/test-deliverables';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DeliverablesTestPage() {
  const addDeliverable = useDeliverableStore((state) => state.addDeliverable);
  const clearDeliverables = useDeliverableStore(
    (state) => state.clearDeliverables
  );
  const deliverables = useDeliverableStore((state) => state.deliverables);

  const handleLoadSamples = () => {
    const missionId = 'test-mission-001';
    const samples = getSampleDeliverables(missionId);
    samples.forEach((deliverable) => addDeliverable(deliverable));
  };

  const handleClear = () => {
    clearDeliverables();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2c3344] via-[#353b50] to-[#2c3344] p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00ddff] via-[#00ff88] to-[#ffbb33] tracking-wider">
            DELIVERABLES TEST PAGE
          </h1>
          <p className="text-[#00ff88] font-bold text-lg">
            🎨 Testing Deliverable UI Components
          </p>
        </div>

        {/* Controls */}
        <Card className="bg-[#1a1f2e]/80 border-[#4a4f62]">
          <CardHeader>
            <CardTitle className="text-[#00ddff] uppercase">
              Test Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button
              onClick={handleLoadSamples}
              className="bg-[#00ff88] hover:bg-[#00dd77] text-black font-bold uppercase"
            >
              📦 Load Sample Deliverables
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              className="border-[#ff4466] text-[#ff4466] hover:bg-[#ff4466]/10 font-bold uppercase"
            >
              🗑️ Clear All
            </Button>
            <div className="ml-auto flex items-center gap-2 text-[#8899aa]">
              <span className="font-bold">Total:</span>
              <span className="text-2xl text-[#00ddff]">
                {deliverables.length}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Features Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#1a1f2e]/80 border-purple-500/50">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">💻</div>
              <h3 className="font-bold text-purple-400 mb-1">
                Code Highlighting
              </h3>
              <p className="text-xs text-[#8899aa]">
                Syntax highlighting with line numbers
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1f2e]/80 border-blue-500/50">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">📝</div>
              <h3 className="font-bold text-blue-400 mb-1">
                Markdown Support
              </h3>
              <p className="text-xs text-[#8899aa]">
                Rich markdown rendering for docs
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1f2e]/80 border-green-500/50">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">📊</div>
              <h3 className="font-bold text-green-400 mb-1">
                Analysis Reports
              </h3>
              <p className="text-xs text-[#8899aa]">
                Formatted analysis and audits
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1f2e]/80 border-orange-500/50">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">⬇️</div>
              <h3 className="font-bold text-orange-400 mb-1">
                Download Export
              </h3>
              <p className="text-xs text-[#8899aa]">
                Save deliverables locally
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Deliverables List */}
        <Card className="bg-[#1a1f2e]/80 border-[#4a4f62]">
          <CardContent className="p-6">
            <DeliverablesList />
          </CardContent>
        </Card>

        {/* Instructions */}
        <div className="text-center space-y-2 text-[#8899aa] text-sm">
          <p>
            ✨ Click "Load Sample Deliverables" to populate with test data
          </p>
          <p>👁️ Click "View" on any card to see full content with syntax highlighting</p>
          <p>⬇️ Click "Download" to save deliverables as files</p>
          <p>🎨 Filter by type using the buttons above the list</p>
        </div>
      </div>
    </div>
  );
}
