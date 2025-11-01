# CyberSwarm Repository Analysis

**Repository**: https://github.com/starwreckntx/cyberswarm  
**Analysis Date**: October 29, 2025  
**Purpose**: Understanding the application structure to create a local CLI version with Gemini API integration

---

## Executive Summary

CyberSwarm is a sophisticated **multi-agent cybersecurity simulation platform** built as a Next.js 14 web dashboard. It orchestrates autonomous AI agents that simulate red team (offensive) and blue team (defensive) cybersecurity operations. The system demonstrates event-driven agent coordination, chain-of-thought reasoning, and real-time monitoring capabilities.

**Key Characteristics**:
- **Architecture**: Next.js 14 web application with TypeScript
- **Primary Language**: TypeScript (100%)
- **Agent System**: Multi-agent orchestration with 5 specialized agent types
- **Communication**: Server-Sent Events (SSE) for real-time updates
- **Database**: PostgreSQL with Prisma ORM
- **UI Framework**: React 18 with Radix UI components and Tailwind CSS

---

## Repository Structure

```
cyberswarm/
├── README.md                          # Comprehensive documentation
├── ARCHITECTURE.md                    # System architecture details
├── AGENTS.md                          # Agent behavior documentation
├── DEPLOYMENT.md                      # Deployment instructions
├── CONTRIBUTING.md                    # Contribution guidelines
│
└── app/                               # Main Next.js application
    ├── package.json                   # Dependencies and scripts
    ├── tsconfig.json                  # TypeScript configuration
    ├── next.config.js                 # Next.js configuration
    ├── tailwind.config.ts             # Tailwind CSS configuration
    │
    ├── app/                           # Next.js App Router
    │   ├── layout.tsx                 # Root layout
    │   ├── page.tsx                   # Home page (dashboard)
    │   ├── globals.css                # Global styles
    │   │
    │   └── api/                       # API Routes
    │       ├── agents/route.ts        # Agent management API
    │       ├── simulation/
    │       │   ├── route.ts           # Simulation control
    │       │   ├── inject-task/route.ts  # Task injection
    │       │   └── stream/route.ts    # SSE real-time stream
    │       └── knowledge-base/route.ts
    │
    ├── components/                    # React components
    │   ├── dashboard/                 # Dashboard-specific components
    │   │   ├── cybersecurity-dashboard.tsx
    │   │   ├── agent-control-panel.tsx
    │   │   ├── chain-of-thought-panel.tsx
    │   │   ├── logic-pipe-visualization.tsx
    │   │   ├── real-time-monitor.tsx
    │   │   ├── knowledge-base-explorer.tsx
    │   │   └── dashboard-header.tsx
    │   │
    │   ├── ui/                        # Reusable UI components (Radix UI)
    │   │   ├── button.tsx
    │   │   ├── card.tsx
    │   │   ├── dialog.tsx
    │   │   ├── table.tsx
    │   │   └── ... (60+ UI components)
    │   │
    │   └── theme-provider.tsx         # Dark/light theme support
    │
    ├── lib/                           # Core business logic
    │   ├── types.ts                   # TypeScript type definitions
    │   ├── utils.ts                   # Utility functions
    │   ├── db.ts                      # Database client
    │   │
    │   ├── agents/                    # Agent implementations
    │   │   ├── base-agent.ts          # Abstract base class
    │   │   ├── discovery-agent.ts     # Network reconnaissance
    │   │   ├── vulnerability-scanner-agent.ts
    │   │   ├── patch-management-agent.ts
    │   │   ├── network-monitor-agent.ts
    │   │   └── strategy-adaptation-agent.ts
    │   │
    │   └── orchestrator/              # Orchestration layer
    │       ├── cybersecurity-orchestrator.ts  # Main orchestrator
    │       ├── agent-manager.ts       # Agent lifecycle management
    │       └── logic-pipe.ts          # Event-driven rule engine
    │
    ├── hooks/                         # Custom React hooks
    │   ├── use-simulation-stream.ts   # SSE stream hook
    │   └── use-toast.ts               # Toast notifications
    │
    └── prisma/                        # Database schema
        └── schema.prisma              # Prisma schema definition
```

---

## Core Functionality Overview

### 1. Multi-Agent System Architecture

The application implements a **sophisticated multi-agent orchestration system** with the following components:

#### Agent Types (5 Specialized Agents)

1. **DiscoveryAgent** (`discovery-agent.ts`)
   - **Purpose**: Network reconnaissance and port scanning
   - **Supported Tasks**: `network_scan`, `port_scan`, `service_enum`
   - **Behavior**: Simulates network discovery, identifies live hosts, scans ports
   - **Output Events**: `RECON_DATA`

2. **VulnerabilityScannerAgent** (`vulnerability-scanner-agent.ts`)
   - **Purpose**: Vulnerability detection and assessment
   - **Supported Tasks**: `vuln_scan`, `config_audit`, `webapp_scan`
   - **Behavior**: Cross-references discovered services with CVE database
   - **Output Events**: `VULNERABILITY_FOUND`
   - **CVE Database**: Contains 5+ critical vulnerabilities (Log4j, PrintNightmare, etc.)

