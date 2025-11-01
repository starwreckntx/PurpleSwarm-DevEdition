/**
 * Enhanced CyberSwarm Orchestrator
 * Coordinates Red Team (external) and Blue Team (internal) operations
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';

// Types
export type Team = 'red' | 'blue' | 'system';
export type AgentStatus = 'idle' | 'busy' | 'error' | 'offline';
export type AgentLocation = 'external' | 'internal';
export type AttackStatus = 'initiated' | 'in_progress' | 'successful' | 'blocked' | 'failed';

export interface AgentConfig {
  id: string;
  name: string;
  team: Team;
  type: string;
  location: AgentLocation;
  capabilities: string[];
  token: string;
}

export interface Agent extends AgentConfig {
  status: AgentStatus;
  lastSeen: Date;
  connection?: WebSocket;
  stats: {
    tasksCompleted: number;
    tasksF: number;
    points: number;
  };
}

export interface CyberEvent {
  id: string;
  type: string;
  agentId: string;
  team: Team;
  timestamp: Date;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  data: any;
  scored: boolean;
  points: number;
}

export interface Attack {
  id: string;
  attackType: string;
  redAgentId: string;
  targetSystem: string;
  status: AttackStatus;
  timestamp: Date;
  detectionTime?: Date;
  blueAgentId?: string;
  ttdSeconds?: number; // Time to detect
  data: any;
}

export interface Defense {
  id: string;
  defenseType: string;
  blueAgentId: string;
  attackId?: string;
  actionTaken: string;
  effectiveness: number; // 0-100
  timestamp: Date;
  data: any;
}

export interface ScoringEvent {
  id: string;
  team: Team;
  eventId: string;
  points: number;
  reason: string;
  timestamp: Date;
}

/**
 * Red/Blue Team Orchestrator
 * Main coordination engine for cyber exercises
 */
export class RedBlueOrchestrator extends EventEmitter {
  private agents: Map<string, Agent> = new Map();
  private events: CyberEvent[] = [];
  private attacks: Map<string, Attack> = new Map();
  private defenses: Map<string, Defense> = new Map();
  private scoringEvents: ScoringEvent[] = [];
  
  private redTeamScore = 0;
  private blueTeamScore = 0;
  
  // WebSocket servers
  private redTeamServer?: WebSocket.Server;
  private blueTeamServer?: WebSocket.Server;
  
  // Rate limiting
  private attackRateLimiter: Map<string, number[]> = new Map();
  private maxAttacksPerMinute = 10;
  
  // Safety controls
  private isPaused = false;
  private emergencyStop = false;

  constructor(
    private redTeamPort: number = 443,
    private blueTeamPort: number = 8080,
    private redTeamToken: string,
    private blueTeamToken: string
  ) {
    super();
    this.initializeServers();
  }

  /**
   * Initialize WebSocket servers for both teams
   */
  private initializeServers() {
    // Red Team Server (External - Port 443 HTTPS/WSS)
    this.redTeamServer = new WebSocket.Server({ 
      port: this.redTeamPort,
      verifyClient: (info, callback) => {
        // Verify Red Team token
        const token = info.req.headers['authorization']?.replace('Bearer ', '');
        callback(token === this.redTeamToken);
      }
    });

    this.redTeamServer.on('connection', (ws, req) => {
      console.log('[RED TEAM] New agent connected from:', req.socket.remoteAddress);
      this.handleRedTeamConnection(ws, req);
    });

    // Blue Team Server (Internal - Port 8080 HTTP/WS)
    this.blueTeamServer = new WebSocket.Server({ 
      port: this.blueTeamPort,
      verifyClient: (info, callback) => {
        // Verify Blue Team token
        const token = info.req.headers['authorization']?.replace('Bearer ', '');
        callback(token === this.blueTeamToken);
      }
    });

    this.blueTeamServer.on('connection', (ws, req) => {
      console.log('[BLUE TEAM] New agent connected from:', req.socket.remoteAddress);
      this.handleBlueTeamConnection(ws, req);
    });

    console.log(`🔴 Red Team Server listening on port ${this.redTeamPort}`);
    console.log(`🔵 Blue Team Server listening on port ${this.blueTeamPort}`);
  }

