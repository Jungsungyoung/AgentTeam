import React, { useState } from 'react';

export default function DotAgentOfficePixelArtFinal() {
  const [agents, setAgents] = useState([
    { id: 'leo', name: 'LEO', zone: 'work', status: 'IDLE', color: '#ff4444', x: 40, y: 40 },
    { id: 'momo', name: 'MOMO', zone: 'work', status: 'IDLE', color: '#ffaa00', x: 140, y: 40 },
    { id: 'alex', name: 'ALEX', zone: 'work', status: 'IDLE', color: '#00ccff', x: 240, y: 40 }
  ]);

  const [logs, setLogs] = useState([
    '> SYSTEM ONLINE',
    '> AGENTS READY: 3/3',
    '> AWAITING MISSION'
  ]);

  const [missionInput, setMissionInput] = useState('');
  const [executing, setExecuting] = useState(false);

  // 고품질 픽셀 에이전트 렌더러
  const PixelCharacter = ({ agent, offsetX = 0, offsetY = 0 }) => {
    // 각 에이전트의 고유 픽셀 패턴 (16x16)
    const pixelMap = {
      leo: [
        '0011110000000000',
        '0111111000000000',
        '1111111100000000',
        '1100011100000000',
        '1100011100000000',
        '1111111100000000',
        '0111111000000000',
        '0011110000000000',
        '0001100000000000',
        '0011110000000000',
        '0111111000000000',
        '1100011100000000',
        '0111111000000000',
        '0011110000000000',
        '0000000000000000',
        '0000000000000000'
      ],
      momo: [
        '0000000000000000',
        '0011111100000000',
        '0111111110000000',
        '1111111111000000',
        '1100001111000000',
        '1100001111000000',
        '1111111111000000',
        '0111111110000000',
        '0011111100000000',
        '0011111100000000',
        '0111111110000000',
        '1111111111000000',
        '1100111111000000',
        '0111111110000000',
        '0000000000000000',
        '0000000000000000'
      ],
      alex: [
        '0000000000000000',
        '0011110000000000',
        '0111111000000000',
        '1111111100000000',
        '1110011100000000',
        '1110011100000000',
        '1111111100000000',
        '1111111100000000',
        '1100110100000000',
        '1100110100000000',
        '0111111000000000',
        '0111111000000000',
        '0011110000000000',
        '0000000000000000',
        '0000000000000000',
        '0000000000000000'
      ]
    };

    const pattern = pixelMap[agent.id] || pixelMap.leo;
    const pixelSize = 3;
    const darkColor = agent.color === '#ff4444' ? '#aa0000' : 
                      agent.color === '#ffaa00' ? '#aa6600' : 
                      '#0088aa';

    const isAnimating = agent.status === 'MOVING' ? 'jumping' : 
                        agent.status === 'COMMUNICATING' ? 'talking' : '';

    return (
      <div
        style={{
          position: 'absolute',
          left: `${agent.x + offsetX}px`,
          top: `${agent.y + offsetY}px`,
          animation: isAnimating ? `${isAnimating} 0.6s infinite` : 'none',
          display: 'inline-block'
        }}
      >
        {pattern.map((row, y) => (
          <div key={y} style={{ display: 'flex' }}>
            {row.split('').map((pixel, x) => (
              <div
                key={`${y}-${x}`}
                style={{
                  width: `${pixelSize}px`,
                  height: `${pixelSize}px`,
                  backgroundColor: pixel === '1' ? agent.color : 'transparent',
                  border: pixel === '1' ? `0.5px solid ${darkColor}` : 'none',
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
        x: targetZone === 'work' ? 40 + Math.random() * 80 : 
           targetZone === 'meeting' ? 140 + Math.random() * 60 :
           240 + Math.random() * 60,
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
    addLog(`> [MISSION] ${missionInput.substring(0, 35)}`);
    
    setTimeout(() => {
      addLog('> LEO: ANALYZING');
      moveAgent('leo', 'meeting');
    }, 300);

    setTimeout(() => {
      addLog('> MOMO: COLLABORATING');
      moveAgent('momo', 'meeting');
    }, 700);

    setTimeout(() => {
      addLog('> [COLLAB] DISCUSSION ACTIVE');
      setAgents(prev => prev.map(a => 
        (a.id === 'leo' || a.id === 'momo') ? { ...a, status: 'COMMUNICATING' } : a
      ));
    }, 1100);

    setTimeout(() => {
      addLog('> [COMPLETE] MISSION SUCCESS');
      setAgents(prev => prev.map(a => ({ ...a, status: 'IDLE' })));
      setExecuting(false);
    }, 2800);

    setMissionInput('');
  };

  const addLog = (msg) => {
    setLogs(prev => [...prev.slice(-4), msg]);
  };

  const agentsByZone = {
    work: agents.filter(a => a.zone === 'work'),
    meeting: agents.filter(a => a.zone === 'meeting'),
    lounge: agents.filter(a => a.zone === 'lounge')
  };

  const Zone = ({ title, color, agents: zoneAgents, moveZone, onMove }) => (
    <div style={{
      border: `3px solid ${color}`,
      padding: '0.8rem',
      background: '#1a1a2e',
      minHeight: '160px',
      position: 'relative',
      marginBottom: '1rem'
    }}>
      <div style={{
        fontSize: '10px',
        fontWeight: 'bold',
        color: color,
        marginBottom: '0.5rem',
        letterSpacing: '1px'
      }}>
        ▌{title}▐
      </div>
      
      <div style={{
        position: 'relative',
        height: '110px',
        border: `2px dotted ${color}`,
        backgroundColor: '#0a0a0a',
        overflow: 'hidden'
      }}>
        {zoneAgents.map(agent => (
          <PixelCharacter key={agent.id} agent={agent} />
        ))}
      </div>

      <button
        onClick={() => onMove(moveZone)}
        style={{
          marginTop: '0.5rem',
          padding: '0.4rem 0.8rem',
          background: color,
          color: color === '#ffaa00' ? '#000' : '#fff',
          border: `2px solid ${color}`,
          fontFamily: 'monospace',
          fontSize: '9px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.15s',
          width: '100%'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        ▶ TO {title}
      </button>
    </div>
  );

  return (
    <div style={{
      backgroundColor: '#000000',
      minHeight: '100vh',
      padding: '1.5rem',
      fontFamily: '"Courier New", monospace',
      color: '#00ff00',
      overflow: 'auto'
    }}>
      <style>{`
        @keyframes jumping {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        @keyframes talking {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.4); }
        }

        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: #0a0a0a;
        }

        ::-webkit-scrollbar-thumb {
          background: #00ff00;
          border: 1px solid #000;
        }
      `}</style>

      {/* 제목 */}
      <div style={{
        textAlign: 'center',
        marginBottom: '1.5rem',
        fontSize: '10px',
        lineHeight: '1.6',
        letterSpacing: '2px'
      }}>
        <div style={{ color: '#ff00ff', fontWeight: 'bold' }}>
          ╔════════════════════════════════════╗
        </div>
        <div style={{ color: '#00ffff', fontWeight: 'bold' }}>
          ║ DOT AGENT OFFICE - PIXEL ART v0.2 ║
        </div>
        <div style={{ color: '#ffff00', fontWeight: 'bold' }}>
          ║   8-BIT COLLABORATION DASHBOARD    ║
        </div>
        <div style={{ color: '#ff00ff', fontWeight: 'bold' }}>
          ╚════════════════════════════════════╝
        </div>
      </div>

      {/* 메인 컨테이너 */}
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* 3개 존 그리드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.8rem',
          marginBottom: '1rem'
        }}>
          <Zone
            title="WORK"
            color="#ff4444"
            agents={agentsByZone.work}
            moveZone="work"
            onMove={(zone) => moveAgent('leo', zone)}
          />
          <Zone
            title="MEETING"
            color="#ffaa00"
            agents={agentsByZone.meeting}
            moveZone="meeting"
            onMove={(zone) => moveAgent('momo', zone)}
          />
          <Zone
            title="LOUNGE"
            color="#00ccff"
            agents={agentsByZone.lounge}
            moveZone="lounge"
            onMove={(zone) => moveAgent('alex', zone)}
          />
        </div>

        {/* 터미널 */}
        <div style={{
          border: '3px solid #00ff00',
          padding: '0.8rem',
          background: '#000',
          marginBottom: '1rem',
          minHeight: '100px',
          maxHeight: '140px',
          overflowY: 'auto'
        }}>
          <div style={{
            fontSize: '10px',
            color: '#00ff00',
            fontWeight: 'bold',
            marginBottom: '0.5rem'
          }}>
            ▌[TERMINAL LOG]▐
          </div>
          {logs.map((log, idx) => (
            <div key={idx} style={{
              fontSize: '9px',
              margin: '0.3rem 0',
              color: '#00ff00',
              lineHeight: '1.4'
            }}>
              {log}
            </div>
          ))}
        </div>

        {/* 하단: 상태 + 입력 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.8rem'
        }}>
          {/* 에이전트 상태 */}
          <div style={{
            border: '3px solid #ffff00',
            padding: '0.8rem',
            background: '#0a0a0a'
          }}>
            <div style={{
              fontSize: '10px',
              color: '#ffff00',
              fontWeight: 'bold',
              marginBottom: '0.5rem'
            }}>
              ▌[AGENTS]▐
            </div>
            {agents.map(agent => (
              <div key={agent.id} style={{
                fontSize: '8px',
                marginBottom: '0.6rem',
                paddingBottom: '0.4rem',
                borderBottom: '1px solid #444'
              }}>
                <div style={{ color: agent.color, fontWeight: 'bold' }}>
                  {agent.name}
                </div>
                <div style={{ color: '#00ff00', fontSize: '7px' }}>
                  {agent.status} | {agent.zone.toUpperCase()}
                </div>
              </div>
            ))}
          </div>

          {/* 미션 입력 */}
          <div style={{
            border: '3px solid #ff00ff',
            padding: '0.8rem',
            background: '#0a0a0a'
          }}>
            <div style={{
              fontSize: '10px',
              color: '#ff00ff',
              fontWeight: 'bold',
              marginBottom: '0.5rem'
            }}>
              ▌[MISSION]▐
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
                padding: '0.4rem',
                border: '2px solid #ff00ff',
                background: '#1a1a2e',
                color: '#ff00ff',
                fontFamily: 'monospace',
                fontSize: '9px',
                marginBottom: '0.5rem',
                boxSizing: 'border-box'
              }}
            />
            <button
              onClick={executeMission}
              disabled={executing}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '2px solid #00ff00',
                background: '#00ff00',
                color: '#000',
                fontFamily: 'monospace',
                fontSize: '9px',
                fontWeight: 'bold',
                cursor: 'pointer',
                opacity: executing ? 0.6 : 1,
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => !executing && (e.target.style.background = '#ffff00')}
              onMouseLeave={(e) => !executing && (e.target.style.background = '#00ff00')}
            >
              {executing ? '◄ WAIT ►' : '◄ EXECUTE ►'}
            </button>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <div style={{
        textAlign: 'center',
        marginTop: '1.5rem',
        fontSize: '8px',
        color: '#444',
        letterSpacing: '1px'
      }}>
        <div>v0.2.0 PIXEL ART EDITION</div>
        <div>{'>'.repeat(50)}</div>
      </div>
    </div>
  );
}
