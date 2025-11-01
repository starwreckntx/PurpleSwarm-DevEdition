# 🔴🔵 CyberSwarm: Blue Team vs Red Team Platform

A production-ready cybersecurity exercise platform with **external red team attackers** and **on-premises blue team defenders**, coordinated by a centralized orchestrator.

## 🎯 What Is This?

This is a complete transformation of CyberSwarm into a realistic cyber engagement platform where:

- **🔴 Red Team** (External/Untrusted): Simulates attackers from outside your network
- **🔵 Blue Team** (Internal/Trusted): Defends your infrastructure from within
- **🎮 Orchestrator** (On-Premises): Coordinates everything and keeps score

## 📁 Files in This Package

| File | Description |
|------|-------------|
| **BLUE_RED_TEAM_ARCHITECTURE.md** | Complete system architecture, network design, components |
| **orchestrator-redblue.ts** | Main orchestrator code - coordinates both teams |
| **red-team-agent.ts** | External attack agent implementation |
| **blue-team-agent.ts** | Internal defense agent implementation |
| **DEPLOYMENT_GUIDE.md** | Step-by-step deployment instructions |
| **PROJECT_SUMMARY.md** | Overview, features, and next steps |
| **README.md** | This file - quick navigation |

## 🚀 Quick Start (3 Steps)

### 1. Read the Architecture
```bash
# Understand how everything fits together
cat BLUE_RED_TEAM_ARCHITECTURE.md
```

### 2. Follow Deployment Guide
```bash
# Deploy the complete system
cat DEPLOYMENT_GUIDE.md
```

### 3. Run It!
```bash
# On-premises server
cd orchestrator && docker-compose up -d
cd ../blue-team && docker-compose up -d

# External VPS (red team)
cd cyberswarm-redteam && docker-compose up -d

# Access dashboard
open http://your-server:3000
```

## 🏗️ Architecture Overview

```
┌─────────────────────┐
│   EXTERNAL VPS      │
│   (Red Team)        │
│   - Discovery       │
│   - Vuln Scanner    │
│   - Exploit Agent   │
└──────────┬──────────┘
           │ HTTPS:443
           │ (Encrypted)
           │
┌──────────▼──────────────────────────┐
│   DMZ / FIREWALL                    │
└──────────┬──────────────────────────┘
           │
┌──────────▼──────────────────────────┐
│   ON-PREMISES                        │
│                                      │
│   ┌─────────────────────────┐       │
│   │  Orchestrator           │       │
│   │  - Coordinator          │       │
│   │  - Scoring Engine       │       │
│   │  - Dashboard            │       │
│   └─────────────────────────┘       │
│                                      │
│   ┌─────────────────────────┐       │
│   │  Blue Team              │       │
│   │  - Network Monitor      │       │
│   │  - IDS                  │       │
│   │  - Patch Management     │       │
│   │  - Incident Response    │       │
│   └─────────────────────────┘       │
│                                      │
│   ┌─────────────────────────┐       │
│   │  Protected Systems      │       │
│   │  - Web Servers          │       │
│   │  - Databases            │       │
│   │  - Applications         │       │
│   └─────────────────────────┘       │
└──────────────────────────────────────┘
```

## ✨ Key Features

- ✅ **Network Segregation**: Red team external, blue team internal
- ✅ **Real-Time Coordination**: WebSocket-based communication
- ✅ **Automated Scoring**: Points for attacks and defenses
- ✅ **Safety Controls**: Rate limiting, emergency stop, pause/resume
- ✅ **Complete Audit Trail**: Every action logged to database
- ✅ **Live Dashboard**: Real-time visualization of engagement
- ✅ **Production Ready**: Docker-based, scalable deployment

## 🎮 How It Works

### Red Team (Attackers)
1. Connect from external VPS via HTTPS (Port 443)
2. Perform reconnaissance and scanning
3. Attempt exploitation
4. Report results to orchestrator
5. Earn points for successful attacks

### Blue Team (Defenders)
1. Monitor internal network via local connection (Port 8080)
2. Detect suspicious activity
3. Block attacks and respond to incidents
4. Patch vulnerabilities
5. Earn points for successful defense

### Orchestrator (Coordinator)
1. Accepts connections from both teams
2. Alerts blue team when attacks occur
3. Tracks time-to-detect for attacks
4. Calculates scores based on effectiveness
5. Provides real-time dashboard
6. Maintains complete audit trail

## 📊 Scoring System

### Red Team Points
- Reconnaissance: +5
- Vulnerability found: +10
- Successful exploit: +50
- Privilege escalation: +75
- Data exfiltration: +100
- Persistence: +150

### Blue Team Points
- Attack detected: +10
- Attack blocked: +25
- Fast response (<5 min): +20 bonus
- Vulnerability patched: +50
- Incident contained: +40
- Recovery completed: +30

## 🛠️ Tech Stack