3. **PatchManagementAgent** (`patch-management-agent.ts`)
   - **Purpose**: Defensive remediation and patching
   - **Supported Tasks**: `remediate_vuln`, `apply_patch`, `config_harden`
   - **Behavior**: Responds to discovered vulnerabilities with defensive actions
   - **Output Events**: `DEFENSE_ACTION`

4. **NetworkMonitorAgent** (`network-monitor-agent.ts`)
   - **Purpose**: Intrusion detection and monitoring
   - **Supported Tasks**: `monitor_traffic`, `detect_intrusion`, `analyze_logs`
   - **Behavior**: Monitors network activity and detects suspicious behavior
   - **Output Events**: `INTRUSION_DETECTED`

5. **StrategyAdaptationAgent** (`strategy-adaptation-agent.ts`)
   - **Purpose**: Adaptive red team strategy
   - **Supported Tasks**: `adapt_strategy`, `reevaluate_targets`, `change_tactics`
   - **Behavior**: Adjusts attack strategies based on blue team responses
   - **Output Events**: `ATTACK_ADAPTATION`

#### Base Agent Class (`base-agent.ts`)

All agents inherit from `BaseAgent`, which provides:

- **Status Management**: `IDLE`, `BUSY`, `ERROR`, `OFFLINE`
- **Event Emission**: Structured event creation with severity levels
- **Chain of Thought Logging**: Step-by-step reasoning documentation
- **Task Execution Interface**: Abstract `executeTask()` method
- **Callback System**: Real-time updates via callbacks
- **Utility Methods**: Network operation simulation, delays, timing

**Key Methods**:
```typescript
abstract executeTask(task: Task): Promise<CyberEvent>
protected logChainOfThought(stepNumber, stepType, description, reasoning, data?, confidence?, taskId?)
protected emitEvent(eventType, payload, severity?, target?, taskId?)
protected simulateNetworkOperation(operation, target?, complexity?)
```

### 2. Orchestration System

#### CyberSecurityOrchestrator (`cybersecurity-orchestrator.ts`)

The main orchestrator coordinates all system components:

- **Agent Manager Integration**: Manages agent lifecycle
- **Logic Pipe Integration**: Processes events through rule engine
- **Event History**: Maintains event log
- **Chain of Thought History**: Stores reasoning steps
- **Real-time Broadcasting**: SSE stream for live updates
- **Simulation Control**: Start/stop simulation

**Key Methods**:
```typescript
startSimulation(targetNetwork?: string)
stopSimulation()
getSimulationStatus()
getEventHistory(limit?: number)
injectTask(agentType, taskName, target, details)
```

#### Agent Manager (`agent-manager.ts`)

Manages agent lifecycle and task distribution:

- **Agent Initialization**: Creates and registers all 5 agents
- **Task Queue Management**: FIFO task queue with priority
- **Task Assignment**: Matches tasks to available agents
- **Status Tracking**: Monitors agent availability
- **Callback Propagation**: Forwards events to orchestrator

**Task Assignment Logic**:
1. Task added to queue with status `PENDING`
2. Manager finds available agent matching `agentType` and `taskName`
3. Task status updated to `ASSIGNED`, then `EXECUTING`
4. Agent executes task asynchronously
5. Task status updated to `COMPLETED` or `FAILED`

#### Logic Pipe Orchestrator (`logic-pipe.ts`)

Event-driven rule engine implementing three core rules:

**Rule 1: Red Discovers → Blue Reacts**
- Trigger: `RECON_DATA` event
- Action: Create `vuln_scan` task for VulnerabilityScannerAgent
- Trigger: `VULNERABILITY_FOUND` event
- Action: Create `remediate_vuln` task for PatchManagementAgent

**Rule 2: Blue Detects → Red Adapts**
- Trigger: `INTRUSION_DETECTED` event
- Action: Create `adapt_strategy` task for StrategyAdaptationAgent

**Rule 3: Blue Defends → Red Reevaluates**
- Trigger: `DEFENSE_ACTION` event
- Action: Create `reevaluate_targets` task for StrategyAdaptationAgent

**Logic Pipe Execution Flow**:
```
Event → processEvent() → Rule Matching → Task Creation → Task Queue
```

### 3. Type System (`types.ts`)

Comprehensive TypeScript definitions for all entities:

**Core Types**:
- `Agent`: Agent registration and status
- `Task`: Task definition with status tracking
- `CyberEvent`: Security events with payload
- `ChainOfThought`: Reasoning step documentation
- `KnowledgeEntry`: Knowledge base entries
- `LogicPipeExecution`: Rule execution tracking
- `AgentInteraction`: Agent-to-agent interaction flows

