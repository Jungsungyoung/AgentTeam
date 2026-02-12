import React, { useState } from 'react';

export default function DotAgentOfficePixelArtPro() {
  const [agents, setAgents] = useState([
    { id: 'leo', name: 'LEO', zone: 'work', x: 60, y: 60, status: 'IDLE', color: '#ff4444' },
    { id: 'momo', name: 'MOMO', zone: 'work', x: 180, y: 60, status: 'IDLE', color: '#ffaa00' },
    { id: 'alex', name: 'ALEX', zone: 'work', x: 300, y: 60, status: 'IDLE', color: '#00ccff' }
  ]);

  const [logs, setLogs] = useState([
    '> SYSTEM INITIALIZED',
    '> AGENTS LOADED [3/3]',
    '> AWAITING INPUT'
  ]);

  const [missionInput, setMissionInput] = useState('');
  const [executing, setExecuting] = useState(false);

  // 픽셀 에이전트 (8x12 도트 - 더 큰 캐릭터)
  const PixelAgent = ({ agent, offsetX = 0, offsetY = 0 }) => {
    // 에이전트별 픽셀 패턴 (8x12)
    const patterns = {
      leo: [
        [0,0,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,1,0],
        [0,1,1,0,0,1,1,0],
        [0,1,1,0,0,1,1,0],
        [0,1,1,0,0,1,1,0],
        [0,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,1,0],
        [0,0,1,1,1,1,0,0],
        [0,0,1,1,1,1,0,0],
        [0,0,1,1,1,1,0,0],
        [0,0,0,1,1,0,0,0]
      ],
      momo: [
        [0,1,1,1,1,1,1,0],
        [1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1],
        [1,1,0,0,0,0,1,1],
        [1,1,0,0,0,0,1,1],
        [1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1],
        [1,1,0,1,1,0,1,1],
        [1,1,1,1,1,1,1,1],
        [0,1,1,1,1,1,1,0],
        [0,0,1,1,1,1,0,0],
        [0,0,0,1,1,0,0,0]
      ],
      alex: [
        [0,0,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,0],
        [1,1,1,0,0,1,1,1],
        [1,1,1,0,0,1,1,1],
        [0,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,1,0],
        [1,1,1,1,1,1,1,1],
        [1,0,1,1,1,1,0,1],
        [1,1,0,1,1,0,1,1],
        [0,1,1,0,0,1,1,0],
        [0,0,1,1,1,1,0,0]
      ]
    };

    const pattern = patterns[agent.id] || patterns.leo;
    const pixelSize = 4;
    const darkColor = agent.color === '#ff4444' ? '#aa0000' : 
                      agent.color === '#ffaa00' ? '#aa6600' : 
                      '#0088aa';
    
    const animation = agent.status === 'MOVING' ? 'jumping' : 
                      agent.status === 'COMMUNICATING' ? 'talking' : '';

    return (
      <svg
        width={8 * pixelSize}
        height={12 * pixelSize}
        style={{
          position: 'absolute',
          left: `${agent.x + offsetX}px`,
          top: `${agent.y + offsetY}px`,
          imageRendering: 'pixelated',
          animation: animation ? `${animation} 0.5s infinite` : 'none'
        }}
      >
        {pattern.map((row, y) =>
          row.map((pixel, x) => {
            if (!pixel) return null;
            return (
              <rect
                key={`${y}-${x}`}
                x={x * pixelSize}
                y={y * pixelSize}
                width={pixelSize}
                height={pixelSize}
                fill={pixel === 1 ? agent.color : 'transparent'}
                stroke={pixel === 1 ? darkColor : 'none'}
                strokeWidth="0.5"
              />
            );
          })
        )}
      </svg>
    );
  };

  const moveAgent = (agentId, targetZone) => {
    setAgents(prev => prev.map(a => 
      a.id === agentId ? { 
        ...a, 
        zone: targetZone, 
        status: 'MOVING',
        x: targetZone === 'work' ? 60 + Math.random() * 100 : 
           targetZone === 'meeting' ? 180 + Math.random() * 80 :
           300 + Math.random() * 80,
        y: 60 + Math.random() * 40
      } : a
    ));
    
    setTimeout(() => {
      setAgents(prev => prev.map(a =>
        a.id === agentId ? { ...a, status: 'IDLE' } : a
      ));
    }, 500);
  };

  const executeMission = () => {
    if (!missionInput.trim()) return;

    setExecuting(true);
    addLog(`> [MISSION] ${missionInput.substring(0, 40)}`);
    
    setTimeout(() => {
      addLog('> LEO: ANALYZING TASK');
      moveAgent('leo', 'meeting');
    }, 200);

    setTimeout(() => {
      addLog('> MOMO: MOVING TO MEETING');
      moveAgent('momo', 'meeting');
    }, 500);

    setTimeout(() => {
      addLog('> [COLLAB] AGENTS DISCUSSING');
      setAgents(prev => prev.map(a => 
        (a.id === 'leo' || a.id === 'momo') ? { ...a, status: 'COMMUNICATING' } : a
      ));
    }, 800);

    setTimeout(() => {
      addLog('> [SUCCESS] MISSION COMPLETE');
      setAgents(prev => prev.map(a => ({ ...a, status: 'IDLE' })));
      setExecuting(false);
    }, 2500);

    setMissionInput('');
  };

  const addLog = (msg) => {
    setLogs(prev => [...prev.slice(-5), msg]);
  };

  const agentsByZone = {
    work: agents.filter(a => a.zone === 'work'),
    meeting: agents.filter(a => a.zone === 'meeting'),
    lounge: agents.filter(a => a.zone === 'lounge')
  };

  // 픽셀 격자 존
  const PixelZone = ({ color, title, agents: zoneAgents, onMove, moveZone }) => (
    <div style={{
      border: `4px solid ${color}`,
      padding: '1rem',
      background: '#0a0a0a',
      minHeight: '200px',
      position: 'relative',
      marginBottom: '1rem'
    }}>
      <div style={{
        fontSize: '11px',
        fontFamily: 'monospace',
        color: color,
        fontWeight: 'bold',
        marginBottom: '0.5rem',
        letterSpacing: '2px'
      }}>
        ◼◼ {title} ◼◼
      </div>
      
      {/* 격자 배경 */}
      <svg
        width="100%"
        height="140"
        style={{
          backgroundColor: '#1a1a2e',
          marginBottom: '0.5rem',
          position: 'relative',
          display: 'block',
          border: `2px solid ${color}`
        }}
      >
        {/* 격자선 */}
        {Array.from({ length: 14 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 20} y1={0} x2={i * 20} y2={140} stroke={color} strokeWidth="0.5" opacity="0.2" />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 20} x2={280} y2={i * 20} stroke={color} strokeWidth="0.5" opacity="0.2" />
        ))}
        
        {/* 에이전트 */}
        {zoneAgents.map(agent => (
          <g key={agent.id}>
            <PixelAgent agent={agent} />
          </g>
        ))}
      </svg>

      <button
        onClick={() => onMove(moveZone)}
        style={{
          padding: '0.5rem 1rem',
          background: color,
          color: color === '#ffaa00' ? '#000' : '#fff',
          border: `2px solid ${color}`,
          fontFamily: 'monospace',
          fontSize: '10px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.1s'
        }}
      >
        ▶ MOVE TO {title}
      </button>
    </div>
  );

  return (
    <div style={{
      backgroundColor: '#000000',
      minHeight: '100vh',
      padding: '2rem',
      fontFamily: 'monospace',
      color: '#00ff00'
    }}>
      <style>{`
        @keyframes jumping {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes talking {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.3); }
        }

        ::-webkit-scrollbar {
          width: 12px;
        }

        ::-webkit-scrollbar-track {
          background: #0a0a0a;
        }

        ::-webkit-scrollbar-thumb {
          background: #00ff00;
          border: 2px solid #000;
        }
      `}</style>

      {/* 제목 */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
        fontSize: '10px',
        lineHeight: '1.8',
        fontWeight: 'bold',
        letterSpacing: '2px'
      }}>
        <div style={{ color: '#ff00ff' }}>
          {'█'.repeat(44)}
        </div>
        <div style={{ color: '#ffff00' }}>
          ╔═════════════════════════════════════════════╗
        </div>
        <div style={{ color: '#00ffff', letterSpacing: '3px' }}>
          ║  DOT AGENT OFFICE: PIXEL ART MODE v0.2  ║
        </div>
        <div style={{ color: '#ffff00' }}>
          ╚═════════════════════════════════════════════╝
        </div>
        <div style={{ color: '#ff00ff' }}>
          {'█'.repeat(44)}
        </div>
      </div>

      {/* 메인 영역 */}
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* 3개 존 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          <PixelZone
            color="#ff4444"
            title="WORK"
            agents={agentsByZone.work}
            onMove={(zone) => moveAgent('leo', zone)}
            moveZone="work"
          />
          <PixelZone
            color="#ffaa00"
            title="MEETING"
            agents={agentsByZone.meeting}
            onMove={(zone) => moveAgent('momo', zone)}
            moveZone="meeting"
          />
          <PixelZone
            color="#00ccff"
            title="LOUNGE"
            agents={agentsByZone.lounge}
            onMove={(zone) => moveAgent('alex', zone)}
            moveZone="lounge"
          />
        </div>

        {/* 터미널 */}
        <div style={{
          border: '4px solid #00ff00',
          padding: '1rem',
          background: '#000',
          marginBottom: '1rem',
          minHeight: '120px',
          maxHeight: '160px',
          overflowY: 'auto'
        }}>
          <div style={{ fontSize: '11px', color: '#00ff00', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            ◼◼ [TERMINAL LOG] ◼◼
          </div>
          {logs.map((log, idx) => (
            <div key={idx} style={{ fontSize: '10px', margin: '0.4rem 0', color: '#00ff00' }}>
              {log}
            </div>
          ))}
        </div>

        {/* 하단: 에이전트 상태 + 입력 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* 상태 */}
          <div style={{
            border: '4px solid #ffff00',
            padding: '1rem',
            background: '#0a0a0a'
          }}>
            <div style={{ fontSize: '11px', color: '#ffff00', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              ◼◼ [AGENT STATUS] ◼◼
            </div>
            {agents.map(agent => (
              <div key={agent.id} style={{
                fontSize: '9px',
                marginBottom: '0.8rem',
                paddingBottom: '0.5rem',
                borderBottom: '1px solid #444'
              }}>
                <div style={{ color: agent.color, fontWeight: 'bold' }}>
                  {agent.name}
                </div>
                <div style={{ color: '#00ff00', fontSize: '8px' }}>
                  {agent.status} @ {agent.zone.toUpperCase()}
                </div>
              </div>
            ))}
          </div>

          {/* 입력 */}
          <div style={{
            border: '4px solid #ff00ff',
            padding: '1rem',
            background: '#0a0a0a'
          }}>
            <div style={{ fontSize: '11px', color: '#ff00ff', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              ◼◼ [MISSION INPUT] ◼◼
            </div>
            <input
              type="text"
              value={missionInput}
              onChange={(e) => setMissionInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !executing && executeMission()}
              placeholder="Enter mission..."
              disabled={executing}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '2px solid #ff00ff',
                background: '#1a1a2e',
                color: '#ff00ff',
                fontFamily: 'monospace',
                fontSize: '10px',
                marginBottom: '0.5rem',
                boxSizing: 'border-box'
              }}
            />
            <button
              onClick={executeMission}
              disabled={executing}
              style={{
                width: '100%',
                padding: '0.7rem',
                border: '2px solid #00ff00',
                background: '#00ff00',
                color: '#000',
                fontFamily: 'monospace',
                fontSize: '10px',
                fontWeight: 'bold',
                cursor: 'pointer',
                opacity: executing ? 0.5 : 1,
                transition: 'all 0.1s'
              }}
            >
              {executing ? '◄ PROCESSING ►' : '◄ EXECUTE ►'}
            </button>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <div style={{
        textAlign: 'center',
        marginTop: '2rem',
        fontSize: '9px',
        color: '#666',
        letterSpacing: '1px'
      }}>
        <div>v0.2.0 PIXEL ART EDITION</div>
        <div>{'█'.repeat(50)}</div>
        <div style={{ marginTop: '0.5rem', color: '#333' }}>
          &lt;/&gt; Made with React + SVG Pixel Rendering
        </div>
      </div>
    </div>
  );
}