- **Runtime**: Node.js + TypeScript
- **Communication**: WebSocket (ws library)
- **Database**: PostgreSQL
- **Cache**: Redis
- **Dashboard**: Next.js 14
- **Containers**: Docker + Docker Compose
- **Reverse Proxy**: Nginx

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| [Architecture](BLUE_RED_TEAM_ARCHITECTURE.md) | System design and components |
| [Deployment](DEPLOYMENT_GUIDE.md) | How to deploy everything |
| [Summary](PROJECT_SUMMARY.md) | Features and next steps |

## 🚦 Deployment Checklist

- [ ] Read architecture document
- [ ] Set up on-premises server
- [ ] Set up external VPS for red team
- [ ] Generate security tokens
- [ ] Deploy orchestrator + database
- [ ] Deploy blue team agents
- [ ] Deploy red team agents
- [ ] Configure firewall rules
- [ ] Access dashboard
- [ ] Run test scenario

## 🔧 Requirements

### On-Premises Server
- Ubuntu 22.04 LTS
- 8GB RAM (minimum)
- 4 CPU cores
- Docker + Docker Compose
- Static IP
- Domain name (optional but recommended)

### External VPS (Red Team)
- Any Linux distribution
- 2GB RAM
- 2 CPU cores  
- Docker + Docker Compose
- Public IP address

## 🎯 Use Cases

- Security team training
- Red team / blue team exercises
- Capture the flag (CTF) competitions
- Security certification preparation
- Research and development
- Product security testing
- Incident response training

## ⚠️ Legal Notice

This platform is designed for:
- Authorized security testing
- Training and education
- Research in controlled environments

**DO NOT use for**:
- Unauthorized penetration testing
- Attacking systems without permission
- Any illegal activities

Always ensure you have proper authorization before conducting security testing.

## 🚀 Getting Started

### Option 1: Quick Demo (30 minutes)
1. Read PROJECT_SUMMARY.md
2. Follow "Minimum Setup" in DEPLOYMENT_GUIDE.md
3. Start orchestrator and agents
4. Watch the dashboard

### Option 2: Production Deployment (4 hours)
1. Read BLUE_RED_TEAM_ARCHITECTURE.md (understand design)
2. Follow full DEPLOYMENT_GUIDE.md (all steps)
3. Configure real security tools
4. Create custom scenarios
5. Train your team

## 📈 What's Different from Original CyberSwarm?

### Before (Original)
- ❌ All agents in same location
- ❌ No team separation
- ❌ No realistic network boundaries
- ❌ Basic coordination
- ❌ Limited scoring

### After (This Version)
- ✅ Red team external, blue team internal
- ✅ Proper network segregation
- ✅ Realistic attack/defense simulation
- ✅ Advanced orchestrator with safety controls
- ✅ Comprehensive scoring system
- ✅ Production-ready deployment
- ✅ Complete documentation

## 🎓 Learning Path

1. **Week 1**: Deploy basic infrastructure, test connectivity
2. **Week 2**: Run simple scenarios, understand scoring
3. **Week 3**: Integrate real security tools
4. **Week 4**: Develop custom attack/defense scenarios
5. **Week 5**: Production hardening and optimization
6. **Week 6+**: Advanced scenarios and team training

## 🤝 Next Steps

Ready to get started? Here's what to do:

1. **📖 Read**: Start with PROJECT_SUMMARY.md for overview
2. **🏗️ Understand**: Review BLUE_RED_TEAM_ARCHITECTURE.md
3. **🚀 Deploy**: Follow DEPLOYMENT_GUIDE.md step-by-step
4. **🎮 Test**: Run your first red vs blue engagement
5. **🔧 Customize**: Adapt for your specific needs
6. **📈 Scale**: Add more agents and scenarios

## 💡 Pro Tips

- Start with simulation mode before using real tools
- Test in isolated environment first
- Monitor resource usage during engagements
- Review logs after each exercise
- Document lessons learned
- Gradually increase complexity

## 🐛 Troubleshooting

Common issues and solutions are in DEPLOYMENT_GUIDE.md under "Troubleshooting" section.

Quick checks:
```bash
# Check all services
docker ps

# View logs
docker-compose logs -f

# Test connectivity
curl http://localhost:8080/health
```

## 📞 Support

- Check DEPLOYMENT_GUIDE.md for troubleshooting
- Review architecture for design questions
- Examine logs for runtime issues
- Test network connectivity for connection problems

## 📝 License

This is a custom implementation for CyberSwarm. Refer to the original project license for base components.

---

## 🎉 You're Ready!

Everything you need is in this package:
- ✅ Complete architecture design
- ✅ Working code for all components
- ✅ Step-by-step deployment guide
- ✅ Docker configurations
- ✅ Security best practices
- ✅ Comprehensive documentation

**Time to build your cyber training platform! 🚀**

---

*Questions? Start with PROJECT_SUMMARY.md, then dive into BLUE_RED_TEAM_ARCHITECTURE.md*
