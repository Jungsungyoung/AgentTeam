# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**My Office** is an 8-bit pixel art visualizer that simulates AI agent collaboration in a virtual office environment. Users input missions, and agents (LEO, MOMO, ALEX) collaborate by moving between zones (Work, Meeting, Lounge) with animated pixel art representations.

**Tech Stack:**
- Next.js 16+ (App Router)
- TypeScript 5+
- Zustand (state management)
- Tailwind CSS 4+ with Shadcn/ui components
- Pure CSS animations (no external animation libraries in MVP)

## Essential Commands

```bash
# Development (run from my-office/)
npm run dev              # Start dev server on localhost:3000
npm run build            # Production build
npm start                # Run production build
npm run lint             # ESLint checks
npm run format           # Auto-format with Prettier
npm run format:check     # Check formatting without changes
```

**Important:** All commands should be run from the `my-office/` directory, which contains the main Next.js application.

## Project Structure

```
02_AgentTeam_02/
├── my-office/                    # Main Next.js application
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # Main office visualization page
│   │   └── globals.css           # Global styles & animations
│   ├── components/
│   │   ├── agents/               # Agent visualization components
│   │   │   ├── AgentPixelArt.tsx # Pixel art rendering (16x16 grid)
│   │   │   ├── AgentCard.tsx     # Agent detail cards
│   │   │   └── AgentStatusPanel.tsx
│   │   ├── office/               # Zone components
│   │   │   ├── OfficeLayout.tsx  # Main layout wrapper
│   │   │   ├── WorkZone.tsx
│   │   │   ├── MeetingRoom.tsx
│   │   │   └── Lounge.tsx
│   │   ├── mission/              # Mission control UI
│   │   │   ├── MissionInput.tsx  # User input interface
│   │   │   └── TerminalLog.tsx   # Log display
│   │   └── ui/                   # Shadcn/ui components
│   ├── lib/
│   │   ├── store/                # Zustand stores
│   │   │   ├── agentStore.ts     # Agent state (position, status, zone)
│   │   │   ├── missionStore.ts   # Mission lifecycle management
│   │   │   └── logStore.ts       # Terminal log messages
│   │   ├── types/                # TypeScript type definitions
│   │   │   ├── agent.ts          # Agent, AgentStatus, Zone types
│   │   │   ├── mission.ts        # Mission, MissionStatus types
│   │   │   └── log.ts            # LogMessage, LogType types
│   │   ├── pixelData.ts          # 16x16 pixel patterns for agents
│   │   ├── colors.ts             # Agent color palette
│   │   └── utils.ts              # Tailwind cn utility
│   └── docs/                     # Implementation guides
├── PRD_AgentTeam.md              # Product Requirements Document
└── DotAgentOffice*.jsx           # Prototype components (reference only)
```

## Core Architecture

### State Management (Zustand)

The application uses **three independent Zustand stores**:

1. **agentStore** (`lib/store/agentStore.ts`)
   - Manages agent positions (x, y), zones, status, and stress levels
   - Key actions: `updateAgent`, `setAgentStatus`, `setAgentZone`, `setAgentPosition`
   - Includes Redux DevTools integration (store name: `agent-store`)

2. **missionStore** (`lib/store/missionStore.ts`)
   - Tracks mission lifecycle (pending → processing → completed)
   - Key actions: `addMission`, `setMissionStatus`, `assignAgent`, `completeMission`
   - Store name: `mission-store`

3. **logStore** (`lib/store/logStore.ts`)
   - Terminal-style log messages with types: SYSTEM, MISSION, COLLAB, COMPLETE, AGENT
   - Auto-limits to 100 logs (configurable with `maxLogs`)
   - Key actions: `addSystemLog`, `addMissionLog`, `addAgentLog`, `clearOldLogs`

**Performance Note:** Always use **selective subscription** in components:
```tsx
// ✅ Good: Subscribe to specific slice
const agents = useAgentStore(state => state.agents);

// ❌ Bad: Subscribe to entire store
const { agents, selectedAgentId } = useAgentStore();
```

### Agent System

