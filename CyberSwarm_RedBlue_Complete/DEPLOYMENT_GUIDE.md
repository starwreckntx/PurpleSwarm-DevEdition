# CyberSwarm Blue vs Red Team - Deployment Guide

## Quick Start Guide

This guide will walk you through deploying a complete blue team vs red team cybersecurity exercise platform.

## Prerequisites

- **On-Premises Server** (for Blue Team + Orchestrator):
  - Ubuntu 22.04 LTS or similar
  - 8GB RAM minimum
  - 4 CPU cores
  - Docker and Docker Compose installed
  - Static IP address
  - Domain name (recommended)

- **External VPS** (for Red Team):
  - Any cloud provider (AWS, DigitalOcean, Linode, etc.)
  - 2GB RAM minimum
  - 2 CPU cores
  - Docker and Docker Compose installed
  - Public IP address

## Architecture Recap

```
[External VPS]              [Your Network]
┌─────────────────┐         ┌──────────────────────────────┐
│   RED TEAM      │────────▶│  Firewall/DMZ                │
│   (Attackers)   │ HTTPS   │                              │
└─────────────────┘         │  ┌────────────────────────┐  │
                            │  │   ORCHESTRATOR         │  │
                            │  │   (Coordinator)        │  │
                            │  └────────────────────────┘  │
                            │                              │
                            │  ┌────────────────────────┐  │
                            │  │   BLUE TEAM            │  │
                            │  │   (Defenders)          │  │
                            │  └────────────────────────┘  │
                            │                              │
                            │  ┌────────────────────────┐  │
                            │  │   TARGET SYSTEMS       │  │
                            │  │   (To be defended)     │  │
                            │  └────────────────────────┘  │
                            └──────────────────────────────┘
```

## Step 1: Generate Security Tokens

On your on-premises server:

```bash
# Generate Red Team token
RED_TEAM_TOKEN=$(openssl rand -hex 32)
echo "Red Team Token: $RED_TEAM_TOKEN"

# Generate Blue Team token
BLUE_TEAM_TOKEN=$(openssl rand -hex 32)
echo "Blue Team Token: $BLUE_TEAM_TOKEN"

# Generate database password
DB_PASSWORD=$(openssl rand -base64 24)
echo "Database Password: $DB_PASSWORD"

# Save these securely!
cat > .tokens << EOF
RED_TEAM_TOKEN=$RED_TEAM_TOKEN
BLUE_TEAM_TOKEN=$BLUE_TEAM_TOKEN
DB_PASSWORD=$DB_PASSWORD
EOF

chmod 600 .tokens
```

## Step 2: Deploy Orchestrator (On-Premises)

### 2.1 Create directory structure

```bash
mkdir -p ~/cyberswarm/{orchestrator,blue-team,config,logs,data}
cd ~/cyberswarm
```

### 2.2 Create environment file

```bash
cat > orchestrator/.env << 'EOF'
# Orchestrator Configuration
NODE_ENV=production
RED_TEAM_PORT=443
BLUE_TEAM_PORT=8080

# Tokens (from Step 1)
RED_TEAM_TOKEN=your-red-team-token-here
BLUE_TEAM_TOKEN=your-blue-team-token-here

# Database
DATABASE_URL=postgresql://cyberswarm:your-db-password@postgres:5432/cyberswarm
DB_PASSWORD=your-db-password-here

# Redis
REDIS_URL=redis://redis:6379

# Dashboard
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080

# Security
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
EOF
```

### 2.3 Create docker-compose.yml for orchestrator

