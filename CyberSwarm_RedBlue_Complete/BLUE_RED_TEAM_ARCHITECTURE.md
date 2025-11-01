# CyberSwarm: Blue Team vs Red Team Architecture

## Executive Summary

This document outlines the production architecture for deploying CyberSwarm as a realistic cybersecurity exercise platform with proper network segmentation between:
- **Blue Team (Defensive)**: On-premises defensive agents
- **Red Team (Offensive)**: External attacking agents  
- **Orchestrator**: On-premises coordination and monitoring

## Architecture Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL NETWORK                            │
│                         (Untrusted Zone)                           │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                    RED TEAM DEPLOYMENT                        │ │
│  │               (Cloud VPS / Attack Platform)                   │ │
│  │                                                               │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │ │
│  │  │ Discovery   │  │Vulnerability│  │  Exploit    │         │ │
│  │  │   Agent     │  │   Scanner   │  │  Agent      │         │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │ │
│  │                                                               │ │
│  │  ┌─────────────┐  ┌─────────────┐                           │ │
│  │  │   Social    │  │   Network   │                           │ │
│  │  │ Engineering │  │  Recon      │                           │ │
│  │  └─────────────┘  └─────────────┘                           │ │
│  └──────────────────────────────────────────────────────────────┘ │
└───────────────────────┬────────────────────────────────────────────┘
                        │
                        │ HTTPS/WSS (Encrypted C2 Channel)
                        │ Port 443
                        │
┌───────────────────────┴────────────────────────────────────────────┐
│                          DMZ / FIREWALL                             │
│     ┌──────────────────────────────────────────────────────┐      │
│     │  Reverse Proxy (Nginx)                               │      │
│     │  - TLS Termination                                   │      │
│     │  - WAF Rules                                         │      │
│     │  - Rate Limiting                                     │      │
│     │  - Request Logging                                   │      │
│     └──────────────────────────────────────────────────────┘      │
└───────────────────────┬────────────────────────────────────────────┘
                        │
                        │ Internal Network
                        │
┌───────────────────────┴────────────────────────────────────────────┐
│                     ON-PREMISES NETWORK                             │
│                     (Internal/Trusted Zone)                        │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │              ORCHESTRATOR & DASHBOARD                         │ │
│  │                                                               │ │
│  │  ┌─────────────────────────────────────────────────────┐    │ │
│  │  │  CyberSwarm Orchestrator                            │    │ │
│  │  │  - Coordinates Blue/Red Teams                       │    │ │
│  │  │  - Monitors All Activities                          │    │ │
│  │  │  - Scenario Management                              │    │ │
│  │  │  - Scoring Engine                                   │    │ │
│  │  └─────────────────────────────────────────────────────┘    │ │
│  │                                                               │ │
│  │  ┌─────────────────────────────────────────────────────┐    │ │
│  │  │  Next.js Dashboard                                  │    │ │
│  │  │  - Real-time Monitoring                            │    │ │
│  │  │  - Live Attack/Defense Visualization               │    │ │
│  │  │  - Event Timeline                                  │    │ │
│  │  │  - Team Performance Metrics                        │    │ │
│  │  └─────────────────────────────────────────────────────┘    │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                   BLUE TEAM DEPLOYMENT                        │ │
│  │                  (Defensive Operations)                       │ │
│  │                                                               │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │ │
│  │  │  Network    │  │   Patch     │  │    IDS      │         │ │
│  │  │  Monitor    │  │ Management  │  │   Agent     │         │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │ │
│  │                                                               │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │ │
│  │  │   SIEM      │  │  Incident   │  │   Defense   │         │ │
│  │  │Integration  │  │  Response   │  │  Strategy   │         │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │ │
│  │                                                               │ │
│  │  ┌───────────────────────────────────────────────┐          │ │
│  │  │     Protected Target Infrastructure            │          │ │
│  │  │  - Web Servers                                 │          │ │
│  │  │  - Database Servers                            │          │ │
│  │  │  - Application Services                        │          │ │
│  │  │  - User Endpoints                              │          │ │
│  │  └───────────────────────────────────────────────┘          │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │              SHARED INFRASTRUCTURE                            │ │
│  │                                                               │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │ │
│  │  │ PostgreSQL  │  │    Redis    │  │   Message   │         │ │
│  │  │  Database   │  │    Cache    │  │    Queue    │         │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │ │
│  └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Red Team (External - Offensive)

