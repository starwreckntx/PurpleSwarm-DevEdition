# 🟣 PurpleSwarm-DevEdition

**A Production-Ready Multi-Agent Cybersecurity Training Platform**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-blue.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)

---

## 🎯 What is PurpleSwarm?

PurpleSwarm-DevEdition is a sophisticated **red team vs blue team** adversarial cybersecurity simulation platform that combines offensive and defensive security operations in a realistic, network-segregated environment. The name "Purple" represents the combination of Red Team (attackers) and Blue Team (defenders) working together to improve security posture.

### Key Capabilities

- **🔴 Red Team Operations**: External attack simulations from cloud VPS
- **🔵 Blue Team Defense**: Internal defensive operations and monitoring
- **🎮 Autonomous Orchestration**: AI-driven agent coordination and scoring
- **📊 Real-Time Analytics**: Live dashboard with scoring and event visualization
- **🛡️ Production-Grade Security**: Network segregation, DMZ, safety controls
- **🐳 Docker Deployment**: One-command setup with complete isolation

---

## 📁 Repository Structure

```
PurpleSwarm-DevEdition/
├── AI_PROTOCOL_SYNTHESIS_LOG.md          # Comprehensive system analysis
├── MANIFEST.md                            # Archive metadata and validation
│
├── CyberSwarm_RedBlue_Complete/          # Production deployment files
│   ├── README.md                         # Quick start guide
│   ├── PROJECT_SUMMARY.md                # Feature overview
│   ├── BLUE_RED_TEAM_ARCHITECTURE.md    # System architecture (31KB)
│   ├── DEPLOYMENT_GUIDE.md              # Step-by-step deployment
│   └── cyberswarm_analysis.md           # Original system analysis
│
└── CyberSwarm_Thread_Archive/           # Development thread archive
    └── cyberswarm-thread-archive/
        ├── START_HERE.md                # Navigation guide
        ├── docs/                        # Complete documentation
        │   ├── README.md
        │   ├── PROJECT_SUMMARY.md
        │   ├── BLUE_RED_TEAM_ARCHITECTURE.md
        │   └── DEPLOYMENT_GUIDE.md
        └── context/                     # Thread metadata
            ├── FORWARD_CONTEXT_PACKET.md
            └── THREAD_HASH.txt
```

---

## 🚀 Quick Start

### Prerequisites

- **On-Premises Server**: Ubuntu 22.04, 8GB RAM, 4 CPU cores
- **External VPS** (for Red Team): Any Linux, 2GB RAM, 2 CPU cores
- **Docker & Docker Compose** installed on both servers

### 1. Clone Repository

```bash
git clone https://github.com/starwreckntx/PurpleSwarm-DevEdition.git
cd PurpleSwarm-DevEdition
```

### 2. Read Documentation

```bash
# Quick navigation
cat CyberSwarm_Thread_Archive/cyberswarm-thread-archive/START_HERE.md

# Understand architecture
cat CyberSwarm_RedBlue_Complete/BLUE_RED_TEAM_ARCHITECTURE.md

# Follow deployment steps
cat CyberSwarm_RedBlue_Complete/DEPLOYMENT_GUIDE.md
```

### 3. Deploy System

See [DEPLOYMENT_GUIDE.md](CyberSwarm_RedBlue_Complete/DEPLOYMENT_GUIDE.md) for complete instructions.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────┐
│   EXTERNAL NETWORK      │
│   (Red Team - VPS)      │
│   - Discovery Agent     │
│   - Vuln Scanner        │
│   - Exploit Agent       │
│   - Social Engineering  │
└───────────┬─────────────┘
            │ HTTPS:443
            │
┌───────────▼─────────────┐
│   DMZ / FIREWALL        │
│   - Nginx Reverse Proxy │
│   - WAF Rules           │
│   - TLS Termination     │
│   - Rate Limiting       │
└───────────┬─────────────┘
            │