```bash
cat > orchestrator/docker-compose.yml << 'EOF'
version: '3.8'

services:
  orchestrator:
    image: node:18-alpine
    working_dir: /app
    volumes:
      - ./src:/app
      - ../logs:/app/logs
      - ../config:/app/config
    ports:
      - "443:443"    # Red Team (external) - HTTPS/WSS
      - "8080:8080"  # Blue Team (internal) - HTTP/WS
    environment:
      - NODE_ENV=production
      - RED_TEAM_PORT=443
      - BLUE_TEAM_PORT=8080
      - RED_TEAM_TOKEN=${RED_TEAM_TOKEN}
      - BLUE_TEAM_TOKEN=${BLUE_TEAM_TOKEN}
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    command: >
      sh -c "npm install && 
             npm install -g ts-node typescript &&
             npm install ws uuid @types/ws @types/uuid &&
             ts-node orchestrator-redblue.ts"
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - internal-net

  dashboard:
    image: node:18-alpine
    working_dir: /app
    volumes:
      - ../app:/app
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://orchestrator:8080
      - NEXT_PUBLIC_WS_URL=ws://orchestrator:8080
    command: >
      sh -c "npm install && npm run build && npm start"
    depends_on:
      - orchestrator
    restart: unless-stopped
    networks:
      - internal-net

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: cyberswarm
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: cyberswarm
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped
    networks:
      - internal-net

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped
    networks:
      - internal-net

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "8443:443"  # Different from orchestrator's 443
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
EOF
```

### 2.4 Create database initialization script

```bash
cat > orchestrator/init.sql << 'EOF'
-- Agents table
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY,
    agent_name VARCHAR(255) NOT NULL,
    team VARCHAR(10) NOT NULL CHECK (team IN ('red', 'blue', 'system')),
    agent_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('idle', 'busy', 'error', 'offline')),
    location VARCHAR(20) NOT NULL CHECK (location IN ('external', 'internal')),
    last_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    capabilities JSONB,
    stats JSONB DEFAULT '{"tasksCompleted": 0, "tasksFailed": 0, "points": 0}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agents_team ON agents(team);
CREATE INDEX idx_agents_status ON agents(status);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    agent_id UUID REFERENCES agents(id),
    team VARCHAR(10) NOT NULL CHECK (team IN ('red', 'blue', 'system')),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'low', 'medium', 'high', 'critical')),
    data JSONB,
    scored BOOLEAN DEFAULT false,
    points INTEGER DEFAULT 0
);

CREATE INDEX idx_events_team ON events(team);
CREATE INDEX idx_events_timestamp ON events(timestamp);
CREATE INDEX idx_events_severity ON events(severity);

-- Attacks table
CREATE TABLE IF NOT EXISTS attacks (
    id UUID PRIMARY KEY,
    attack_type VARCHAR(100) NOT NULL,
    red_agent_id UUID REFERENCES agents(id),
    target_system VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('initiated', 'in_progress', 'successful', 'blocked', 'failed')),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    detection_time TIMESTAMP,
    blue_agent_id UUID REFERENCES agents(id),
    ttd_seconds INTEGER,
    data JSONB
);

CREATE INDEX idx_attacks_status ON attacks(status);
CREATE INDEX idx_attacks_timestamp ON attacks(timestamp);

-- Defenses table
CREATE TABLE IF NOT EXISTS defenses (
    id UUID PRIMARY KEY,
    defense_type VARCHAR(100) NOT NULL,
    blue_agent_id UUID REFERENCES agents(id) NOT NULL,
    attack_id UUID REFERENCES attacks(id),
    action_taken VARCHAR(255) NOT NULL,
    effectiveness INTEGER NOT NULL CHECK (effectiveness >= 0 AND effectiveness <= 100),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data JSONB
);

-- Scoring events table
CREATE TABLE IF NOT EXISTS scoring_events (
    id UUID PRIMARY KEY,
    team VARCHAR(10) NOT NULL CHECK (team IN ('red', 'blue')),
    event_id UUID REFERENCES events(id),
    points INTEGER NOT NULL,
    reason VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scoring_team ON scoring_events(team);
CREATE INDEX idx_scoring_timestamp ON scoring_events(timestamp);
EOF
```

### 2.5 Create nginx configuration