**Enums**:
- `AgentStatus`: `IDLE | BUSY | ERROR | OFFLINE`
- `TaskStatus`: `PENDING | ASSIGNED | EXECUTING | COMPLETED | FAILED`
- `Severity`: `Critical | High | Medium | Low`
- `AgentType`: 5 agent type constants
- `EventType`: 12+ event type constants
- `LogicPipeRule`: 3 core rule constants

**Event Payloads**:
- `ReconData`: Network scan results
- `Vulnerability`: CVE information
- `Intrusion`: IDS alert data
- `DefenseAction`: Remediation results
- `AttackAdaptation`: Strategy changes

### 4. Real-Time Communication

#### Server-Sent Events (SSE) Implementation

**Stream Endpoint**: `/api/simulation/stream/route.ts`

Broadcasts real-time updates to connected clients:

**Event Types**:
- `agent_status`: Agent status changes
- `task_update`: Task status changes
- `event_created`: New cybersecurity events
- `chain_of_thought`: Reasoning steps
- `logic_pipe_execution`: Rule executions
- `initial_status`: Initial state on connection
- `heartbeat`: Keep-alive pings

**Client Hook**: `use-simulation-stream.ts`

React hook for consuming SSE stream:
```typescript
const { 
  agents, 
  tasks, 
  events, 
  chainOfThoughts, 
  isConnected 
} = useSimulationStream();
```

### 5. Database Schema (Prisma)

**Database**: PostgreSQL  
**ORM**: Prisma

**Models**:

1. **Agent** - Agent registration and status
   - Fields: `agentId`, `agentName`, `agentType`, `supportedTasks`, `status`, `lastSeen`
   - Relations: `tasks[]`, `chainOfThoughts[]`, `events[]`

2. **Task** - Task tracking
   - Fields: `taskId`, `agentType`, `taskName`, `target`, `details`, `status`, `priority`
   - Relations: `agent`, `events[]`, `chainOfThoughts[]`

3. **Event** - Cybersecurity events
   - Fields: `eventType`, `payload`, `severity`, `target`, `processed`, `timestamp`
   - Relations: `agent`, `task`

4. **ChainOfThought** - Reasoning documentation
   - Fields: `stepNumber`, `stepType`, `description`, `reasoning`, `data`, `confidence`
   - Relations: `agent`, `task`

5. **KnowledgeEntry** - Knowledge base
   - Fields: `category`, `title`, `description`, `data`, `severity`, `tags`, `verified`

6. **LogicPipeExecution** - Rule execution tracking
   - Fields: `triggerEvent`, `ruleApplied`, `inputData`, `outputTasks`, `executionTime`, `success`

7. **AgentInteraction** - Agent interaction flows
   - Fields: `interactionType`, `sourceAgentId`, `targetAgentId`, `triggerEvent`, `flowCompleted`

---

## Key Dependencies

### Core Framework
- **next**: 14.2.28 - React framework
- **react**: 18.2.0 - UI library
- **react-dom**: 18.2.0 - React DOM renderer
- **typescript**: 5.2.2 - Type safety

### Database & ORM
- **@prisma/client**: 6.7.0 - Database client
- **prisma**: 6.7.0 - Database toolkit

### UI Components & Styling
- **@radix-ui/react-***: 60+ accessible component primitives
- **tailwindcss**: 3.3.3 - Utility-first CSS
- **tailwindcss-animate**: 1.0.7 - Animation utilities
- **lucide-react**: 0.446.0 - Icon library
- **framer-motion**: 10.18.0 - Animation library
- **next-themes**: 0.3.0 - Theme management

### Data Visualization
- **recharts**: 2.15.3 - React charting library
- **chart.js**: 4.4.9 - Canvas-based charts
- **react-chartjs-2**: 5.3.0 - React wrapper for Chart.js
- **plotly.js**: 2.35.3 - Interactive plots
- **react-plotly.js**: 2.6.0 - React wrapper for Plotly

### State Management & Data Fetching
- **zustand**: 5.0.3 - State management
- **swr**: 2.2.4 - Data fetching
- **@tanstack/react-query**: 5.0.0 - Server state management
- **jotai**: 2.6.0 - Atomic state management

### Form Handling & Validation
- **react-hook-form**: 7.53.0 - Form management
- **zod**: 3.23.8 - Schema validation
- **yup**: 1.3.0 - Object schema validation
- **formik**: 2.4.5 - Form library

### Utilities
- **uuid**: 11.1.0 - UUID generation
- **date-fns**: 3.6.0 - Date utilities
- **dayjs**: 1.11.13 - Date library
- **lodash**: 4.17.21 - Utility functions
- **clsx**: 2.1.1 - Class name utility
- **class-variance-authority**: 0.7.0 - Variant management

### Authentication (Optional)
- **next-auth**: 4.24.11 - Authentication
- **@next-auth/prisma-adapter**: 1.0.7 - Prisma adapter
- **bcryptjs**: 2.4.3 - Password hashing
- **jsonwebtoken**: 9.0.2 - JWT tokens

---

## Application Flow

### 1. Simulation Lifecycle

