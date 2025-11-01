/**
 * Red Team Agent - External Attack Agent
 * Location: External VPS/Cloud
 * Purpose: Simulate external attacker attempting to compromise infrastructure
 */

import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';

interface RedTeamConfig {
  orchestratorUrl: string;
  agentToken: string;
  agentType: 'discovery' | 'vulnerability_scanner' | 'exploit' | 'social_engineering';
  targetDomain: string;
  stealthMode: boolean;
  maxAttackRate: number;
}

export class RedTeamAgent {
  private ws?: WebSocket;
  private agentId: string;
  private connected = false;
  private heartbeatInterval?: NodeJS.Timeout;
  
  constructor(
    private config: RedTeamConfig,
    private agentName?: string
  ) {
    this.agentId = uuidv4();
    this.agentName = agentName || `${config.agentType}-${this.agentId.slice(0, 8)}`;
  }

  /**
   * Connect to orchestrator
   */
  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`🔴 [RED TEAM] Connecting to orchestrator: ${this.config.orchestratorUrl}`);
      
      this.ws = new WebSocket(this.config.orchestratorUrl, {
        headers: {
          'Authorization': `Bearer ${this.config.agentToken}`
        }
      });

      this.ws.on('open', () => {
        console.log(`✅ [RED TEAM] Connected to orchestrator`);
        this.authenticate();
        this.setupMessageHandlers();
        this.startHeartbeat();
        this.connected = true;
        resolve();
      });

      this.ws.on('error', (error) => {
        console.error(`❌ [RED TEAM] Connection error:`, error.message);
        reject(error);
      });

      this.ws.on('close', () => {
        console.log(`🔌 [RED TEAM] Disconnected from orchestrator`);
        this.connected = false;
        this.stopHeartbeat();
        // Attempt reconnection
        setTimeout(() => this.reconnect(), 5000);
      });
    });
  }

  /**
   * Authenticate with orchestrator
   */
  private authenticate() {
    this.send({
      type: 'auth',
      agent_id: this.agentId,
      agent_name: this.agentName,
      agent_type: this.config.agentType,
      team: 'red',
      capabilities: this.getCapabilities(),
      token: this.config.agentToken,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Setup message handlers
   */
  private setupMessageHandlers() {
    if (!this.ws) return;

    this.ws.on('message', (data: string) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(message);
      } catch (error) {
        console.error('[RED TEAM] Failed to parse message:', error);
      }
    });
  }

  /**
   * Handle incoming messages from orchestrator
   */
  private handleMessage(message: any) {
    switch (message.type) {
      case 'auth_success':
        console.log(`✅ [RED TEAM] Authentication successful: ${message.agent_id}`);
        this.agentId = message.agent_id;
        this.startOperations();
        break;
      
      case 'task':
        console.log(`📋 [RED TEAM] New task received: ${message.task_type}`);
        this.executeTask(message);
        break;
      
      case 'pause':
        console.log(`⏸️ [RED TEAM] Operations paused`);
        break;
      
      case 'resume':
        console.log(`▶️ [RED TEAM] Operations resumed`);
        break;
      
      case 'emergency_stop':
        console.log(`🚨 [RED TEAM] Emergency stop received - ceasing all operations`);
        this.shutdown();
        break;
      
      case 'error':
        console.error(`❌ [RED TEAM] Error from orchestrator:`, message.message);
        break;
    }
  }

  /**
   * Send message to orchestrator
   */
  private send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Send event to orchestrator
   */
  private sendEvent(eventType: string, severity: string, data: any) {
    this.send({
      type: 'event',
      event_type: eventType,
      agent_id: this.agentId,
      team: 'red',
      severity,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get agent capabilities
   */
  private getCapabilities(): string[] {
    switch (this.config.agentType) {
      case 'discovery':
        return ['port_scan', 'subdomain_enum', 'dns_enum', 'whois', 'osint'];
      case 'vulnerability_scanner':
        return ['vuln_scan', 'cve_check', 'config_audit', 'ssl_check'];
      case 'exploit':
        return ['exploit_execution', 'payload_delivery', 'reverse_shell'];
      case 'social_engineering':
        return ['phishing', 'credential_harvesting', 'pretexting'];
      default:
        return [];
    }
  }

  /**
   * Start operations based on agent type
   */
  private async startOperations() {
    console.log(`🎯 [RED TEAM] Starting ${this.config.agentType} operations`);

    switch (this.config.agentType) {
      case 'discovery':
        await this.performDiscovery();
        break;
      case 'vulnerability_scanner':
        await this.performVulnerabilityScan();
        break;
      case 'exploit':
        await this.performExploitation();
        break;
      case 'social_engineering':
        await this.performSocialEngineering();
        break;
    }
  }

  /**
   * Discovery operations (reconnaissance)
   */
  private async performDiscovery() {
    // Subdomain enumeration
    this.sendEvent('scan_initiated', 'info', {
      scan_type: 'subdomain_enum',
      target: this.config.targetDomain
    });

    await this.sleep(2000);

    const subdomains = this.simulateSubdomainDiscovery();
    this.sendEvent('discovery_completed', 'info', {
      scan_type: 'subdomain_enum',
      results_count: subdomains.length,
      discovered_hosts: subdomains
    });

    // Port scanning
    for (const subdomain of subdomains) {
      this.send({
        type: 'attack_initiated',
        attack_type: 'port_scan',
        target: subdomain,
        data: {
          ports: '1-1000',
          scan_type: 'SYN'
        },
        timestamp: new Date().toISOString()
      });

      await this.sleep(3000);

      const openPorts = this.simulatePortScan();
      this.sendEvent('port_scan_completed', 'low', {
        target: subdomain,
        open_ports: openPorts
      });
    }
  }

  /**
   * Vulnerability scanning operations
   */
  private async performVulnerabilityScan() {
    this.sendEvent('scan_initiated', 'info', {
      scan_type: 'vulnerability_assessment',
      target: this.config.targetDomain
    });

    await this.sleep(5000);

    // Simulate vulnerability discovery
    const vulnerabilities = this.simulateVulnerabilityDiscovery();
    
    for (const vuln of vulnerabilities) {
      this.sendEvent('vulnerability_found', 'medium', vuln);
      await this.sleep(1000);
    }

    this.sendEvent('scan_completed', 'info', {
      scan_type: 'vulnerability_assessment',
      vulnerabilities_found: vulnerabilities.length
    });
  }

  /**
   * Exploitation operations
   */
  private async performExploitation() {
    // Simulate exploitation attempts
    const exploits = [
      { target: 'web.example.com', type: 'sql_injection', cve: 'CVE-2024-1234' },
      { target: 'api.example.com', type: 'auth_bypass', cve: 'CVE-2024-5678' },
      { target: 'admin.example.com', type: 'rce', cve: 'CVE-2024-9012' }
    ];

    for (const exploit of exploits) {
      this.send({
        type: 'attack_initiated',
        attack_type: exploit.type,
        target: exploit.target,
        data: {
          cve: exploit.cve,
          method: 'automated'
        },
        timestamp: new Date().toISOString()
      });

      await this.sleep(5000);

      // Simulate success/failure
      const success = Math.random() > 0.7; // 30% success rate

      if (success) {
        this.sendEvent('exploit_successful', 'high', {
          target: exploit.target,
          exploit_type: exploit.type,
          cve: exploit.cve,
          access_level: 'user'
        });

        // Attempt privilege escalation
        await this.sleep(3000);
        const privEsc = Math.random() > 0.5;
        
        if (privEsc) {
          this.sendEvent('privilege_escalated', 'critical', {
            target: exploit.target,
            from_level: 'user',
            to_level: 'admin',
            method: 'kernel_exploit'
          });
        }
      } else {
        this.sendEvent('exploit_failed', 'low', {
          target: exploit.target,
          exploit_type: exploit.type,
          reason: 'Target patched or protected'
        });
      }

      await this.sleep(2000);
    }
  }

  /**
   * Social engineering operations
   */
  private async performSocialEngineering() {
    // Simulate phishing campaign
    this.sendEvent('campaign_initiated', 'info', {
      campaign_type: 'spear_phishing',
      target_count: 50
    });

    await this.sleep(10000);

    this.sendEvent('campaign_results', 'medium', {
      campaign_type: 'spear_phishing',
      emails_sent: 50,
      opened: 35,
      clicked: 12,
      credentials_harvested: 3
    });
  }

  /**
   * Execute specific task from orchestrator
   */
  private async executeTask(task: any) {
    // Task execution logic
    console.log(`🎯 [RED TEAM] Executing task: ${task.task_type}`);
    
    // Send task started event
    this.sendEvent('task_started', 'info', {
      task_id: task.task_id,
      task_type: task.task_type
    });

    // Simulate task execution
    await this.sleep(5000);

    // Send task completed event
    this.sendEvent('task_completed', 'info', {
      task_id: task.task_id,
      task_type: task.task_type,
      success: true
    });
  }

  /**
   * Start heartbeat
   */
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.send({
        type: 'heartbeat',
        agent_id: this.agentId,
        timestamp: new Date().toISOString()
      });
    }, 30000); // Every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }

  /**
   * Reconnect to orchestrator
   */
  private async reconnect() {
    if (this.connected) return;
    
    console.log(`🔄 [RED TEAM] Attempting to reconnect...`);
    try {
      await this.connect();
    } catch (error) {
      console.error(`❌ [RED TEAM] Reconnection failed:`, error);
    }
  }

  /**
   * Shutdown agent
   */
  public shutdown() {
    console.log(`🛑 [RED TEAM] Shutting down agent...`);
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
    }
  }

  // Simulation helpers

  private simulateSubdomainDiscovery(): string[] {
    return [
      `www.${this.config.targetDomain}`,
      `api.${this.config.targetDomain}`,
      `admin.${this.config.targetDomain}`,
      `mail.${this.config.targetDomain}`,
      `dev.${this.config.targetDomain}`
    ];
  }

  private simulatePortScan(): number[] {
    const commonPorts = [21, 22, 80, 443, 3306, 5432, 8080, 8443];
    return commonPorts.filter(() => Math.random() > 0.6);
  }

  private simulateVulnerabilityDiscovery() {
    return [
      {
        cve: 'CVE-2024-1234',
        severity: 'high',
        description: 'SQL Injection vulnerability in login form',
        target: `www.${this.config.targetDomain}`,
        cvss_score: 8.5
      },
      {
        cve: 'CVE-2024-5678',
        severity: 'medium',
        description: 'Outdated TLS version',
        target: `api.${this.config.targetDomain}`,
        cvss_score: 5.3
      },
      {
        cve: 'CVE-2024-9012',
        severity: 'critical',
        description: 'Remote Code Execution in admin panel',
        target: `admin.${this.config.targetDomain}`,
        cvss_score: 9.8
      }
    ];
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Example usage
if (require.main === module) {
  const agent = new RedTeamAgent({
    orchestratorUrl: process.env.ORCHESTRATOR_URL || 'wss://orchestrator.example.com:443/red-team',
    agentToken: process.env.AGENT_TOKEN || 'red-team-secret',
    agentType: (process.env.AGENT_TYPE as any) || 'discovery',
    targetDomain: process.env.TARGET_DOMAIN || 'target.example.com',
    stealthMode: process.env.STEALTH_MODE === 'true',
    maxAttackRate: parseInt(process.env.MAX_ATTACK_RATE || '10')
  });

  agent.connect().catch(console.error);

  // Graceful shutdown
  process.on('SIGINT', () => {
    agent.shutdown();
    process.exit(0);
  });
}