**Location**: Cloud VPS (AWS, DigitalOcean, Linode, etc.)

**Purpose**: Simulate external attackers attempting to compromise the infrastructure

**Agents**:
- **Discovery Agent**: Reconnaissance, OSINT, subdomain enumeration
- **Vulnerability Scanner**: Port scanning, service fingerprinting, CVE detection
- **Exploit Agent**: Attempts exploitation of discovered vulnerabilities
- **Social Engineering Agent**: Phishing campaigns, credential harvesting
- **Network Recon**: Network topology mapping, service enumeration

**Capabilities**:
- External scanning and reconnaissance
- Exploitation attempts
- C2 communication simulation
- Attack chain execution
- Evasion techniques

**Communication**:
- Outbound HTTPS/WSS to orchestrator (Port 443)
- Encrypted command and control channel
- Event reporting to orchestrator
- No direct access to internal network

**Security Considerations**:
- Isolated environment (cannot access internal network directly)
- All actions logged and monitored
- Rate-limited to prevent DOS
- Kill switches for emergency stop

### 2. Blue Team (On-Premises - Defensive)

**Location**: Internal network, same datacenter as orchestrator

**Purpose**: Defend infrastructure and detect/respond to Red Team attacks

**Agents**:
- **Network Monitor**: Traffic analysis, anomaly detection
- **Patch Management**: Vulnerability remediation, system hardening
- **IDS Agent**: Intrusion detection, alert generation
- **SIEM Integration**: Log aggregation, correlation, threat intelligence
- **Incident Response**: Automated response actions, containment
- **Defense Strategy**: Adaptive defense tactics based on observed attacks

**Capabilities**:
- Real-time network monitoring
- Threat detection and alerting
- Automated defensive actions
- Patch deployment
- Log analysis and correlation
- Incident documentation

**Communication**:
- Internal network only
- Direct communication with orchestrator
- No exposure to external network
- Secure internal APIs

**Protected Assets**:
- Web applications
- Databases
- File servers
- User workstations
- Network infrastructure

### 3. Orchestrator (On-Premises - Coordination)

**Location**: Internal network, secure zone

**Purpose**: Coordinate both teams, monitor activities, score engagement

**Responsibilities**:
- **Scenario Management**: Load and execute attack/defense scenarios
- **Agent Coordination**: Task distribution to Red and Blue teams
- **Event Aggregation**: Collect events from all agents
- **Scoring Engine**: Track successful attacks and defenses
- **Real-time Monitoring**: Live status of all agents and activities
- **Communication Hub**: Secure channel management
- **Safety Controls**: Emergency stop, agent control, rule enforcement

**Components**:
- Logic Pipe Engine (automated decision-making)
- Agent Manager (lifecycle management)
- Event Stream Processor
- Scoring Engine
- API Gateway
- WebSocket Server

**Database Schema**:
```sql
-- Agents
CREATE TABLE agents (
    id UUID PRIMARY KEY,
    agent_name VARCHAR(255),
    team ENUM('red', 'blue'),
    agent_type VARCHAR(100),
    status ENUM('idle', 'busy', 'error', 'offline'),
    location ENUM('external', 'internal'),
    last_seen TIMESTAMP,
    capabilities JSONB
);

-- Events
CREATE TABLE events (
    id UUID PRIMARY KEY,
    event_type VARCHAR(100),
    agent_id UUID REFERENCES agents(id),
    timestamp TIMESTAMP,
    severity ENUM('info', 'low', 'medium', 'high', 'critical'),
    team ENUM('red', 'blue', 'system'),
    data JSONB,
    scored BOOLEAN DEFAULT false,
    points INTEGER DEFAULT 0
);

-- Attacks
CREATE TABLE attacks (
    id UUID PRIMARY KEY,
    attack_type VARCHAR(100),
    red_agent_id UUID REFERENCES agents(id),
    target_system VARCHAR(255),
    status ENUM('initiated', 'in_progress', 'successful', 'blocked', 'failed'),
    timestamp TIMESTAMP,
    detection_time TIMESTAMP NULL,
    blue_agent_id UUID NULL REFERENCES agents(id),
    ttd_seconds INTEGER,  -- Time to detect
    data JSONB
);

-- Defenses
CREATE TABLE defenses (
    id UUID PRIMARY KEY,
    defense_type VARCHAR(100),
    blue_agent_id UUID REFERENCES agents(id),
    attack_id UUID NULL REFERENCES attacks(id),
    action_taken VARCHAR(255),
    effectiveness INTEGER,  -- 0-100
    timestamp TIMESTAMP,
    data JSONB
);

-- Scoring
CREATE TABLE scoring_events (
    id UUID PRIMARY KEY,
    team ENUM('red', 'blue'),
    event_id UUID REFERENCES events(id),
    points INTEGER,
    reason VARCHAR(255),
    timestamp TIMESTAMP
);
```