```
User Action: Start Simulation
    ↓
POST /api/simulation { action: "start" }
    ↓
CyberSecurityOrchestrator.startSimulation()
    ↓
AgentManager.startSimulation()
    ↓
Initial Task Creation (e.g., network_scan)
    ↓
Task Queue → Agent Assignment
    ↓
Agent.executeTask()
    ↓
Agent emits CyberEvent
    ↓
LogicPipe.processEvent()
    ↓
New Tasks Created (based on rules)
    ↓
Cycle continues...
```

### 2. Event-Driven Workflow Example

**Scenario**: Red team discovers a target, blue team responds

```
1. DiscoveryAgent executes network_scan
   ↓
2. Emits RECON_DATA event
   {
     target_ip: "192.168.1.10",
     open_ports: [22, 80, 443],
     scan_type: "network_discovery"
   }
   ↓
3. LogicPipe Rule 1: Red Discovers → Blue Reacts
   ↓
4. Creates vuln_scan task for VulnerabilityScannerAgent
   ↓
5. VulnerabilityScannerAgent executes vuln_scan
   ↓
6. Emits VULNERABILITY_FOUND event
   {
     cve_id: "CVE-2021-44228",
     target_ip: "192.168.1.10",
     severity: "Critical"
   }
   ↓
7. LogicPipe Rule 1 (continued): Vulnerability → Remediation
   ↓
8. Creates remediate_vuln task for PatchManagementAgent
   ↓
9. PatchManagementAgent executes remediation
   ↓
10. Emits DEFENSE_ACTION event
    {
      action_type: "REMEDIATE",
      target_cve: "CVE-2021-44228",
      status: "SUCCESS"
    }
    ↓
11. LogicPipe Rule 3: Blue Defends → Red Reevaluates
    ↓
12. Creates reevaluate_targets task for StrategyAdaptationAgent
    ↓
13. Cycle continues...
```

### 3. Chain of Thought Example

Each agent logs reasoning steps during task execution:

```typescript
// Step 1: Analysis
logChainOfThought(
  1,
  "analysis",
  "Analyzing task requirements",
  "Received port_scan task for target 192.168.1.10. Preparing reconnaissance approach.",
  { taskName: "port_scan", target: "192.168.1.10" }
)

// Step 2: Decision
logChainOfThought(
  2,
  "decision",
  "Port scanning strategy",
  "Using SYN stealth scan on top 1000 ports to avoid detection while gathering comprehensive service information.",
  { technique: "SYN_stealth", portRange: "top_1000" }
)

// Step 3: Action
logChainOfThought(
  3,
  "action",
  "Executing port scan",
  "Initiating SYN scan on 192.168.1.10. Estimated time: 3s",
  { operation: "port_scan", estimatedTime: 3000 }
)

// Step 4: Evaluation
logChainOfThought(
  4,
  "evaluation",
  "Port scan results analysis",
  "Discovered 3 open ports: 22 (SSH), 80 (HTTP), 443 (HTTPS). Prioritizing web services for further analysis.",
  { openPorts: [22, 80, 443], priority: "web_services" },
  0.92  // confidence score
)
```

### 4. Real-Time Updates Flow

```
Agent/Orchestrator Event
    ↓
Callback to CyberSecurityOrchestrator
    ↓
broadcastStreamEvent()
    ↓
SSE Stream (/api/simulation/stream)
    ↓
EventSource in Browser
    ↓
useSimulationStream() hook
    ↓
React State Update
    ↓
UI Re-render
```

---

## API Endpoints

### 1. Simulation Control

**GET /api/simulation**
- Returns: Current simulation status
- Response:
  ```json
  {
    "isRunning": true,
    "agents": [...],
    "agentStats": {...},
    "taskQueue": [...],
    "recentEvents": [...],
    "recentChainOfThoughts": [...],
    "logicPipeStats": {...}
  }
  ```

**POST /api/simulation**
- Body: `{ "action": "start" | "stop", "targetNetwork": "192.168.1.0/24" }`
- Actions: Start or stop simulation
- Response: Updated simulation status

### 2. Agent Management

**GET /api/agents**
- Returns: All agents and their status
- Response:
  ```json
  {
    "agents": [
      {
        "id": "discovery-01",
        "agentName": "Network Discovery Agent",
        "agentType": "DiscoveryAgent",
        "status": "IDLE",
        "supportedTasks": ["network_scan", "port_scan", "service_enum"]
      },
      ...
    ],
    "agentStats": {...}
  }
  ```

**POST /api/agents**
- Body: `{ "agentId": "discovery-01", "action": "start" | "stop" }`
- Actions: Control individual agent
- Response: Success/failure message

### 3. Task Injection

**POST /api/simulation/inject-task**
- Body:
  ```json
  {
    "agentType": "DiscoveryAgent",
    "taskName": "port_scan",
    "target": "192.168.1.10",
    "details": { "ports": [80, 443] }
  }
  ```
- Actions: Manually inject task into queue
- Response: Created task object

### 4. Real-Time Stream

