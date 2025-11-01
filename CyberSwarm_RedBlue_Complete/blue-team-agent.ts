/**
 * Blue Team Agent - Internal Defense Agent
 * Location: On-premises internal network
 * Purpose: Defend infrastructure and detect/respond to attacks
 */

import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';

interface BlueTeamConfig {
  orchestratorUrl: string;
  agentToken: string;
  agentType: 'network_monitor' | 'ids' | 'patch_management' | 'incident_response' | 'siem';
  protectedNetworks: string[];
  autoResponse: boolean;
}

export class BlueTeamAgent {
  private ws?: WebSocket;
  private agentId: string;
  private connected = false;
  private heartbeatInterval?: NodeJS.Timeout;
  private monitoringInterval?: NodeJS.Timeout;
  
  // Detection state
  private detectedAttacks: Map<string, any> = new Map();
  private suspiciousEvents: any[] = [];
  
  constructor(
    private config: BlueTeamConfig,
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
      console.log(`🔵 [BLUE TEAM] Connecting to orchestrator: ${this.config.orchestratorUrl}`);
      
      this.ws = new WebSocket(this.config.orchestratorUrl, {
        headers: {
          'Authorization': `Bearer ${this.config.agentToken}`
        }
      });

      this.ws.on('open', () => {
        console.log(`✅ [BLUE TEAM] Connected to orchestrator`);
        this.authenticate();
        this.setupMessageHandlers();
        this.startHeartbeat();
        this.startMonitoring();
        this.connected = true;
        resolve();
      });

      this.ws.on('error', (error) => {
        console.error(`❌ [BLUE TEAM] Connection error:`, error.message);
        reject(error);
      });

      this.ws.on('close', () => {
        console.log(`🔌 [BLUE TEAM] Disconnected from orchestrator`);
        this.connected = false;
        this.stopHeartbeat();
        this.stopMonitoring();
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
      team: 'blue',
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
        console.error('[BLUE TEAM] Failed to parse message:', error);
      }
    });
  }

  /**
   * Handle incoming messages from orchestrator
   */
  private async handleMessage(message: any) {
    switch (message.type) {
      case 'auth_success':
        console.log(`✅ [BLUE TEAM] Authentication successful: ${message.agent_id}`);
        this.agentId = message.agent_id;
        break;
      
      case 'attack_alert':
        console.log(`🚨 [BLUE TEAM] Attack alert received: ${message.attack_type}`);
        await this.handleAttackAlert(message);
        break;
      
      case 'task':
        console.log(`📋 [BLUE TEAM] New task received: ${message.task_type}`);
        await this.executeTask(message);
        break;
      
      case 'pause':
        console.log(`⏸️ [BLUE TEAM] Operations paused`);
        this.stopMonitoring();
        break;
      
      case 'resume':
        console.log(`▶️ [BLUE TEAM] Operations resumed`);
        this.startMonitoring();
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
      team: 'blue',
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
      case 'network_monitor':
        return ['traffic_analysis', 'anomaly_detection', 'packet_capture'];
      case 'ids':
        return ['signature_detection', 'behavioral_analysis', 'alert_generation'];
      case 'patch_management':
        return ['vulnerability_assessment', 'patch_deployment', 'system_hardening'];
      case 'incident_response':
        return ['threat_containment', 'forensics', 'recovery'];
      case 'siem':
        return ['log_aggregation', 'correlation', 'threat_intelligence'];
      default:
        return [];
    }
  }

  /**
   * Start monitoring operations
   */
  private startMonitoring() {
    console.log(`🛡️ [BLUE TEAM] Starting ${this.config.agentType} monitoring`);

    this.monitoringInterval = setInterval(async () => {
      switch (this.config.agentType) {
        case 'network_monitor':
          await this.monitorNetwork();
          break;
        case 'ids':
          await this.performIDSChecks();
          break;
        case 'patch_management':
          await this.checkForVulnerabilities();
          break;
        case 'incident_response':
          await this.checkForIncidents();
          break;
        case 'siem':
          await this.correlateLogs();
          break;
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * Stop monitoring operations
   */
  private stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
  }

  /**
   * Network monitoring operations
   */
  private async monitorNetwork() {
    // Simulate network traffic analysis
    const anomalies = this.detectNetworkAnomalies();
    
    for (const anomaly of anomalies) {
      this.suspiciousEvents.push(anomaly);
      
      this.sendEvent('anomaly_detected', 'medium', {
        type: 'network',
        description: anomaly.description,
        source_ip: anomaly.source_ip,
        destination: anomaly.destination,
        severity: anomaly.severity
      });

      // If high severity, generate alert
      if (anomaly.severity === 'high') {
        await this.generateAlert(anomaly);
      }
    }
  }

  /**
   * IDS checks
   */
  private async performIDSChecks() {
    // Simulate IDS signature matching
    const threats = this.detectThreats();
    
    for (const threat of threats) {
      console.log(`🚨 [BLUE TEAM] Threat detected: ${threat.type}`);
      
      this.sendEvent('attack_detected', 'high', {
        threat_type: threat.type,
        source: threat.source,
        target: threat.target,
        signature: threat.signature
      });

      // Auto-response if enabled
      if (this.config.autoResponse) {
        await this.respondToThreat(threat);
      }
    }
  }

  /**
   * Check for vulnerabilities
   */
  private async checkForVulnerabilities() {
    // Simulate vulnerability scanning
    const vulns = this.scanForVulnerabilities();
    
    for (const vuln of vulns) {
      this.sendEvent('vulnerability_found', 'medium', vuln);

      // Auto-patch if critical
      if (vuln.severity === 'critical' && this.config.autoResponse) {
        await this.patchVulnerability(vuln);
      }
    }
  }

  /**
   * Check for incidents
   */
  private async checkForIncidents() {
    // Check suspicious events for potential incidents
    if (this.suspiciousEvents.length >= 3) {
      const incident = this.createIncident();
      
      this.sendEvent('incident_created', 'high', {
        incident_id: incident.id,
        incident_type: incident.type,
        affected_systems: incident.affected_systems,
        severity: incident.severity
      });

      // Initiate response
      await this.respondToIncident(incident);
    }
  }

  /**
   * Correlate logs (SIEM)
   */
  private async correlateLogs() {
    // Simulate log correlation
    const correlations = this.performLogCorrelation();
    
    for (const correlation of correlations) {
      if (correlation.confidence > 0.8) {
        this.sendEvent('threat_identified', 'high', {
          threat_type: correlation.threat_type,
          confidence: correlation.confidence,
          indicators: correlation.indicators
        });
      }
    }
  }

  /**
   * Handle attack alert from orchestrator
   */
  private async handleAttackAlert(message: any) {
    const attackId = message.attack_id;
    
    console.log(`🔍 [BLUE TEAM] Investigating attack ${attackId}: ${message.attack_type}`);

    // Simulate detection time (1-10 seconds)
    const detectionDelay = Math.floor(Math.random() * 10000) + 1000;
    await this.sleep(detectionDelay);

    // Detect the attack
    const detected = Math.random() > 0.2; // 80% detection rate

    if (detected) {
      console.log(`✅ [BLUE TEAM] Attack ${attackId} detected!`);
      
      // Send detection notification
      this.send({
        type: 'detection',
        attack_id: attackId,
        agent_id: this.agentId,
        detection_method: this.config.agentType,
        timestamp: new Date().toISOString()
      });

      // Store detection
      this.detectedAttacks.set(attackId, {
        attack_type: message.attack_type,
        target: message.target,
        detected_at: new Date(),
        detection_delay: detectionDelay
      });

      // Perform defensive action
      if (this.config.autoResponse) {
        await this.takeDefensiveAction(attackId, message);
      }
    } else {
      console.log(`❌ [BLUE TEAM] Failed to detect attack ${attackId}`);
    }
  }

  /**
   * Take defensive action
   */
  private async takeDefensiveAction(attackId: string, attackInfo: any) {
    await this.sleep(2000); // Simulate response time

    const actions = [
      'Block source IP',
      'Enable WAF rule',
      'Isolate affected system',
      'Kill suspicious process',
      'Update firewall rules'
    ];

    const action = actions[Math.floor(Math.random() * actions.length)];
    const effectiveness = Math.floor(Math.random() * 40) + 60; // 60-100%

    console.log(`🛡️ [BLUE TEAM] Taking defensive action: ${action}`);

    this.send({
      type: 'defense_action',
      attack_id: attackId,
      defense_type: this.config.agentType,
      action,
      effectiveness,
      agent_id: this.agentId,
      timestamp: new Date().toISOString(),
      data: {
        attack_type: attackInfo.attack_type,
        target: attackInfo.target
      }
    });
  }

  /**
   * Respond to threat
   */
  private async respondToThreat(threat: any) {
    const actions = ['block_ip', 'quarantine', 'kill_process', 'isolate_system'];
    const action = actions[Math.floor(Math.random() * actions.length)];

    console.log(`🛡️ [BLUE TEAM] Responding to threat with: ${action}`);

    this.send({
      type: 'defense_action',
      defense_type: action,
      action: `Auto-response: ${action}`,
      effectiveness: 85,
      agent_id: this.agentId,
      timestamp: new Date().toISOString(),
      data: {
        threat_type: threat.type,
        source: threat.source
      }
    });
  }

  /**
   * Patch vulnerability
   */
  private async patchVulnerability(vuln: any) {
    console.log(`🔧 [BLUE TEAM] Patching vulnerability: ${vuln.cve}`);

    await this.sleep(5000);

    this.sendEvent('vulnerability_patched', 'info', {
      cve: vuln.cve,
      system: vuln.target,
      patch_method: 'automated',
      success: true
    });
  }

  /**
   * Respond to incident
   */
  private async respondToIncident(incident: any) {
    console.log(`🚨 [BLUE TEAM] Responding to incident: ${incident.type}`);

    // Containment
    await this.sleep(3000);
    this.sendEvent('containment_action', 'high', {
      incident_id: incident.id,
      action: 'Network segmentation applied',
      affected_systems: incident.affected_systems
    });

    // Eradication
    await this.sleep(5000);
    this.sendEvent('eradication_completed', 'medium', {
      incident_id: incident.id,
      threats_removed: incident.affected_systems.length
    });

    // Recovery
    await this.sleep(3000);
    this.sendEvent('recovery_completed', 'info', {
      incident_id: incident.id,
      systems_restored: incident.affected_systems.length
    });

    // Clear suspicious events
    this.suspiciousEvents = [];
  }

  /**
   * Generate alert
   */
  private async generateAlert(anomaly: any) {
    this.sendEvent('alert_generated', 'high', {
      alert_type: 'network_anomaly',
      description: anomaly.description,
      recommended_action: 'Investigate and block if malicious'
    });
  }

  /**
   * Execute task from orchestrator
   */
  private async executeTask(task: any) {
    console.log(`🎯 [BLUE TEAM] Executing task: ${task.task_type}`);
    
    this.sendEvent('task_started', 'info', {
      task_id: task.task_id,
      task_type: task.task_type
    });

    await this.sleep(5000);

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
    }, 30000);
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
    
    console.log(`🔄 [BLUE TEAM] Attempting to reconnect...`);
    try {
      await this.connect();
    } catch (error) {
      console.error(`❌ [BLUE TEAM] Reconnection failed:`, error);
    }
  }

  /**
   * Shutdown agent
   */
  public shutdown() {
    console.log(`🛑 [BLUE TEAM] Shutting down agent...`);
    this.stopHeartbeat();
    this.stopMonitoring();
    if (this.ws) {
      this.ws.close();
    }
  }

  // Simulation helpers

  private detectNetworkAnomalies() {
    const anomalies = [];
    
    if (Math.random() > 0.7) {
      anomalies.push({
        description: 'Unusual outbound traffic detected',
        source_ip: this.randomIP(),
        destination: 'external',
        severity: 'high'
      });
    }
    
    if (Math.random() > 0.8) {
      anomalies.push({
        description: 'Port scan detected',
        source_ip: this.randomIP(),
        destination: this.config.protectedNetworks[0],
        severity: 'medium'
      });
    }
    
    return anomalies;
  }

  private detectThreats() {
    const threats = [];
    
    if (Math.random() > 0.6) {
      threats.push({
        type: 'SQL Injection attempt',
        source: this.randomIP(),
        target: 'database.internal',
        signature: 'SQLI-001'
      });
    }
    
    if (Math.random() > 0.7) {
      threats.push({
        type: 'Malware execution detected',
        source: 'workstation-42',
        target: 'internal',
        signature: 'MAL-2024-001'
      });
    }
    
    return threats;
  }

  private scanForVulnerabilities() {
    const vulns = [];
    
    if (Math.random() > 0.85) {
      vulns.push({
        cve: 'CVE-2024-' + Math.floor(Math.random() * 9999),
        severity: 'high',
        target: 'server-' + Math.floor(Math.random() * 10),
        description: 'Unpatched service vulnerability'
      });
    }
    
    return vulns;
  }

  private createIncident() {
    return {
      id: uuidv4(),
      type: 'Multi-stage attack',
      affected_systems: ['web-server-1', 'database-1', 'api-server-1'],
      severity: 'critical'
    };
  }

  private performLogCorrelation() {
    const correlations = [];
    
    if (Math.random() > 0.7) {
      correlations.push({
        threat_type: 'Credential stuffing attack',
        confidence: 0.85,
        indicators: ['multiple_failed_logins', 'source_ip_match', 'timing_pattern']
      });
    }
    
    return correlations;
  }

  private randomIP(): string {
    return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Example usage
if (require.main === module) {
  const agent = new BlueTeamAgent({
    orchestratorUrl: process.env.ORCHESTRATOR_URL || 'ws://orchestrator.internal:8080/blue-team',
    agentToken: process.env.AGENT_TOKEN || 'blue-team-secret',
    agentType: (process.env.AGENT_TYPE as any) || 'network_monitor',
    protectedNetworks: (process.env.PROTECTED_NETWORKS || '10.0.0.0/8').split(','),
    autoResponse: process.env.AUTO_RESPONSE === 'true'
  });

  agent.connect().catch(console.error);

  // Graceful shutdown
  process.on('SIGINT', () => {
    agent.shutdown();
    process.exit(0);
  });
}