### 4. Dashboard (On-Premises - Visualization)

**Purpose**: Real-time visualization of the cyber engagement

**Features**:
- **Live Attack Map**: Visual representation of attacks in progress
- **Team Dashboards**: Separate views for Red and Blue teams
- **Event Timeline**: Chronological view of all activities
- **Performance Metrics**: KPIs, response times, success rates
- **Chain of Thought**: Agent decision visualization
- **Scoring Leaderboard**: Real-time scoring updates

**Technology**: Next.js 14 with SSE for real-time updates

## Network Segmentation

### External Network (Red Team Zone)

```
Internet ──> Cloud Provider ──> Red Team Agents
                                      │
                                      │ HTTPS:443 Only
                                      │ (Outbound Only)
                                      ▼
                                  Firewall/DMZ
```

**Firewall Rules**:
```bash
# Allow ONLY outbound HTTPS from Red Team to Orchestrator
iptables -A INPUT -p tcp --dport 443 -s <RED_TEAM_IP> -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j DROP  # Block all other 443

# Block all other inbound from external
iptables -A INPUT -i eth0 -j DROP
iptables -A FORWARD -i eth0 -j DROP
```

### Internal Network (Blue Team + Orchestrator)

```
Internal Network:
  ├─ Orchestrator: 10.0.1.10
  ├─ Dashboard: 10.0.1.11
  ├─ Blue Team Network: 10.0.2.0/24
  │   ├─ Network Monitor: 10.0.2.10
  │   ├─ Patch Management: 10.0.2.11
  │   ├─ IDS Agent: 10.0.2.12
  │   ├─ SIEM Integration: 10.0.2.13
  │   └─ Incident Response: 10.0.2.14
  └─ Protected Assets: 10.0.3.0/24
```

**Internal Firewall Rules**:
```bash
# Blue Team can communicate with Orchestrator
iptables -A FORWARD -s 10.0.2.0/24 -d 10.0.1.10 -j ACCEPT

# Blue Team can monitor Protected Assets
iptables -A FORWARD -s 10.0.2.0/24 -d 10.0.3.0/24 -j ACCEPT

# Blue Team cannot access external network directly
iptables -A FORWARD -s 10.0.2.0/24 -o eth0 -j DROP
```

## Communication Protocols

### Red Team ↔ Orchestrator

**Protocol**: HTTPS/WebSocket over TLS 1.3

```typescript
// Red Team Agent Connection
interface RedTeamMessage {
  type: 'auth' | 'event' | 'heartbeat' | 'task_result';
  agent_id: string;
  team: 'red';
  timestamp: string;
  payload: any;
  signature: string;  // HMAC signature for authenticity
}

// Red Team connects via WebSocket
const ws = new WebSocket('wss://orchestrator.internal:443/red-team');
ws.on('open', () => {
  ws.send(JSON.stringify({
    type: 'auth',
    agent_id: process.env.AGENT_ID,
    team: 'red',
    token: process.env.AGENT_TOKEN
  }));
});
```

### Blue Team ↔ Orchestrator

**Protocol**: Internal HTTP/WebSocket (can use unencrypted on trusted network)

```typescript
// Blue Team Agent Connection
interface BlueTeamMessage {
  type: 'event' | 'alert' | 'defense_action' | 'status';
  agent_id: string;
  team: 'blue';
  timestamp: string;
  payload: any;
}

// Blue Team connects via internal WebSocket
const ws = new WebSocket('ws://orchestrator.internal:8080/blue-team');
```

### Event Types