**GET /api/simulation/stream**
- Protocol: Server-Sent Events (SSE)
- Content-Type: `text/event-stream`
- Events:
  - `agent_status`: Agent status changes
  - `task_update`: Task status changes
  - `event_created`: New cybersecurity events
  - `chain_of_thought`: Reasoning steps
  - `logic_pipe_execution`: Rule executions
  - `heartbeat`: Keep-alive (every 30s)

### 5. Knowledge Base

**GET /api/knowledge-base**
- Query params: `category`, `severity`, `search`
- Returns: Filtered knowledge base entries
- Response:
  ```json
  {
    "entries": [
      {
        "id": "...",
        "category": "vulnerabilities",
        "title": "CVE-2021-44228",
        "description": "Apache Log4j2 RCE",
        "severity": "Critical",
        "tags": ["log4j", "rce", "java"]
      },
      ...
    ]
  }
  ```

---

## UI Components

### Dashboard Components

1. **CyberSecurityDashboard** (`cybersecurity-dashboard.tsx`)
   - Main dashboard container
   - Integrates all sub-components
   - Manages global dashboard state

2. **AgentControlPanel** (`agent-control-panel.tsx`)
   - Displays all agents in grid layout
   - Status indicators (color-coded)
   - Start/stop controls
   - Task injection interface

3. **ChainOfThoughtPanel** (`chain-of-thought-panel.tsx`)
   - Displays reasoning steps chronologically
   - Expandable step details
   - Confidence score visualization
   - Filtering by agent

4. **LogicPipeVisualization** (`logic-pipe-visualization.tsx`)
   - Shows logic pipe executions
   - Rule application tracking
   - Input/output data display
   - Performance metrics

5. **RealTimeMonitor** (`real-time-monitor.tsx`)
   - Live event feed
   - Event filtering by type/severity
   - Timeline visualization
   - Event details modal

6. **KnowledgeBaseExplorer** (`knowledge-base-explorer.tsx`)
   - Categorized browsing
   - Search and filtering
   - Detail view with metadata
   - Related entries linking

7. **DashboardHeader** (`dashboard-header.tsx`)
   - Simulation controls
   - Status indicators
   - Theme toggle
   - Settings menu

### UI Component Library (Radix UI)

60+ reusable components in `components/ui/`:
- **Layout**: Card, Separator, Tabs, Accordion, Collapsible
- **Forms**: Button, Input, Textarea, Select, Checkbox, Radio, Switch
- **Overlays**: Dialog, Sheet, Popover, Tooltip, Hover Card, Context Menu
- **Feedback**: Alert, Toast, Progress, Skeleton
- **Navigation**: Navigation Menu, Breadcrumb, Pagination, Command
- **Data Display**: Table, Badge, Avatar, Calendar
- **Advanced**: Carousel, Resizable, Scroll Area, Date Range Picker

---

## Configuration Files

