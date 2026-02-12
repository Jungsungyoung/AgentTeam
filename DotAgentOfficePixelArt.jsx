import React, { useState } from 'react';

export default function DotAgentOfficePixelArt() {
  const [agents, setAgents] = useState([
    { id: 'leo', name: 'LEO', role: '코드 마스터', zone: 'work', x: 50, y: 40, status: 'IDLE', color: '#ff4444', rgb: '255, 68, 68' },
    { id: 'momo', name: 'MOMO', role: '기획 천재', zone: 'work', x: 150, y: 40, status: 'IDLE', color: '#ffaa00', rgb: '255, 170, 0' },
    { id: 'alex', name: 'ALEX', role: '분석가', zone: 'work', x: 250, y: 40, status: 'IDLE', color: '#00ccff', rgb: '0, 204, 255' }
  ]);

  const [logs, setLogs] = useState([
    '> SYSTEM ONLINE',
    '> AGENTS READY',
    '> AWAITING MISSION'
  ]);

  const [missionInput, setMissionInput] = useState('');
  const [executing, setExecuting] = useState(false);

  // 픽셀 캐릭터 (8x8 도트)
  const AgentPixel = ({ agent, offsetX = 0, offsetY = 0 }) => {
    const pixels = {
      leo: [
        [0,1,1,1,1,0,0,0],
        [1,1,1,1,1,1,0,0],
        [1,1,1,1,1,1,0,0],
        [1,1,0,0,1,1,0,0],
        [1,1,0,0,1,1,0,0],
        [1,1,1,0,1,1,0,0],
        [0,1,1,1,1,0,0,0],
        [0,0,1,1,0,0,0,0]
      ],
      momo: [
        [0,1,1,1,1,0,0,0],
        [1,1,1,1,1,1,0,0],
        [1,1,1,1,1,1,0,0],
        [0,1,1,1,1,0,0,0],
        [1,1,1,1,1,1,0,0],
        [1,0,1,1,0,1,0,0],
        [0,1,0,0,1,0,0,0],
        [0,0,1,1,0,0,0,0]
      ],
      alex: [
        [1,1,1,1,1,1,0,0],
        [1,1,1,1,1,1,0,0],
        [1,0,1,1,0,1,0,0],
        [1,0,1,1,0,1,0,0],
        [1,1,1,1,1,1,0,0],
        [1,1,0,0,1,1,0,0],
        [0,1,1,1,1,0,0,0],
        [0,0,1,1,0,0,0,0]
      ]
    };

    const pixel = pixels[agent.id] || pixels.leo;
    const animation = agent.status === 'MOVING' ? 'jumping' : agent.status === 'COMMUNICATING' ? 'talking' : '';

    return (
      <div style={{ 
        position: 'absolute',
        left: `${agent.x + offsetX}px`,
        top: `${agent.y + offsetY}px`,
        width: '24px',
        height: '24px',
        imageRendering: 'pixelated',
        animation: animation ? `${animation} 0.6s infinite` : 'none'
      }}>
        {pixel.map((row, y) => (
          <div key={y} style={{ display: 'flex', height: '3px' }}>
            {row.map((cell, x) => (
              <div
                key={`${y}-${x}`}
                style={{
                  width: '3px',
                  height: '3px',
                  backgroundColor: cell ? agent.color : 'transparent',
                  border: cell ? `1px solid ${agent.color === '#ff4444' ? '#cc0000' : agent.color === '#ffaa00' ? '#cc8800' : '#0099cc'}` : 'none',
                  boxSizing: 'border-box'
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  const moveAgent = (agentId, targetZone) => {
    setAgents(prev => prev.map(a => 
      a.id === agentId ? { 
        ...a, 
        zone: targetZone, 
        status: 'MOVING',
        x: targetZone === 'work' ? 50 + Math.random() * 100 : 
           targetZone === 'meeting' ? 150 + Math.random() * 80 :
           250 + Math.random() * 80,
        y: 40 + Math.random() * 30
      } : a
    ));
    
    setTimeout(() => {
      setAgents(prev => prev.map(a =>
        a.id === agentId ? { ...a, status: 'IDLE' } : a
      ));
    }, 600);
  };

  const executeMission = () => {
    if (!missionInput.trim()) return;

    setExecuting(true);
    addLog(`> MISSION: ${missionInput}`);
    
    setTimeout(() => {
      addLog('> LEO: ANALYZING');
      moveAgent('leo', 'meeting');
    }, 300);

    setTimeout(() => {
      addLog('> MOMO: MOVING');
      moveAgent('momo', 'meeting');
    }, 600);

    setTimeout(() => {
      addLog('> COLLABORATION STARTED');
      setAgents(prev => prev.map(a => 
        (a.id === 'leo' || a.id === 'momo') ? { ...a, status: 'COMMUNICATING' } : a
      ));
    }, 900);

    setTimeout(() => {
      addLog('> MISSION COMPLETE!');
      setAgents(prev => prev.map(a => ({ ...a, status: 'IDLE' })));
      setExecuting(false);
    }, 2700);

    setMissionInput('');
  };

  const addLog = (msg) => {
    setLogs(prev => [...prev.slice(-6), msg]);
  };

  const agentsByZone = {
    work: agents.filter(a => a.zone === 'work'),
    meeting: agents.filter(a => a.zone === 'meeting'),
    lounge: agents.filter(a => a.zone === 'lounge')
  };

  // 픽셀 격자 배경
  const PixelGrid = ({ width = 320, height = 160, children }) => (
    <div style={{
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: '#1a1a2e',
      border: '3px solid #00ff00',
      position: 'relative',
      overflow: 'hidden',
      backgroundImage: `
        linear-gradient(0deg, transparent 24%, rgba(0, 255, 0, .05) 25%, rgba(0, 255, 0, .05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, .05) 75%, rgba(0, 255, 0, .05) 76%, transparent 77%, transparent),
        linear-gradient(90deg, transparent 24%, rgba(0, 255, 0, .05) 25%, rgba(0, 255, 0, .05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, .05) 75%, rgba(0, 255, 0, .05) 76%, transparent 77%, transparent)
      `,
      backgroundSize: '20px 20px'
    }}>
      {children}
    </div>
  );

  return (
    <div style={{
      backgroundColor: '#0a0a0a',
      minHeight: '100vh',
      padding: '2rem',
      fontFamily: '"Courier New", monospace',
      color: '#00ff00',
      overflow: 'auto'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime&display=swap');

        @keyframes jumping {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(-8px) scaleY(0.95); }
        }

        @keyframes talking {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .pixel-title {
          font-family: 'Courier New', monospace;
          font-size: 20px;
          font-weight: bold;
          letter-spacing: 3px;
          text-align: center;
          color: #00ff00;
          text-shadow: 2px 2px 0 #ff0000, 4px 4px 0 #ffff00;
          margin-bottom: 2rem;
          line-height: 1.4;
        }

        .pixel-text {
          font-family: 'Courier Prime', monospace;
          font-size: 10px;
          letter-spacing: 1px;
          line-height: 1.6;
        }

        .zone-box {
          border: 3px solid;
          padding: 1rem;
          margin-bottom: 1rem;
          background: #1a1a2e;
          position: relative;
        }

        .terminal-box {
          border: 3px solid #00ff00;
          padding: 1rem;
          background: #000;
          height: 140px;
          overflow-y: auto;
          margin-bottom: 1rem;
        }

        .terminal-line {
          margin: 0.3rem 0;
          color: #00ff00;
          font-size: 9px;
        }

        .status-box {
          border: 3px solid #00ff00;
          padding: 1rem;
          background: #1a1a2e;
          margin-bottom: 1rem;
        }

        .input-box {
          border: 3px solid #ffff00;
          padding: 0.8rem;
          background: #1a1a2e;
          color: #ffff00;
          font-family: 'Courier Prime', monospace;
          font-size: 9px;
          margin-bottom: 0.5rem;
          width: 100%;
          box-sizing: border-box;
        }

        .exec-btn {
          border: 3px solid #00ff00;
          padding: 0.8rem 1.5rem;
          background: #00ff00;
          color: #000;
          font-family: 'Courier Prime', monospace;
          font-size: 9px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.1s;
        }

        .exec-btn:hover:not(:disabled) {
          background: #ffff00;
          border-color: #ffff00;
        }

        .exec-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pixel-char {
          display: inline-block;
          margin: 0 2px;
        }

        ::-webkit-scrollbar {
          width: 12px;
        }

        ::-webkit-scrollbar-track {
          background: #0a0a0a;
          border-left: 2px solid #00ff00;
        }

        ::-webkit-scrollbar-thumb {
          background: #00ff00;
          border: 2px solid #0a0a0a;
        }
      `}</style>

      {/* 제목 */}
      <div className="pixel-title">
        <div>████████████████████████</div>
        <div>█ DOT AGENT OFFICE v0.2 █</div>
        <div>████████████████████████</div>
      </div>

      {/* 메인 컨테이너 */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* 상단: 3개 존 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          {/* WORK ZONE */}
          <div className="zone-box" style={{ borderColor: '#ff4444' }}>
            <div className="pixel-text" style={{ color: '#ff4444', marginBottom: '0.5rem' }}>
              ▌WORK▐
            </div>
            <PixelGrid width="280" height="120">
              {agentsByZone.work.map(agent => (
                <AgentPixel key={agent.id} agent={agent} />
              ))}
            </PixelGrid>
            <button
              onClick={() => moveAgent('leo', 'work')}
              className="pixel-text"
              style={{
                marginTop: '0.5rem',
                padding: '4px 8px',
                background: '#ff4444',
                color: '#fff',
                border: '2px solid #ff4444',
                cursor: 'pointer',
                fontSize: '8px'
              }}
            >
              ▶ TO WORK
            </button>
          </div>

          {/* MEETING ZONE */}
          <div className="zone-box" style={{ borderColor: '#ffaa00' }}>
            <div className="pixel-text" style={{ color: '#ffaa00', marginBottom: '0.5rem' }}>
              ▌MEETING▐
            </div>
            <PixelGrid width="280" height="120">
              {agentsByZone.meeting.map(agent => (
                <AgentPixel key={agent.id} agent={agent} />
              ))}
            </PixelGrid>
            <button
              onClick={() => moveAgent('momo', 'meeting')}
              className="pixel-text"
              style={{
                marginTop: '0.5rem',
                padding: '4px 8px',
                background: '#ffaa00',
                color: '#000',
                border: '2px solid #ffaa00',
                cursor: 'pointer',
                fontSize: '8px'
              }}
            >
              ▶ TO MEET
            </button>
          </div>

          {/* LOUNGE ZONE */}
          <div className="zone-box" style={{ borderColor: '#00ccff' }}>
            <div className="pixel-text" style={{ color: '#00ccff', marginBottom: '0.5rem' }}>
              ▌LOUNGE▐
            </div>
            <PixelGrid width="280" height="120">
              {agentsByZone.lounge.map(agent => (
                <AgentPixel key={agent.id} agent={agent} />
              ))}
            </PixelGrid>
            <button
              onClick={() => moveAgent('alex', 'lounge')}
              className="pixel-text"
              style={{
                marginTop: '0.5rem',
                padding: '4px 8px',
                background: '#00ccff',
                color: '#000',
                border: '2px solid #00ccff',
                cursor: 'pointer',
                fontSize: '8px'
              }}
            >
              ▶ TO LOUNGE
            </button>
          </div>
        </div>

        {/* 중단: 터미널 */}
        <div className="terminal-box">
          <div className="pixel-text" style={{ marginBottom: '0.5rem', color: '#00ff00' }}>
            ▌[TERMINAL LOG]▐
          </div>
          {logs.map((log, idx) => (
            <div key={idx} className="terminal-line">
              {log}
            </div>
          ))}
        </div>

        {/* 하단: 에이전트 상태 + 미션 입력 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* 상태 패널 */}
          <div className="status-box">
            <div className="pixel-text" style={{ color: '#00ff00', marginBottom: '0.5rem' }}>
              ▌[AGENTS STATUS]▐
            </div>
            {agents.map(agent => (
              <div key={agent.id} style={{ marginBottom: '0.8rem', borderBottom: '2px solid #333', paddingBottom: '0.5rem' }}>
                <div className="pixel-text" style={{ color: agent.color, fontWeight: 'bold' }}>
                  {agent.name} - {agent.role}
                </div>
                <div className="pixel-text" style={{ color: '#ffff00', fontSize: '8px' }}>
                  STATUS: {agent.status} | ZONE: {agent.zone.toUpperCase()}
                </div>
              </div>
            ))}
          </div>

          {/* 미션 입력 */}
          <div className="status-box">
            <div className="pixel-text" style={{ color: '#ffff00', marginBottom: '0.5rem' }}>
              ▌[MISSION INPUT]▐
            </div>
            <input
              type="text"
              value={missionInput}
              onChange={(e) => setMissionInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !executing && executeMission()}
              placeholder="Enter mission..."
              disabled={executing}
              className="input-box"
            />
            <button
              onClick={executeMission}
              disabled={executing}
              className="exec-btn pixel-text"
            >
              {executing ? '◀ WAIT ▶' : '▶ EXECUTE ◀'}
            </button>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <div className="pixel-text" style={{ textAlign: 'center', marginTop: '2rem', color: '#666', fontSize: '8px' }}>
        <div>v0.2.0 | PIXEL ART MODE | CSS ANIMATIONS</div>
        <div>▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓</div>
      </div>
    </div>
  );
}