```typescript
// Red Team Events
type RedTeamEventType =
  | 'scan_initiated'
  | 'vulnerability_found'
  | 'exploit_attempted'
  | 'exploit_successful'
  | 'access_gained'
  | 'privilege_escalated'
  | 'data_exfiltrated'
  | 'persistence_established';

// Blue Team Events
type BlueTeamEventType =
  | 'scan_detected'
  | 'attack_detected'
  | 'attack_blocked'
  | 'vulnerability_patched'
  | 'alert_generated'
  | 'incident_created'
  | 'containment_action'
  | 'recovery_completed';
```

## Deployment Configuration

### Red Team Deployment (External VPS)

**Docker Compose** (`red-team-docker-compose.yml`):

```yaml
version: '3.8'

services:
  discovery-agent:
    build:
      context: .
      dockerfile: Dockerfile.red-agent
    environment:
      - AGENT_TYPE=discovery
      - AGENT_TEAM=red
      - ORCHESTRATOR_URL=https://orchestrator.yourdomain.com
      - AGENT_TOKEN=${RED_AGENT_TOKEN}
      - TARGET_DOMAIN=${TARGET_DOMAIN}
    restart: unless-stopped
    networks:
      - red-team-net

  vuln-scanner:
    build:
      context: .
      dockerfile: Dockerfile.red-agent
    environment:
      - AGENT_TYPE=vulnerability_scanner
      - AGENT_TEAM=red
      - ORCHESTRATOR_URL=https://orchestrator.yourdomain.com
      - AGENT_TOKEN=${RED_AGENT_TOKEN}
    restart: unless-stopped
    networks:
      - red-team-net

  exploit-agent:
    build:
      context: .
      dockerfile: Dockerfile.red-agent
    environment:
      - AGENT_TYPE=exploit
      - AGENT_TEAM=red
      - ORCHESTRATOR_URL=https://orchestrator.yourdomain.com
      - AGENT_TOKEN=${RED_AGENT_TOKEN}
    restart: unless-stopped
    networks:
      - red-team-net

networks:
  red-team-net:
    driver: bridge
```

**Red Agent Environment** (`.env.red`):
```bash
# Red Team Configuration
AGENT_TEAM=red
ORCHESTRATOR_URL=https://orchestrator.yourdomain.com
AGENT_TOKEN=<secure-red-team-token>
TARGET_DOMAIN=target.internal.com

# Attack Configuration
MAX_ATTACK_RATE=10  # Attacks per minute
STEALTH_MODE=true
EVASION_TECHNIQUES=true

# Logging
LOG_LEVEL=info
LOG_TO_FILE=true
```

### Blue Team Deployment (On-Premises)

**Docker Compose** (`blue-team-docker-compose.yml`):

```yaml
version: '3.8'

services:
  network-monitor:
    build:
      context: .
      dockerfile: Dockerfile.blue-agent
    environment:
      - AGENT_TYPE=network_monitor
      - AGENT_TEAM=blue
      - ORCHESTRATOR_URL=http://orchestrator.internal:8080
      - AGENT_TOKEN=${BLUE_AGENT_TOKEN}
    network_mode: host  # Needs access to network interfaces
    cap_add:
      - NET_ADMIN
      - NET_RAW
    restart: unless-stopped

  patch-management:
    build:
      context: .
      dockerfile: Dockerfile.blue-agent
    environment:
      - AGENT_TYPE=patch_management
      - AGENT_TEAM=blue
      - ORCHESTRATOR_URL=http://orchestrator.internal:8080
      - AGENT_TOKEN=${BLUE_AGENT_TOKEN}
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock  # For container patching
    restart: unless-stopped

  ids-agent:
    build:
      context: .
      dockerfile: Dockerfile.blue-agent
    environment:
      - AGENT_TYPE=ids
      - AGENT_TEAM=blue
      - ORCHESTRATOR_URL=http://orchestrator.internal:8080
      - AGENT_TOKEN=${BLUE_AGENT_TOKEN}
    network_mode: host
    restart: unless-stopped

  incident-response:
    build:
      context: .
      dockerfile: Dockerfile.blue-agent
    environment:
      - AGENT_TYPE=incident_response
      - AGENT_TEAM=blue
      - ORCHESTRATOR_URL=http://orchestrator.internal:8080
      - AGENT_TOKEN=${BLUE_AGENT_TOKEN}
    restart: unless-stopped
```