### package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",           // Development server (port 3000)
    "build": "next build",       // Production build
    "start": "next start",       // Production server
    "lint": "next lint"          // ESLint
  }
}
```

### next.config.js

Basic Next.js configuration (minimal customization)

### tsconfig.json

TypeScript configuration with:
- Strict mode enabled
- Path aliases: `@/*` → `./`
- Target: ES2017
- Module: ESNext

### tailwind.config.ts

Tailwind CSS configuration with:
- Custom color palette
- Dark mode support
- Animation utilities
- Custom plugins

### prisma/schema.prisma

Database schema with:
- PostgreSQL provider
- 7 models (Agent, Task, Event, ChainOfThought, KnowledgeEntry, LogicPipeExecution, AgentInteraction)
- Relations between models
- Indexes for performance

---

## Technical Insights for CLI Conversion

### 1. Core Logic Separation

The application has **excellent separation of concerns**:

**✅ Reusable for CLI**:
- `lib/agents/` - All agent implementations
- `lib/orchestrator/` - Orchestration logic
- `lib/types.ts` - Type definitions
- Logic Pipe rules and event processing

**❌ Web-specific (not needed for CLI)**:
- `components/` - React UI components
- `app/` - Next.js routing and pages
- `hooks/` - React hooks
- SSE streaming (can be replaced with console output)

### 2. Agent System is Self-Contained

Each agent:
- Extends `BaseAgent` abstract class
- Implements `executeTask()` method
- Uses callbacks for event emission
- Simulates network operations with delays
- Logs chain of thought reasoning

**For CLI**: Agents can be used as-is with minimal modifications. Just replace callbacks with console logging or file output.

### 3. Event-Driven Architecture

The system is built around events:
- Agents emit `CyberEvent` objects
- LogicPipe processes events and creates tasks
- AgentManager assigns tasks to agents
- Cycle continues autonomously

**For CLI**: This architecture translates perfectly to a CLI application. Events can be logged to console or file instead of broadcast via SSE.

### 4. No External Backend Required

The current implementation includes:
- In-memory agent instances
- Simulated network operations
- Mock vulnerability database
- Self-contained orchestration

**For CLI**: The system can run entirely locally without any external services. Database is optional (currently used for persistence, not required for core functionality).

### 5. Simulation is Autonomous

Once started:
- Agents execute tasks independently
- Logic Pipe creates new tasks automatically
- System runs until stopped
- No user interaction required during execution

**For CLI**: Perfect for a CLI tool that runs simulations and outputs results.

### 6. Chain of Thought is Well-Structured

Each reasoning step includes:
- Step number and type
- Description and reasoning
- Supporting data
- Confidence score
- Timestamp

**For CLI**: Can be formatted as structured logs or JSON output for analysis.

---

## Gemini API Integration Strategy

### Current AI/LLM Usage

**Current State**: The application does NOT currently use any LLM/AI API. All agent behavior is **simulated** with:
- Hardcoded logic
- Random selection from predefined options
- Simulated delays
- Mock data generation

**Example from `discovery-agent.ts`**:
```typescript
// Simulated host discovery
const liveHosts = ['192.168.1.10', '192.168.1.15', '192.168.1.20'];
const selectedHost = liveHosts[Math.floor(Math.random() * liveHosts.length)];
```

### Gemini Integration Opportunities

To create an **intelligent CLI version with Gemini**, replace simulated logic with Gemini API calls:

#### 1. Agent Decision Making

**Current**: Hardcoded decisions  
**With Gemini**: LLM-powered reasoning

```typescript
// Example: Discovery Agent with Gemini
async portScan(task: Task): Promise<CyberEvent> {
  const target = task.target;
  
  // Use Gemini to decide scanning strategy
  const prompt = `
    You are a cybersecurity reconnaissance agent.
    Target: ${target}
    Task: Determine the optimal port scanning strategy.
    Consider: stealth, speed, comprehensiveness.
    Output: JSON with strategy, ports, technique, reasoning.
  `;
  
  const geminiResponse = await gemini.generateContent(prompt);
  const strategy = JSON.parse(geminiResponse.text);
  
  // Log chain of thought from Gemini
  this.logChainOfThought(
    2,
    "decision",
    "Port scanning strategy",
    strategy.reasoning,
    strategy
  );
  
  // Execute scan based on Gemini's decision
  // ...
}
```

#### 2. Vulnerability Analysis

**Current**: Lookup in hardcoded CVE database  
**With Gemini**: Intelligent vulnerability assessment

```typescript
// Example: Vulnerability Scanner with Gemini
async vulnerabilityScan(task: Task): Promise<CyberEvent> {
  const { target, ports, services } = task.details;
  
  const prompt = `
    Analyze this target for vulnerabilities:
    Target: ${target}
    Open Ports: ${ports.join(', ')}
    Services: ${JSON.stringify(services)}
    
    Identify potential vulnerabilities (CVEs) and assess severity.
    Output: JSON array of vulnerabilities with CVE IDs, descriptions, severity.
  `;
  
  const geminiResponse = await gemini.generateContent(prompt);
  const vulnerabilities = JSON.parse(geminiResponse.text);
  
  // Emit vulnerability events
  for (const vuln of vulnerabilities) {
    this.emitEvent(EventType.VULNERABILITY_FOUND, vuln, vuln.severity, target);
  }
}
```

#### 3. Strategy Adaptation

**Current**: Random strategy changes  
**With Gemini**: Intelligent adaptation based on context

```typescript
// Example: Strategy Adaptation with Gemini
async adaptStrategy(task: Task): Promise<CyberEvent> {
  const { detectedBy, defenseActions, currentStrategy } = task.details;
  
  const prompt = `
    You are a red team strategy agent.
    Current Strategy: ${currentStrategy}
    Detection Event: ${detectedBy}
    Blue Team Actions: ${JSON.stringify(defenseActions)}
    
    Adapt your strategy to evade detection and continue operations.
    Consider: stealth techniques, alternative targets, timing changes.
    Output: JSON with new strategy, reasoning, techniques, confidence.
  `;
  
  const geminiResponse = await gemini.generateContent(prompt);
  const adaptation = JSON.parse(geminiResponse.text);
  
  this.logChainOfThought(
    3,
    "decision",
    "Strategy adaptation",
    adaptation.reasoning,
    adaptation,
    adaptation.confidence
  );
  
  return this.emitEvent(
    EventType.ATTACK_ADAPTATION,
    adaptation,
    'High',
    task.target
  );
}
```

#### 4. File Tools Integration

**Gemini File API** can be used for:

1. **Knowledge Base Management**
   - Upload CVE databases, threat intelligence feeds
   - Query for relevant vulnerabilities
   - Semantic search across security documentation

2. **Report Generation**
   - Upload simulation logs
   - Generate comprehensive security reports
   - Analyze patterns and trends

3. **Configuration Files**
   - Upload network topology files
   - Parse and analyze target configurations
   - Generate attack/defense scenarios

**Example**:
```typescript
// Upload knowledge base to Gemini
const knowledgeFile = await gemini.uploadFile('cve_database.json');

// Query with file context
const prompt = `
  Using the CVE database in ${knowledgeFile.name},
  identify vulnerabilities for these services:
  - Apache 2.4.49 on port 80
  - OpenSSH 7.4 on port 22
  - MySQL 5.7 on port 3306
`;

const response = await gemini.generateContent([prompt, knowledgeFile]);
```

#### 5. Multi-Agent Coordination

**With Gemini**: Intelligent coordination between agents

```typescript
// Example: Orchestrator with Gemini
async coordinateAgents(currentState: SimulationState): Promise<Task[]> {
  const prompt = `
    You are coordinating a cybersecurity simulation.
    
    Current State:
    - Active Agents: ${currentState.agents.map(a => a.agentName).join(', ')}
    - Recent Events: ${JSON.stringify(currentState.recentEvents)}
    - Pending Tasks: ${currentState.taskQueue.length}
    
    Determine the next optimal tasks to assign.
    Consider: priority, dependencies, resource availability, strategic goals.
    Output: JSON array of tasks with agentType, taskName, target, priority, reasoning.
  `;
  
  const geminiResponse = await gemini.generateContent(prompt);
  const tasks = JSON.parse(geminiResponse.text);
  
  return tasks.map(t => this.createTask(t));
}
```

### Gemini API Setup for CLI

```typescript
// lib/gemini-client.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: any;
  
  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      }
    });
  }
  
  async generateContent(prompt: string): Promise<any> {
    const result = await this.model.generateContent(prompt);
    return result.response;
  }
  
  async uploadFile(path: string): Promise<any> {
    const fileManager = this.genAI.fileManager;
    return await fileManager.uploadFile(path);
  }
  
  async generateWithFiles(prompt: string, files: any[]): Promise<any> {
    const result = await this.model.generateContent([prompt, ...files]);
    return result.response;
  }
}
```

---

## CLI Conversion Roadmap

### Phase 1: Core Extraction
1. ✅ Extract agent classes from `lib/agents/`
2. ✅ Extract orchestrator from `lib/orchestrator/`
3. ✅ Extract types from `lib/types.ts`
4. ✅ Remove React/Next.js dependencies

### Phase 2: CLI Interface
1. Create CLI entry point with argument parsing
2. Implement console-based output (replace SSE)
3. Add configuration file support (YAML/JSON)
4. Implement logging system (file + console)

### Phase 3: Gemini Integration
1. Add Gemini API client
2. Replace agent simulation logic with Gemini calls
3. Implement file tools for knowledge base
4. Add prompt templates for each agent type

### Phase 4: Enhanced Features
1. Add report generation
2. Implement result export (JSON, CSV, PDF)
3. Add interactive mode (user can inject tasks)
4. Implement scenario templates

### Phase 5: Testing & Documentation
1. Unit tests for agents
2. Integration tests for orchestrator
3. CLI usage documentation
4. Example scenarios and configurations

---

## Key Files to Port for CLI

### Essential (Must Port)
1. `lib/types.ts` - Type definitions
2. `lib/agents/base-agent.ts` - Base agent class
3. `lib/agents/discovery-agent.ts` - Discovery agent
4. `lib/agents/vulnerability-scanner-agent.ts` - Vulnerability scanner
5. `lib/agents/patch-management-agent.ts` - Patch management
6. `lib/agents/network-monitor-agent.ts` - Network monitor
7. `lib/agents/strategy-adaptation-agent.ts` - Strategy adaptation
8. `lib/orchestrator/agent-manager.ts` - Agent manager
9. `lib/orchestrator/logic-pipe.ts` - Logic pipe
10. `lib/orchestrator/cybersecurity-orchestrator.ts` - Main orchestrator

### Optional (Nice to Have)
1. `lib/db.ts` - Database client (for persistence)
2. `prisma/schema.prisma` - Database schema (for logging)
3. Knowledge base data structures

### Not Needed for CLI
1. All `components/` - React UI
2. All `app/` - Next.js routing
3. All `hooks/` - React hooks
4. `next.config.js`, `tailwind.config.ts` - Web configs

---

## Recommended CLI Architecture

```
cyberswarm-cli/
├── src/
│   ├── index.ts                    # CLI entry point
│   ├── cli.ts                      # Argument parsing (Commander.js)
│   ├── config.ts                   # Configuration management
│   │
│   ├── agents/                     # Agent implementations (ported)
│   │   ├── base-agent.ts
│   │   ├── discovery-agent.ts
│   │   ├── vulnerability-scanner-agent.ts
│   │   ├── patch-management-agent.ts
│   │   ├── network-monitor-agent.ts
│   │   └── strategy-adaptation-agent.ts
│   │
│   ├── orchestrator/               # Orchestration (ported)
│   │   ├── agent-manager.ts
│   │   ├── logic-pipe.ts
│   │   └── cybersecurity-orchestrator.ts
│   │
│   ├── gemini/                     # Gemini integration (new)
│   │   ├── gemini-client.ts
│   │   ├── prompts.ts
│   │   └── file-manager.ts
│   │
│   ├── output/                     # Output handlers (new)
│   │   ├── console-logger.ts
│   │   ├── file-logger.ts
│   │   ├── report-generator.ts
│   │   └── formatters.ts
│   │
│   ├── types.ts                    # Type definitions (ported)
│   └── utils.ts                    # Utilities
│
├── config/                         # Configuration files
│   ├── default.yaml
│   ├── scenarios/
│   │   ├── basic-scan.yaml
│   │   ├── full-pentest.yaml
│   │   └── defensive-only.yaml
│   └── prompts/
│       ├── discovery.txt
│       ├── vulnerability.txt
│       └── strategy.txt
│
├── knowledge/                      # Knowledge base files
│   ├── cve-database.json
│   ├── exploits.json
│   └── defense-patterns.json
│
├── output/                         # Output directory
│   ├── logs/
│   ├── reports/
│   └── exports/
│
├── package.json
├── tsconfig.json
└── README.md
```

### CLI Commands

```bash
# Start simulation
cyberswarm start --target 192.168.1.0/24 --scenario basic-scan

# Start with custom config
cyberswarm start --config ./my-config.yaml

# Interactive mode
cyberswarm interactive

# Generate report from logs
cyberswarm report --input ./output/logs/simulation-123.json --format pdf

# List available scenarios
cyberswarm scenarios

# Validate configuration
cyberswarm validate --config ./my-config.yaml
```

---

## Dependencies for CLI Version

### Core Dependencies
```json
{
  "dependencies": {
    "@google/generative-ai": "^0.21.0",  // Gemini API
    "commander": "^12.0.0",               // CLI framework
    "chalk": "^5.3.0",                    // Terminal colors
    "ora": "^8.0.0",                      // Spinners
    "inquirer": "^10.0.0",                // Interactive prompts
    "winston": "^3.11.0",                 // Logging
    "yaml": "^2.3.4",                     // YAML parsing
    "uuid": "^11.1.0",                    // UUID generation
    "date-fns": "^3.6.0",                 // Date utilities
    "zod": "^3.23.8"                      // Schema validation
  },
  "devDependencies": {
    "typescript": "^5.2.2",
    "@types/node": "^20.6.2",
    "tsx": "^4.20.3",                     // TypeScript execution
    "vitest": "^1.0.0"                    // Testing
  }
}
```

### Optional Dependencies
```json
{
  "dependencies": {
    "pdfkit": "^0.15.0",                  // PDF generation
    "csv-writer": "^1.6.0",               // CSV export
    "table": "^6.8.1",                    // Terminal tables
    "boxen": "^7.1.1",                    // Terminal boxes
    "figlet": "^1.7.0"                    // ASCII art
  }
}
```

---

## Summary

### What CyberSwarm Does
- **Multi-agent cybersecurity simulation** with 5 specialized agents
- **Event-driven orchestration** with 3 core logic pipe rules
- **Chain of thought reasoning** for transparency
- **Real-time monitoring** via SSE
- **Web dashboard** for visualization and control

### What Makes It Suitable for CLI Conversion
- ✅ **Self-contained agent system** - no external dependencies
- ✅ **Clear separation of concerns** - business logic separate from UI
- ✅ **Event-driven architecture** - easy to log/output
- ✅ **Autonomous operation** - runs without user interaction
- ✅ **Well-structured types** - TypeScript definitions for everything
- ✅ **Simulated operations** - easy to replace with Gemini API calls

### What Needs to Change for CLI
- ❌ Remove React/Next.js UI components
- ❌ Replace SSE with console/file output
- ❌ Add CLI argument parsing
- ❌ Add configuration file support
- ✅ Integrate Gemini API for intelligent decisions
- ✅ Add file tools for knowledge base
- ✅ Implement report generation

### Gemini Integration Points
1. **Agent Decision Making** - Replace hardcoded logic with LLM reasoning
2. **Vulnerability Analysis** - Intelligent CVE identification
3. **Strategy Adaptation** - Context-aware tactical changes
4. **Multi-Agent Coordination** - Optimal task prioritization
5. **Knowledge Base** - File tools for CVE databases and threat intel
6. **Report Generation** - Comprehensive analysis and recommendations

---

## Next Steps

1. **Create CLI project structure** with TypeScript
2. **Port core agent classes** from `lib/agents/`
3. **Port orchestrator** from `lib/orchestrator/`
4. **Implement Gemini client** with file tools support
5. **Create CLI interface** with Commander.js
6. **Add output formatters** (console, file, JSON, PDF)
7. **Implement configuration system** (YAML-based)
8. **Add scenario templates** for common use cases
9. **Write tests** for agents and orchestrator
10. **Create documentation** with examples

---

**Analysis Complete** ✅

This analysis provides a comprehensive understanding of the CyberSwarm application and a clear roadmap for creating a local CLI version with Gemini API integration and file tools access.