```bash
cat > orchestrator/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream orchestrator {
        server orchestrator:8080;
    }

    upstream dashboard {
        server dashboard:3000;
    }

    server {
        listen 80;
        server_name _;

        # Redirect to HTTPS
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl;
        server_name _;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # Dashboard
        location / {
            proxy_pass http://dashboard;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # Orchestrator API
        location /api/ {
            proxy_pass http://orchestrator;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # WebSocket endpoints
        location /red-team {
            proxy_pass http://orchestrator;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_read_timeout 86400;
        }

        location /blue-team {
            proxy_pass http://orchestrator;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_read_timeout 86400;
        }
    }
}
EOF
```

### 2.6 Generate SSL certificates

```bash
# Self-signed certificate for testing
cd orchestrator
mkdir -p ssl
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes \
  -subj "/CN=cyberswarm.local"

# For production, use Let's Encrypt:
# sudo certbot certonly --standalone -d yourdomain.com
# cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
# cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem
```

### 2.7 Copy orchestrator code

```bash
# Copy the orchestrator TypeScript file
cp /path/to/orchestrator-redblue.ts orchestrator/src/orchestrator-redblue.ts
```

### 2.8 Start orchestrator

```bash
cd orchestrator
docker-compose up -d

# Check logs
docker-compose logs -f orchestrator
```

## Step 3: Deploy Blue Team (On-Premises)

### 3.1 Create Blue Team docker-compose

```bash
cd ~/cyberswarm/blue-team

cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  network-monitor:
    image: node:18-alpine
    working_dir: /app
    volumes:
      - ./agents:/app
    environment:
      - ORCHESTRATOR_URL=ws://orchestrator:8080/blue-team
      - AGENT_TOKEN=${BLUE_TEAM_TOKEN}
      - AGENT_TYPE=network_monitor
      - PROTECTED_NETWORKS=10.0.0.0/8,192.168.0.0/16
      - AUTO_RESPONSE=true
    command: >
      sh -c "npm install ws uuid @types/ws @types/uuid &&
             npm install -g ts-node typescript &&
             ts-node blue-team-agent.ts"
    network_mode: host
    restart: unless-stopped

  ids-agent:
    image: node:18-alpine
    working_dir: /app
    volumes:
      - ./agents:/app
    environment:
      - ORCHESTRATOR_URL=ws://orchestrator:8080/blue-team
      - AGENT_TOKEN=${BLUE_TEAM_TOKEN}
      - AGENT_TYPE=ids
      - PROTECTED_NETWORKS=10.0.0.0/8,192.168.0.0/16
      - AUTO_RESPONSE=true
    command: >
      sh -c "npm install ws uuid @types/ws @types/uuid &&
             npm install -g ts-node typescript &&
             ts-node blue-team-agent.ts"
    restart: unless-stopped

  patch-management:
    image: node:18-alpine
    working_dir: /app
    volumes:
      - ./agents:/app
    environment:
      - ORCHESTRATOR_URL=ws://orchestrator:8080/blue-team
      - AGENT_TOKEN=${BLUE_TEAM_TOKEN}
      - AGENT_TYPE=patch_management
      - PROTECTED_NETWORKS=10.0.0.0/8,192.168.0.0/16
      - AUTO_RESPONSE=true
    command: >
      sh -c "npm install ws uuid @types/ws @types/uuid &&
             npm install -g ts-node typescript &&
             ts-node blue-team-agent.ts"
    restart: unless-stopped

  incident-response:
    image: node:18-alpine
    working_dir: /app
    volumes:
      - ./agents:/app
    environment:
      - ORCHESTRATOR_URL=ws://orchestrator:8080/blue-team
      - AGENT_TOKEN=${BLUE_TEAM_TOKEN}
      - AGENT_TYPE=incident_response
      - PROTECTED_NETWORKS=10.0.0.0/8,192.168.0.0/16
      - AUTO_RESPONSE=true
    command: >
      sh -c "npm install ws uuid @types/ws @types/uuid &&
             npm install -g ts-node typescript &&
             ts-node blue-team-agent.ts"
    restart: unless-stopped
EOF
```