### Orchestrator Deployment (On-Premises)

**Docker Compose** (`orchestrator-docker-compose.yml`):

```yaml
version: '3.8'

services:
  orchestrator:
    build:
      context: ./orchestrator
      dockerfile: Dockerfile
    ports:
      - "8080:8080"  # Internal API (Blue Team)
      - "443:443"    # External API (Red Team)
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@postgres:5432/cyberswarm
      - REDIS_URL=redis://redis:6379
      - RED_TEAM_TOKEN=${RED_TEAM_TOKEN}
      - BLUE_TEAM_TOKEN=${BLUE_TEAM_TOKEN}
    volumes:
      - ./config:/app/config
      - ./logs:/app/logs
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - internal-net

  dashboard:
    build:
      context: ./app
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://orchestrator:8080
      - NEXT_PUBLIC_WS_URL=ws://orchestrator:8080
    depends_on:
      - orchestrator
    restart: unless-stopped
    networks:
      - internal-net

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=cyberswarm
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=cyberswarm
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped
    networks:
      - internal-net

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - internal-net

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - dashboard
      - orchestrator
    restart: unless-stopped
    networks:
      - internal-net

volumes:
  postgres_data:
  redis_data:

networks:
  internal-net:
    driver: bridge
```

## Scoring System

### Point Values

**Red Team Points** (Offensive):
- Successful reconnaissance: +5 points
- Vulnerability discovered: +10 points
- Exploit successful: +50 points
- Privilege escalation: +75 points
- Data exfiltration: +100 points
- Persistence established: +150 points
- Full compromise: +200 points

**Blue Team Points** (Defensive):
- Attack detected: +10 points
- Attack blocked: +25 points
- Quick response (< 5 min): +20 bonus
- Vulnerability patched before exploit: +50 points
- Incident contained: +40 points
- Recovery completed: +30 points
- Zero-day discovered: +100 points

### Penalty System

**Red Team Penalties**:
- Detection within 1 minute: -10 points
- Failed exploit (detected): -5 points
- Agent crashed/blocked: -20 points

**Blue Team Penalties**:
- Successful attack: -50 points
- Slow detection (> 10 min): -15 points
- False positive alert: -5 points
- Failed patch: -10 points

## Safety and Control

### Kill Switches

```typescript
// Emergency stop all Red Team activities
async function emergencyStopRedTeam() {
  // Broadcast stop command to all Red agents
  await broadcastMessage('red', {
    type: 'command',
    action: 'emergency_stop',
    timestamp: new Date().toISOString()
  });
  
  // Close all Red Team connections
  redTeamConnections.forEach(conn => conn.close());
  
  // Log the event
  await logEvent({
    type: 'emergency_stop',
    team: 'red',
    reason: 'Manual trigger',
    timestamp: new Date()
  });
}

// Pause specific agent
async function pauseAgent(agentId: string) {
  await sendMessage(agentId, {
    type: 'command',
    action: 'pause',
    timestamp: new Date().toISOString()
  });
}
```

### Rate Limiting

```typescript
// Rate limiter for Red Team attacks
class AttackRateLimiter {
  private attackCounts: Map<string, number[]> = new Map();
  private maxAttacksPerMinute = 10;
  
  canAttack(agentId: string): boolean {
    const now = Date.now();
    const attacks = this.attackCounts.get(agentId) || [];
    
    // Remove attacks older than 1 minute
    const recentAttacks = attacks.filter(t => now - t < 60000);
    
    if (recentAttacks.length >= this.maxAttacksPerMinute) {
      return false;
    }
    
    recentAttacks.push(now);
    this.attackCounts.set(agentId, recentAttacks);
    return true;
  }
}
```

### Monitoring and Alerts

```typescript
// Real-time monitoring
class SecurityMonitor {
  async monitorActivity() {
    // Check for suspicious patterns
    const suspiciousPatterns = [
      { type: 'high_attack_rate', threshold: 50, window: 60 },
      { type: 'multiple_failed_exploits', threshold: 10, window: 300 },
      { type: 'data_exfiltration_spike', threshold: 100, window: 60 }
    ];
    
    for (const pattern of suspiciousPatterns) {
      const count = await this.checkPattern(pattern);
      if (count > pattern.threshold) {
        await this.sendAlert({
          severity: 'high',
          type: pattern.type,
          count,
          action: 'Review activity and consider rate limiting'
        });
      }
    }
  }
}
```

