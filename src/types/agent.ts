import type { Message, PersonalityPreset } from './index';

/**
 * Defines the role/purpose of an agent in the multi-agent system
 */
export enum AgentRole {
  GENERAL = 'general',
  SPECIALIST = 'specialist',
  COORDINATOR = 'coordinator'
}

/**
 * Represents an AI agent with its configuration and metadata
 */
export interface Agent {
  /** Unique identifier for the agent */
  id: string;
  /** Human-readable name for the agent */
  name: string;
  /** The role this agent plays in the system */
  role: AgentRole;
  /** Personality preset that controls communication style */
  personality: PersonalityPreset;
  /** System prompt that defines the agent's behavior */
  systemPrompt: string;
  /** Whether this agent is currently active */
  isActive: boolean;
  /** When this agent was created */
  createdAt: Date;
  /** When this agent was last active */
  lastActiveAt: Date;
}

/**
 * Message that includes agent metadata for multi-agent conversations
 */
export interface AgentMessage extends Message {
  /** ID of the agent that sent or should receive this message */
  agentId: string;
  /** Unique message identifier */
  id: string;
  /** When this message was created */
  timestamp: Date;
  /** Optional target agent ID for agent-to-agent messages */
  targetAgentId?: string;
}