### 3.2 Copy Blue Team agent code

```bash
mkdir -p agents
cp /path/to/blue-team-agent.ts agents/blue-team-agent.ts
```

### 3.3 Create environment file

```bash
cat > .env << EOF
BLUE_TEAM_TOKEN=$(grep BLUE_TEAM_TOKEN ~/cyberswarm/.tokens | cut -d= -f2)
EOF
```

### 3.4 Start Blue Team

```bash
docker-compose up -d

# Check logs
docker-compose logs -f
```

## Step 4: Deploy Red Team (External VPS)

### 4.1 SSH to your external VPS

```bash
ssh user@your-vps-ip
```

### 4.2 Create Red Team directory and docker-compose

```bash
mkdir -p ~/cyberswarm-redteam
cd ~/cyberswarm-redteam

cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  discovery-agent:
    image: node:18-alpine
    working_dir: /app
    volumes:
      - ./agents:/app
    environment:
      - ORCHESTRATOR_URL=wss://your-domain-or-ip:443/red-team
      - AGENT_TOKEN=${RED_TEAM_TOKEN}
      - AGENT_TYPE=discovery
      - TARGET_DOMAIN=${TARGET_DOMAIN}
      - STEALTH_MODE=true
      - MAX_ATTACK_RATE=10
    command: >
      sh -c "npm install ws uuid @types/ws @types/uuid &&
             npm install -g ts-node typescript &&
             ts-node red-team-agent.ts"
    restart: unless-stopped

  vuln-scanner:
    image: node:18-alpine
    working_dir: /app
    volumes:
      - ./agents:/app
    environment:
      - ORCHESTRATOR_URL=wss://your-domain-or-ip:443/red-team
      - AGENT_TOKEN=${RED_TEAM_TOKEN}
      - AGENT_TYPE=vulnerability_scanner
      - TARGET_DOMAIN=${TARGET_DOMAIN}
      - STEALTH_MODE=true
      - MAX_ATTACK_RATE=10
    command: >
      sh -c "npm install ws uuid @types/ws @types/uuid &&
             npm install -g ts-node typescript &&
             ts-node red-team-agent.ts"
    restart: unless-stopped

  exploit-agent:
    image: node:18-alpine
    working_dir: /app
    volumes:
      - ./agents:/app
    environment:
      - ORCHESTRATOR_URL=wss://your-domain-or-ip:443/red-team
      - AGENT_TOKEN=${RED_TEAM_TOKEN}
      - AGENT_TYPE=exploit
      - TARGET_DOMAIN=${TARGET_DOMAIN}
      - STEALTH_MODE=true
      - MAX_ATTACK_RATE=10
    command: >
      sh -c "npm install ws uuid @types/ws @types/uuid &&
             npm install -g ts-node typescript &&
             ts-node red-team-agent.ts"
    restart: unless-stopped
EOF
```

### 4.3 Copy Red Team agent code

```bash
mkdir -p agents
# Upload the red-team-agent.ts file
scp /path/to/red-team-agent.ts user@your-vps-ip:~/cyberswarm-redteam/agents/
```

### 4.4 Create environment file

```bash
cat > .env << 'EOF'
RED_TEAM_TOKEN=your-red-team-token-here
TARGET_DOMAIN=yourdomain.com
EOF
```

### 4.5 Start Red Team

```bash
docker-compose up -d

# Check logs
docker-compose logs -f
```

## Step 5: Verify Deployment

### 5.1 Check all services are running

On-premises:
```bash
# Check orchestrator
docker ps | grep orchestrator
docker-compose -f ~/cyberswarm/orchestrator/docker-compose.yml logs

# Check Blue Team
docker-compose -f ~/cyberswarm/blue-team/docker-compose.yml ps
```