┌───────────▼─────────────────────────┐
│   INTERNAL NETWORK                  │
│   (On-Premises)                     │
│                                     │
│   ┌─────────────────────┐          │
│   │  Orchestrator       │          │
│   │  - Coordination     │          │
│   │  - Scoring Engine   │          │
│   │  - Dashboard        │          │
│   └─────────────────────┘          │
│                                     │
│   ┌─────────────────────┐          │
│   │  Blue Team          │          │
│   │  - Network Monitor  │          │
│   │  - IDS/IPS          │          │
│   │  - Patch Mgmt       │          │
│   │  - SIEM Integration │          │
│   │  - Incident Response│          │
│   └─────────────────────┘          │
│                                     │
│   ┌─────────────────────┐          │
│   │  Protected Systems  │          │
│   │  - Web Servers      │          │
│   │  - Databases        │          │
│   │  - Applications     │          │
│   └─────────────────────┘          │
└─────────────────────────────────────┘
```

---

## ✨ Key Features

### Network Segregation
- ✅ **External Red Team**: Simulates real-world attackers from outside network
- ✅ **Internal Blue Team**: Defends infrastructure from within
- ✅ **DMZ Security Boundary**: Nginx-based filtering and inspection
- ✅ **Realistic Topology**: Mirrors production security architectures

### Autonomous Agent System
- ✅ **11 Specialized Agents**: 5 red team + 6 blue team types
- ✅ **Event-Driven Coordination**: Logic Pipe Engine for reactive behaviors
- ✅ **Chain of Thought**: Transparent agent reasoning and decisions
- ✅ **Heartbeat Monitoring**: Automatic reconnection and health checks

### Real-Time Scoring
- ✅ **Red Team Points**: +5 (recon) to +200 (full compromise)
- ✅ **Blue Team Points**: +10 (detection) to +100 (zero-day discovery)
- ✅ **Time-Based Bonuses**: Fast response rewards, slow detection penalties
- ✅ **Live Leaderboard**: Real-time competition visualization

### Safety Controls
- ✅ **Rate Limiting**: Prevents DOS (10 attacks/minute default)
- ✅ **Emergency Stop**: Immediate halt of all red team operations
- ✅ **Complete Audit Trail**: Every action logged to PostgreSQL
- ✅ **Pause/Resume**: Granular control over agent operations

### Operational Modes
- ✅ **Simulation Mode**: Safe training with simulated attacks/defenses
- ✅ **Real Tools Mode**: Integration with Nmap, Metasploit, Suricata, Wazuh
- ✅ **Graduated Realism**: Progress from safe to advanced testing

---

## 🎮 Agent Types

### 🔴 Red Team (Offensive)
1. **Discovery Agent** - Reconnaissance, OSINT, subdomain enumeration
2. **Vulnerability Scanner** - Port scanning, CVE identification
3. **Exploit Agent** - Exploitation attempts, attack chain execution
4. **Social Engineering Agent** - Phishing, credential harvesting
5. **Network Recon Agent** - Topology mapping, service enumeration

### 🔵 Blue Team (Defensive)
1. **Network Monitor Agent** - Traffic analysis, anomaly detection
2. **Patch Management Agent** - Vulnerability remediation, hardening
3. **IDS Agent** - Intrusion detection, alert generation
4. **SIEM Integration Agent** - Log correlation, threat intelligence
5. **Incident Response Agent** - Containment, recovery, forensics
6. **Defense Strategy Agent** - Adaptive tactics, strategic defense

---

## 📊 Technology Stack

| Component | Technology |
|-----------|------------|
| **Runtime** | Node.js 18+ with TypeScript 5.2+ |
| **Communication** | WebSocket (ws library) |
| **Database** | PostgreSQL 15 |
| **Cache** | Redis 7 |
| **Dashboard** | Next.js 14 with React 18 |
| **Containers** | Docker + Docker Compose |
| **Reverse Proxy** | Nginx with TLS 1.3 |
| **UI Components** | Radix UI + Tailwind CSS |

---

## 📖 Documentation

| Document | Description | Size |
|----------|-------------|------|
| [AI_PROTOCOL_SYNTHESIS_LOG.md](AI_PROTOCOL_SYNTHESIS_LOG.md) | Comprehensive system analysis with 93 concepts | 110KB |
| [BLUE_RED_TEAM_ARCHITECTURE.md](CyberSwarm_RedBlue_Complete/BLUE_RED_TEAM_ARCHITECTURE.md) | Complete system design and components | 31KB |
| [DEPLOYMENT_GUIDE.md](CyberSwarm_RedBlue_Complete/DEPLOYMENT_GUIDE.md) | Step-by-step deployment instructions | 20KB |
| [PROJECT_SUMMARY.md](CyberSwarm_RedBlue_Complete/PROJECT_SUMMARY.md) | Features, use cases, next steps | 9.5KB |

---

## 🎯 Use Cases

- **Security Team Training**: Hands-on red/blue team exercises
- **Capture the Flag (CTF)**: Competitive security challenges
- **Certification Prep**: OSCP, CEH, CISSP practical experience
- **Research & Development**: Security tool testing and validation
- **Product Security Testing**: Pre-production vulnerability assessment
- **Incident Response Training**: Realistic attack/defense scenarios

---

## 🔐 Security Considerations

### Network Isolation
- Red Team has **NO** direct access to internal network
- All communication flows through DMZ security boundary
- Blue Team cannot initiate external connections
- Orchestrator acts as trust boundary

### Authentication
- **Bearer Tokens**: Team-level authorization (RED_TEAM_TOKEN, BLUE_TEAM_TOKEN)
- **JWT Tokens**: Agent-level session management (7-day expiration)
- **HMAC Signatures**: Message integrity verification

### Audit & Compliance
- Complete event logging to PostgreSQL
- Immutable audit trail with timestamps
- Agent attribution for all actions
- Severity classification and correlation

---

## 📈 Performance Metrics

### Red Team Metrics
- Active agents count
- Attacks per minute
- Success rate
- Average time to compromise
- Stealth score (detection avoidance)

### Blue Team Metrics
- Mean Time To Detect (MTTD)
- Mean Time To Respond (MTTR)
- Mean Time To Contain (MTTC)
- Block rate
- False positive rate

### System Metrics
- Agent health status
- Network latency
- Database performance
- Event processing rate

---

## 🛠️ Development

### System Evolution

1. **Original CyberSwarm**: Web dashboard, single-location deployment, 5 agents
2. **Red vs Blue Transform**: Network segregation, dual WebSocket servers, 11 agents
3. **Production Hardening**: Docker deployment, DMZ layer, safety controls
4. **Current State**: Production-ready with comprehensive documentation

### Thread Archive

This repository includes complete development context via the **Thread Archive System**:
- **Forward Context Packet**: Full thread history for AI resumption
- **Semantic Hash**: Version identification (red-blue-network-separation-orchestrated-scoring-v1.0)
- **Resumption Token**: Template for continuing work in new sessions

---

## 🤝 Contributing

This is a production implementation of CyberSwarm. For contributions:

1. Review [BLUE_RED_TEAM_ARCHITECTURE.md](CyberSwarm_RedBlue_Complete/BLUE_RED_TEAM_ARCHITECTURE.md)
2. Understand the agent system and orchestration
3. Test changes in isolated environment
4. Ensure safety controls remain functional
5. Update documentation accordingly

---

## ⚠️ Legal Notice

This platform is designed for:
- ✅ **Authorized security testing** with written permission
- ✅ **Training and education** in controlled environments
- ✅ **Research purposes** with proper oversight

**DO NOT use for**:
- ❌ Unauthorized penetration testing
- ❌ Attacking systems without explicit permission
- ❌ Any illegal activities

Always ensure you have:
- Written authorization from system owners
- Proper scope definition and boundaries
- Legal review and approval
- Appropriate insurance coverage
- Ethical guidelines in place

---

## 📞 Support

### Troubleshooting
- Check [DEPLOYMENT_GUIDE.md](CyberSwarm_RedBlue_Complete/DEPLOYMENT_GUIDE.md) troubleshooting section
- Review orchestrator logs: `docker-compose logs -f orchestrator`
- Verify network connectivity and firewall rules
- Check agent status on dashboard

### Resources
- **Architecture Questions**: See BLUE_RED_TEAM_ARCHITECTURE.md
- **Deployment Help**: See DEPLOYMENT_GUIDE.md
- **Feature Overview**: See PROJECT_SUMMARY.md
- **System Analysis**: See AI_PROTOCOL_SYNTHESIS_LOG.md

---

## 📜 License

This is a custom implementation for CyberSwarm. Refer to the original project license for base components.

---

## 🙏 Acknowledgments

- **Original CyberSwarm**: Multi-agent cybersecurity simulation framework
- **Red vs Blue Transformation**: Network-segregated adversarial platform
- **Thread Archive**: AI-assisted development context preservation

---

## 🚀 Getting Started

1. **Read**: Start with [START_HERE.md](CyberSwarm_Thread_Archive/cyberswarm-thread-archive/START_HERE.md)
2. **Understand**: Review [BLUE_RED_TEAM_ARCHITECTURE.md](CyberSwarm_RedBlue_Complete/BLUE_RED_TEAM_ARCHITECTURE.md)
3. **Deploy**: Follow [DEPLOYMENT_GUIDE.md](CyberSwarm_RedBlue_Complete/DEPLOYMENT_GUIDE.md)
4. **Train**: Run scenarios and analyze results
5. **Customize**: Adapt for your specific needs
6. **Scale**: Add more agents and scenarios

---

**Ready to build your cyber training platform? 🎯**

```bash
git clone https://github.com/starwreckntx/PurpleSwarm-DevEdition.git
cd PurpleSwarm-DevEdition
cat CyberSwarm_Thread_Archive/cyberswarm-thread-archive/START_HERE.md
```

---

*PurpleSwarm-DevEdition: Where Red meets Blue for better security* 🟣