## Scenario Examples

### Scenario 1: Web Application Penetration Test

**Red Team Tasks**:
1. Reconnaissance (subdomain enumeration, tech stack identification)
2. Vulnerability scanning (SQL injection, XSS, SSRF)
3. Exploitation attempts
4. Privilege escalation
5. Data extraction

**Blue Team Tasks**:
1. Monitor web application logs
2. Detect scanning activity
3. Block malicious requests
4. Patch vulnerabilities
5. Implement WAF rules

### Scenario 2: Internal Network Compromise

**Red Team Tasks**:
1. Initial access (phishing, exploit public service)
2. Lateral movement
3. Credential harvesting
4. Privilege escalation
5. Establish persistence

**Blue Team Tasks**:
1. Monitor network traffic
2. Detect anomalous behavior
3. Isolate compromised systems
4. Hunt for IOCs
5. Eradicate threats

## Deployment Steps

### Step 1: Prepare Infrastructure

```bash
# On-premises server setup
sudo apt update && sudo apt upgrade -y
sudo apt install docker.io docker-compose nginx postgresql-client redis-tools

# Clone repository
git clone https://github.com/yourusername/cyberswarm.git
cd cyberswarm
```

### Step 2: Configure Orchestrator

```bash
# Create environment files
cp .env.example .env.orchestrator

# Edit configuration
nano .env.orchestrator

# Generate tokens
openssl rand -hex 32  # For RED_TEAM_TOKEN
openssl rand -hex 32  # For BLUE_TEAM_TOKEN

# Start orchestrator
cd orchestrator
docker-compose -f orchestrator-docker-compose.yml up -d
```

### Step 3: Deploy Blue Team (On-Premises)

```bash
# Configure Blue Team
cp .env.example .env.blue
nano .env.blue

# Start Blue Team agents
cd blue-team
docker-compose -f blue-team-docker-compose.yml up -d
```

### Step 4: Deploy Red Team (External VPS)

```bash
# SSH to external VPS
ssh user@red-team-vps.com

# Clone and configure
git clone https://github.com/yourusername/cyberswarm.git
cd cyberswarm/red-team
cp .env.example .env.red
nano .env.red

# Start Red Team agents
docker-compose -f red-team-docker-compose.yml up -d
```

### Step 5: Start Dashboard

```bash
# Start dashboard
cd app
docker-compose up -d

# Access dashboard
open http://localhost:3000
```

## Monitoring and Observability

### Metrics to Track

**Red Team Metrics**:
- Active agents
- Attacks per minute
- Success rate
- Average time to compromise
- Stealth score (detection avoidance)

**Blue Team Metrics**:
- Average detection time
- Block rate
- False positive rate
- Mean time to respond (MTTR)
- Mean time to contain (MTTC)

**System Metrics**:
- Agent health
- Network latency
- Database performance
- Event processing rate

### Logging

```typescript
// Structured logging
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'cyberswarm' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

// Log attack event
logger.info('Attack initiated', {
  team: 'red',
  agent_id: 'red-001',
  attack_type: 'sql_injection',
  target: 'https://target.com/login',
  timestamp: new Date().toISOString()
});
```

## Security Considerations

### Authentication

```typescript
// JWT-based agent authentication
import jwt from 'jsonwebtoken';

function generateAgentToken(agentId: string, team: 'red' | 'blue'): string {
  return jwt.sign(
    { agent_id: agentId, team, role: 'agent' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyAgentToken(token: string): any {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}
```

### Network Isolation

- Red Team has NO direct access to internal network
- All Red Team communication goes through DMZ
- Blue Team cannot initiate connections to external network
- Orchestrator acts as security boundary

### Audit Trail

Every action is logged with:
- Timestamp
- Agent ID
- Team
- Action type
- Result
- Associated data

---

## Next Steps

1. **Review and approve architecture**
2. **Set up infrastructure (servers, networking)**
3. **Implement agent code modifications**
4. **Configure security controls**
5. **Deploy and test components**
6. **Run pilot scenarios**
7. **Production deployment**

Would you like me to dive deeper into any specific component?