External VPS:
```bash
# Check Red Team
docker-compose ps
docker-compose logs
```

### 5.2 Access the dashboard

Open your browser and navigate to:
```
http://your-server-ip:3000
# or
https://yourdomain.com
```

You should see:
- Real-time agent status
- Red Team and Blue Team agents connected
- Live event stream
- Scoring dashboard

### 5.3 Monitor the engagement

Watch the logs to see the cyber engagement unfold:

```bash
# Orchestrator logs
docker-compose -f ~/cyberswarm/orchestrator/docker-compose.yml logs -f orchestrator

# Blue Team logs
docker-compose -f ~/cyberswarm/blue-team/docker-compose.yml logs -f

# Red Team logs (on VPS)
docker-compose logs -f
```

## Step 6: Firewall Configuration

### On-Premises Server

```bash
# Allow dashboard access
sudo ufw allow 3000/tcp

# Allow Red Team connection (HTTPS)
sudo ufw allow 443/tcp

# Allow SSH
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable
```

### External VPS (Red Team)

```bash
# Allow outbound HTTPS to orchestrator
sudo ufw allow out 443/tcp

# Allow SSH
sudo ufw allow 22/tcp

# Block all other inbound
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Enable firewall
sudo ufw enable
```

## Troubleshooting

### Red Team can't connect

```bash
# Check if orchestrator is listening on 443
netstat -tuln | grep 443

# Check Red Team token matches
grep RED_TEAM_TOKEN ~/cyberswarm/orchestrator/.env
grep RED_TEAM_TOKEN ~/cyberswarm-redteam/.env

# Test connection
curl -k https://your-domain-or-ip:443
```

### Blue Team can't connect

```bash
# Check if orchestrator is listening on 8080
netstat -tuln | grep 8080

# Check logs
docker-compose -f ~/cyberswarm/orchestrator/docker-compose.yml logs orchestrator
```

### Dashboard not loading

```bash
# Check dashboard is running
docker ps | grep dashboard

# Check logs
docker-compose -f ~/cyberswarm/orchestrator/docker-compose.yml logs dashboard

# Rebuild if needed
docker-compose -f ~/cyberswarm/orchestrator/docker-compose.yml up -d --build dashboard
```

## Advanced Configuration

### Enable Real Attack Tools

To use real security tools instead of simulations, modify Red Team agents:

```yaml
  nmap-scanner:
    image: instrumentisto/nmap
    command: nmap -sV target.com
    
  metasploit:
    image: metasploitframework/metasploit-framework
    
  burpsuite:
    image: burpsuite
```

### Add More Blue Team Capabilities

```yaml
  wazuh:
    image: wazuh/wazuh
    
  suricata:
    image: jasonish/suricata
    
  elastic-siem:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
```

## Maintenance

### Update agents

```bash
# Stop services
docker-compose down

# Pull latest changes
git pull

# Rebuild
docker-compose up -d --build
```

### Backup database

```bash
docker exec postgres pg_dump -U cyberswarm cyberswarm > backup.sql
```

### View metrics

```bash
# Connect to database
docker exec -it postgres psql -U cyberswarm

# Query scores
SELECT team, SUM(points) FROM scoring_events GROUP BY team;

# Query attacks
SELECT status, COUNT(*) FROM attacks GROUP BY status;
```

## Next Steps

1. Configure real target infrastructure to defend
2. Add more sophisticated attack scenarios
3. Integrate with real security tools (SIEM, IDS, etc.)
4. Create custom scoring rules
5. Build training scenarios
6. Enable team-based authentication for dashboard

## Support

For issues or questions:
- Check logs: `docker-compose logs`
- Review architecture document
- Check firewall rules
- Verify network connectivity

---

**Congratulations!** You now have a fully functional blue team vs red team cybersecurity exercise platform.