**Three agents with distinct personas:**
- **LEO** (#ff4444 red): Code Master - Development/Implementation
- **MOMO** (#ffaa00 orange): Planning Genius - Strategy/Planning
- **ALEX** (#00ccff cyan): Analyst - Analysis/Verification

**Agent States (AgentStatus):**
- `IDLE` - Default waiting state
- `MOVING` - Transitioning between zones (0.6s animation)
- `WORKING` - Executing tasks
- `COMMUNICATING` - Collaborating with other agents (brightness animation)
- `RESTING` - In lounge zone

**Zones:**
- `work` - Individual workstations (default starting position)
- `meeting` - Collaboration space (2-3 agents)
- `lounge` - Rest area for stress reduction

### Pixel Art System

**Rendering:** 16x16 pixel grid rendered with CSS (3px per pixel)
- Patterns defined in `lib/pixelData.ts` as 2D arrays
- Each agent has unique pixel art pattern with primary + dark border colors
- Animations: `jumping` (MOVING state), `talking` (COMMUNICATING state)

**Performance Target:** 60fps animations, <2s initial load

## Key Concepts & Patterns

### Path Aliases

TypeScript path alias `@/*` maps to `my-office/` root:
```tsx
import { useAgentStore } from '@/lib/store';
import { Agent } from '@/lib/types';
```

### Component Patterns

1. **AgentPixelArt.tsx** - Pure rendering component, receives agent data as props
2. **Zone components** - Self-contained, manage their own layout and agent positioning
3. **Store hooks** - Use selective subscription to prevent unnecessary re-renders

### Animation Timing

Mission execution follows predefined timeline:
- 0ms: Mission log output
- 300ms: LEO moves to meeting room
- 700ms: MOMO moves to meeting room
- 1100ms: Collaboration starts (COMMUNICATING state)
- 2800ms: Mission complete, agents return to work zone

### Styling Conventions

- Tailwind CSS 4+ for all styling
- Shadcn/ui for common UI components (Button, Card, Input, etc.)
- Custom animations defined in `app/globals.css`
- 8-bit/retro aesthetic: monospace fonts (Courier New), pixelated graphics, terminal-style logs

## Development Guidelines

### Adding New Agents

1. Add agent ID to `AgentId` type in `lib/types/agent.ts`
2. Define color in `AGENT_COLORS` constant
3. Create pixel pattern in `lib/pixelData.ts`
4. Initialize agent in store on app mount

### Adding New Zones

1. Add zone to `Zone` type in `lib/types/agent.ts`
2. Create zone component in `components/office/`
3. Update `OfficeLayout.tsx` to include new zone
4. Add zone transition logic in agent movement actions

### Mission Workflow

Missions are currently simulated (Phase 1 MVP). Phase 2 will integrate Claude API for real AI agent behavior. Current flow:
1. User inputs mission via `MissionInput.tsx`
2. Mission added to `missionStore`
3. Hardcoded animation sequence executes (see Animation Timing above)
4. Logs written to `logStore` and displayed in `TerminalLog.tsx`

## Important Files

- `PRD_AgentTeam.md` - Complete product requirements, roadmap, and technical specs
- `my-office/README.md` - Project overview and getting started guide
- `my-office/docs/state-management-guide.md` - Comprehensive Zustand usage guide
- `my-office/SETUP.md` - Initial setup checklist and completion status

## TypeScript Configuration

- Strict mode enabled
- Path aliases: `@/*` → project root
- Target: ES2017
- React JSX: react-jsx (automatic runtime)

## Development Phases

**Current: Phase 1 (MVP) - Complete**
- ✅ Basic UI with pixel art rendering
- ✅ Agent movement and animations
- ✅ Zustand state management
- ✅ Simulated mission execution

**Next: Phase 2 (In Progress)**
- [ ] Claude API integration for real AI agents
- [ ] Dynamic mission parsing and task distribution
- [ ] Chat bubble UI for agent communication
- [ ] Real-time log streaming

**Future: Phase 3+**
- [ ] Stress level visualization
- [ ] Performance metrics (XP, achievements)
- [ ] Additional agents (5-8 total)
- [ ] Customizable themes and layouts

## Common Tasks

**Update agent position:**
```tsx
const setPosition = useAgentStore(state => state.setAgentPosition);
setPosition('leo', 150, 75); // x, y in pixels
```

**Change agent status:**
```tsx
const setStatus = useAgentStore(state => state.setAgentStatus);
setStatus('momo', 'COMMUNICATING');
```

**Add log entry:**
```tsx
const addLog = useLogStore(state => state.addAgentLog);
addLog('alex', 'Analyzing requirements...');
```

## Debugging

- Redux DevTools available for all Zustand stores (open browser DevTools → Redux tab)
- Store names: `agent-store`, `mission-store`, `log-store`
- Animations can be inspected in browser DevTools → Animations panel
- Check `app/globals.css` for animation keyframe definitions