  /**
   * Handle Red Team agent connection
   */
  private handleRedTeamConnection(ws: WebSocket, req: any) {
    let agentId: string | null = null;

    ws.on('message', async (data: string) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case 'auth':
            agentId = await this.authenticateAgent(message, 'red', ws, 'external');
            break;
          
          case 'event':
            if (agentId) {
              await this.handleRedTeamEvent(agentId, message);
            }
            break;
          
          case 'attack_initiated':
            if (agentId && this.canAttack(agentId)) {
              await this.handleAttackInitiated(agentId, message);
            } else {
              ws.send(JSON.stringify({ 
                type: 'error', 
                message: 'Rate limit exceeded' 
              }));
            }
            break;
          
          case 'heartbeat':
            if (agentId) {
              this.updateAgentHeartbeat(agentId);
            }
            break;
        }
      } catch (error) {
        console.error('[RED TEAM] Message handling error:', error);
      }
    });

    ws.on('close', () => {
      if (agentId) {
        this.handleAgentDisconnect(agentId);
      }
    });
  }

  /**
   * Handle Blue Team agent connection
   */
  private handleBlueTeamConnection(ws: WebSocket, req: any) {
    let agentId: string | null = null;

    ws.on('message', async (data: string) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case 'auth':
            agentId = await this.authenticateAgent(message, 'blue', ws, 'internal');
            break;
          
          case 'event':
            if (agentId) {
              await this.handleBlueTeamEvent(agentId, message);
            }
            break;
          
          case 'detection':
            if (agentId) {
              await this.handleAttackDetection(agentId, message);
            }
            break;
          
          case 'defense_action':
            if (agentId) {
              await this.handleDefenseAction(agentId, message);
            }
            break;
          
          case 'heartbeat':
            if (agentId) {
              this.updateAgentHeartbeat(agentId);
            }
            break;
        }
      } catch (error) {
        console.error('[BLUE TEAM] Message handling error:', error);
      }
    });

    ws.on('close', () => {
      if (agentId) {
        this.handleAgentDisconnect(agentId);
      }
    });
  }

  /**
   * Authenticate and register an agent
   */
  private async authenticateAgent(
    message: any, 
    team: Team, 
    ws: WebSocket,
    location: AgentLocation
  ): Promise<string> {
    const agentId = message.agent_id || uuidv4();
    
    const agent: Agent = {
      id: agentId,
      name: message.agent_name || `${team}-agent-${agentId.slice(0, 8)}`,
      team,
      type: message.agent_type,
      location,
      capabilities: message.capabilities || [],
      token: message.token,
      status: 'idle',
      lastSeen: new Date(),
      connection: ws,
      stats: {
        tasksCompleted: 0,
        tasksF: 0,
        points: 0
      }
    };

    this.agents.set(agentId, agent);
    
    ws.send(JSON.stringify({
      type: 'auth_success',
      agent_id: agentId,
      team,
      timestamp: new Date().toISOString()
    }));

    this.emit('agent_connected', agent);
    this.logEvent('agent_connected', agentId, team, 'info', { 
      agent_name: agent.name,
      location 
    });

    console.log(`✅ [${team.toUpperCase()}] Agent authenticated: ${agent.name} (${agentId})`);
    
    return agentId;
  }

  /**
   * Handle Red Team events (attacks, reconnaissance, etc.)
   */
  private async handleRedTeamEvent(agentId: string, message: any) {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    const event = this.logEvent(
      message.event_type,
      agentId,
      'red',
      message.severity || 'info',
      message.data
    );

    // Auto-scoring for certain events
    switch (message.event_type) {
      case 'vulnerability_found':
        await this.awardPoints('red', event.id, 10, 'Vulnerability discovered');
        break;
      case 'exploit_successful':
        await this.awardPoints('red', event.id, 50, 'Successful exploitation');
        break;
      case 'privilege_escalated':
        await this.awardPoints('red', event.id, 75, 'Privilege escalation');
        break;
      case 'data_exfiltrated':
        await this.awardPoints('red', event.id, 100, 'Data exfiltration');
        break;
      case 'persistence_established':
        await this.awardPoints('red', event.id, 150, 'Persistence established');
        break;
    }

    this.emit('red_team_event', event);
  }

  /**
   * Handle Blue Team events (detection, defense, mitigation)
   */
  private async handleBlueTeamEvent(agentId: string, message: any) {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    const event = this.logEvent(
      message.event_type,
      agentId,
      'blue',
      message.severity || 'info',
      message.data
    );

    // Auto-scoring for certain events
    switch (message.event_type) {
      case 'attack_detected':
        await this.awardPoints('blue', event.id, 10, 'Attack detected');
        break;
      case 'attack_blocked':
        await this.awardPoints('blue', event.id, 25, 'Attack blocked');
        break;
      case 'vulnerability_patched':
        await this.awardPoints('blue', event.id, 50, 'Vulnerability patched');
        break;
      case 'incident_contained':
        await this.awardPoints('blue', event.id, 40, 'Incident contained');
        break;
      case 'recovery_completed':
        await this.awardPoints('blue', event.id, 30, 'Recovery completed');
        break;
    }

    this.emit('blue_team_event', event);
  }

  /**
   * Handle attack initiation from Red Team
   */
  private async handleAttackInitiated(agentId: string, message: any) {
    const attackId = uuidv4();
    
    const attack: Attack = {
      id: attackId,
      attackType: message.attack_type,
      redAgentId: agentId,
      targetSystem: message.target,
      status: 'initiated',
      timestamp: new Date(),
      data: message.data || {}
    };

    this.attacks.set(attackId, attack);
    
    // Notify Blue Team
    this.broadcastToTeam('blue', {
      type: 'attack_alert',
      attack_id: attackId,
      attack_type: attack.attackType,
      target: attack.targetSystem,
      timestamp: attack.timestamp.toISOString()
    });

    this.emit('attack_initiated', attack);
    
    console.log(`🔴 [ATTACK] ${attack.attackType} initiated against ${attack.targetSystem}`);
  }

  /**
   * Handle attack detection from Blue Team
   */
  private async handleAttackDetection(agentId: string, message: any) {
    const attackId = message.attack_id;
    const attack = this.attacks.get(attackId);
    
    if (attack) {
      const detectionTime = new Date();
      const ttd = Math.floor((detectionTime.getTime() - attack.timestamp.getTime()) / 1000);
      
      attack.detectionTime = detectionTime;
      attack.blueAgentId = agentId;
      attack.ttdSeconds = ttd;
      attack.status = 'blocked';
      
      this.attacks.set(attackId, attack);
      
      // Award points based on detection speed
      let points = 10;
      if (ttd < 60) { // Less than 1 minute
        points += 20; // Speed bonus
      }
      
      const event = this.logEvent(
        'attack_detected',
        agentId,
        'blue',
        'high',
        { attack_id: attackId, ttd_seconds: ttd }
      );
      
      await this.awardPoints('blue', event.id, points, `Attack detected in ${ttd}s`);
      
      // Penalize Red Team for quick detection
      if (ttd < 60) {
        const redEvent = this.logEvent(
          'attack_detected_quickly',
          attack.redAgentId,
          'red',
          'low',
          { attack_id: attackId, ttd_seconds: ttd }
        );
        await this.awardPoints('red', redEvent.id, -10, 'Attack detected too quickly');
      }
      
      console.log(`🔵 [DETECTION] Attack ${attackId} detected in ${ttd}s by ${agentId}`);
      this.emit('attack_detected', { attack, ttd, agent_id: agentId });
    }
  }

  /**
   * Handle defense action from Blue Team
   */
  private async handleDefenseAction(agentId: string, message: any) {
    const defenseId = uuidv4();
    
    const defense: Defense = {
      id: defenseId,
      defenseType: message.defense_type,
      blueAgentId: agentId,
      attackId: message.attack_id,
      actionTaken: message.action,
      effectiveness: message.effectiveness || 100,
      timestamp: new Date(),
      data: message.data || {}
    };

    this.defenses.set(defenseId, defense);
    
    // Update attack status if linked
    if (defense.attackId) {
      const attack = this.attacks.get(defense.attackId);
      if (attack) {
        attack.status = defense.effectiveness >= 80 ? 'blocked' : 'in_progress';
        this.attacks.set(defense.attackId, attack);
      }
    }

    const event = this.logEvent(
      'defense_action',
      agentId,
      'blue',
      'medium',
      { defense_id: defenseId, action: defense.actionTaken }
    );

    // Award points based on effectiveness
    const points = Math.floor(defense.effectiveness / 4); // Max 25 points
    await this.awardPoints('blue', event.id, points, `Defense action: ${defense.actionTaken}`);

    this.emit('defense_action', defense);
    
    console.log(`🔵 [DEFENSE] ${defense.actionTaken} executed with ${defense.effectiveness}% effectiveness`);
  }

  /**
   * Rate limiting for Red Team attacks
   */
  private canAttack(agentId: string): boolean {
    if (this.isPaused || this.emergencyStop) {
      return false;
    }

    const now = Date.now();
    const attacks = this.attackRateLimiter.get(agentId) || [];
    
    // Remove attacks older than 1 minute
    const recentAttacks = attacks.filter(t => now - t < 60000);
    
    if (recentAttacks.length >= this.maxAttacksPerMinute) {
      console.log(`⚠️ [RATE LIMIT] Agent ${agentId} exceeded attack rate limit`);
      return false;
    }
    
    recentAttacks.push(now);
    this.attackRateLimiter.set(agentId, recentAttacks);
    return true;
  }

  /**
   * Award points to a team
   */
  private async awardPoints(team: Team, eventId: string, points: number, reason: string) {
    const scoringEvent: ScoringEvent = {
      id: uuidv4(),
      team,
      eventId,
      points,
      reason,
      timestamp: new Date()
    };

    this.scoringEvents.push(scoringEvent);

    if (team === 'red') {
      this.redTeamScore += points;
    } else if (team === 'blue') {
      this.blueTeamScore += points;
    }

    this.emit('scoring_event', scoringEvent);
    this.emit('score_updated', {
      red: this.redTeamScore,
      blue: this.blueTeamScore
    });

    console.log(`🎯 [SCORING] ${team.toUpperCase()} ${points > 0 ? '+' : ''}${points} points: ${reason}`);
  }

  /**
   * Log an event
   */
  private logEvent(
    type: string,
    agentId: string,
    team: Team,
    severity: CyberEvent['severity'],
    data: any
  ): CyberEvent {
    const event: CyberEvent = {
      id: uuidv4(),
      type,
      agentId,
      team,
      timestamp: new Date(),
      severity,
      data,
      scored: false,
      points: 0
    };

    this.events.push(event);
    this.emit('event_created', event);
    
    return event;
  }

  /**
   * Update agent heartbeat
   */
  private updateAgentHeartbeat(agentId: string) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.lastSeen = new Date();
      agent.status = 'idle';
      this.agents.set(agentId, agent);
    }
  }

  /**
   * Handle agent disconnect
   */
  private handleAgentDisconnect(agentId: string) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = 'offline';
      agent.connection = undefined;
      this.agents.set(agentId, agent);
      
      this.emit('agent_disconnected', agent);
      this.logEvent('agent_disconnected', agentId, agent.team, 'info', {});
      
      console.log(`❌ [${agent.team.toUpperCase()}] Agent disconnected: ${agent.name}`);
    }
  }

  /**
   * Broadcast message to a specific team
   */
  private broadcastToTeam(team: Team, message: any) {
    const teamAgents = Array.from(this.agents.values()).filter(a => a.team === team);
    
    for (const agent of teamAgents) {
      if (agent.connection && agent.connection.readyState === WebSocket.OPEN) {
        agent.connection.send(JSON.stringify(message));
      }
    }
  }

  /**
   * Emergency stop - halt all Red Team operations
   */
  public async emergencyStopRedTeam() {
    this.emergencyStop = true;
    
    this.broadcastToTeam('red', {
      type: 'emergency_stop',
      timestamp: new Date().toISOString(),
      message: 'Emergency stop activated - cease all operations'
    });

    // Close all Red Team connections
    const redAgents = Array.from(this.agents.values()).filter(a => a.team === 'red');
    for (const agent of redAgents) {
      if (agent.connection) {
        agent.connection.close();
      }
    }

    this.logEvent('emergency_stop', 'system', 'system', 'critical', {
      reason: 'Manual emergency stop'
    });

    console.log('🚨 [EMERGENCY] Red Team operations halted');
  }

  /**
   * Pause/Resume operations
   */
  public setPaused(paused: boolean) {
    this.isPaused = paused;
    
    if (paused) {
      this.broadcastToTeam('red', { type: 'pause' });
      this.broadcastToTeam('blue', { type: 'pause' });
      console.log('⏸️ Operations paused');
    } else {
      this.broadcastToTeam('red', { type: 'resume' });
      this.broadcastToTeam('blue', { type: 'resume' });
      console.log('▶️ Operations resumed');
    }
  }

  /**
   * Get current state
   */
  public getState() {
    return {
      agents: Array.from(this.agents.values()),
      events: this.events.slice(-100), // Last 100 events
      attacks: Array.from(this.attacks.values()),
      defenses: Array.from(this.defenses.values()),
      scores: {
        red: this.redTeamScore,
        blue: this.blueTeamScore
      },
      status: {
        isPaused: this.isPaused,
        emergencyStop: this.emergencyStop
      }
    };
  }

  /**
   * Get team statistics
   */
  public getTeamStats(team: Team) {
    const teamAgents = Array.from(this.agents.values()).filter(a => a.team === team);
    const teamEvents = this.events.filter(e => e.team === team);
    
    return {
      team,
      totalAgents: teamAgents.length,
      activeAgents: teamAgents.filter(a => a.status !== 'offline').length,
      totalEvents: teamEvents.length,
      score: team === 'red' ? this.redTeamScore : this.blueTeamScore,
      agents: teamAgents.map(a => ({
        id: a.id,
        name: a.name,
        type: a.type,
        status: a.status,
        stats: a.stats
      }))
    };
  }

  /**
   * Shutdown orchestrator
   */
  public async shutdown() {
    console.log('🛑 Shutting down orchestrator...');
    
    // Close all connections
    this.redTeamServer?.close();
    this.blueTeamServer?.close();
    
    // Clear intervals
    this.removeAllListeners();
    
    console.log('✅ Orchestrator shut down');
  }
}

// Export singleton instance
export const orchestrator = new RedBlueOrchestrator(
  parseInt(process.env.RED_TEAM_PORT || '443'),
  parseInt(process.env.BLUE_TEAM_PORT || '8080'),
  process.env.RED_TEAM_TOKEN || 'red-team-secret',
  process.env.BLUE_TEAM_TOKEN || 'blue-team-secret'
);
