import { App, TFile, TFolder, normalizePath } from 'obsidian';
import { JSONCanvasData, JSONCanvasTextNode, JSONCanvasNode, JSONCanvasEdge, CanvasColor } from '../types/jsoncanvas';
import { Agent } from '../types/agent';

/**
 * Service for managing JSON Canvas files for multi-agent workflows
 */
export class CanvasService {
	constructor(private app: App) {}

	/**
	 * Creates or opens an agent canvas file
	 * @param filePath Path to the canvas file (without .canvas extension)
	 * @returns The canvas file
	 */
	async createOrOpenAgentCanvas(filePath: string): Promise<TFile> {
		const normalizedPath = normalizePath(filePath.endsWith('.canvas') ? filePath : `${filePath}.canvas`);

		const existingFile = this.app.vault.getAbstractFileByPath(normalizedPath);

		if (existingFile instanceof TFile) {
			return existingFile;
		}

		// Create the file with empty canvas data
		const emptyCanvas: JSONCanvasData = {
			nodes: [],
			edges: []
		};

		const folder = normalizedPath.substring(0, normalizedPath.lastIndexOf('/'));
		if (folder) {
			await this.ensureFolderExists(folder);
		}

		const file = await this.app.vault.create(normalizedPath, JSON.stringify(emptyCanvas, null, '\t'));
		return file;
	}

	/**
	 * Ensures a folder exists, creating it if necessary
	 */
	private async ensureFolderExists(folderPath: string): Promise<void> {
		const normalizedPath = normalizePath(folderPath);
		const exists = this.app.vault.getAbstractFileByPath(normalizedPath);

		if (!exists) {
			await this.app.vault.createFolder(normalizedPath);
		}
	}

	/**
	 * Reads canvas data from a file
	 */
	async readCanvas(file: TFile): Promise<JSONCanvasData> {
		const content = await this.app.vault.read(file);

		try {
			const data = JSON.parse(content) as JSONCanvasData;
			return {
				nodes: data.nodes || [],
				edges: data.edges || []
			};
		} catch (error) {
			console.error('Error parsing canvas file:', error);
			return { nodes: [], edges: [] };
		}
	}

	/**
	 * Writes canvas data to a file
	 */
	async writeCanvas(file: TFile, data: JSONCanvasData): Promise<void> {
		const content = JSON.stringify(data, null, '\t');
		await this.app.vault.modify(file, content);
	}

	/**
	 * Adds an agent node to the canvas
	 */
	async addAgentNode(file: TFile, agent: Agent, position?: { x: number; y: number }): Promise<void> {
		const data = await this.readCanvas(file);

		const agentNode: JSONCanvasTextNode = {
			id: agent.id,
			type: 'text',
			text: `# ${agent.name}\n\n**Role:** ${agent.role}\n\n**System Prompt:**\n${agent.systemPrompt}`,
			x: position?.x ?? 100 + (data.nodes?.length ?? 0) * 250,
			y: position?.y ?? 100,
			width: 300,
			height: 200,
			color: this.getAgentColor(agent.role)
		};

		data.nodes = [...(data.nodes || []), agentNode];
		await this.writeCanvas(file, data);
	}

	/**
	 * Updates an agent node in the canvas
	 */
	async updateAgentNode(file: TFile, agent: Agent): Promise<void> {
		const data = await this.readCanvas(file);

		const nodeIndex = data.nodes?.findIndex(n => n.id === agent.id) ?? -1;

		if (nodeIndex === -1) {
			await this.addAgentNode(file, agent);
			return;
		}

		const existingNode = data.nodes![nodeIndex];
		const updatedNode: JSONCanvasTextNode = {
			...existingNode as JSONCanvasTextNode,
			type: 'text',
			text: `# ${agent.name}\n\n**Role:** ${agent.role}\n\n**System Prompt:**\n${agent.systemPrompt}`,
			color: this.getAgentColor(agent.role)
		};

		data.nodes![nodeIndex] = updatedNode;
		await this.writeCanvas(file, data);
	}

	/**
	 * Removes an agent node from the canvas
	 */
	async removeAgentNode(file: TFile, agentId: string): Promise<void> {
		const data = await this.readCanvas(file);

		data.nodes = data.nodes?.filter(n => n.id !== agentId) || [];
		data.edges = data.edges?.filter(e => e.fromNode !== agentId && e.toNode !== agentId) || [];

		await this.writeCanvas(file, data);
	}

	/**
	 * Adds a connection between two agents
	 */
	async addConnection(file: TFile, fromAgentId: string, toAgentId: string, label?: string): Promise<void> {
		const data = await this.readCanvas(file);

		const connection: JSONCanvasEdge = {
			id: `edge-${fromAgentId}-${toAgentId}`,
			fromNode: fromAgentId,
			toNode: toAgentId,
			label,
			color: '4'
		};

		data.edges = [...(data.edges || []), connection];
		await this.writeCanvas(file, data);
	}

	/**
	 * Adds the default assistant node to the canvas
	 */
	async addDefaultAssistant(file: TFile, position?: { x: number; y: number }): Promise<void> {
		const defaultAssistant: JSONCanvasTextNode = {
			id: 'default-assistant',
			type: 'text',
			text: `# Default Assistant\n\n**Role:** general\n\n**System Prompt:**\nEști un asistent de jurnal prietenos și gânditor. Vorbește în limba română.\nOferă observații sau întrebări concise (2-3 propoziții). Fii cald dar nu prea verbos.\nConcentrează-te pe: sport/sală (ce ai făcut, cum te-ai simțit), dezvoltare personală (ce ai învățat/lucrat azi),\nrelaxare (cum te destresezi), și pattern-uri între ziua curentă și zilele anterioare.`,
			x: position?.x ?? 100,
			y: position?.y ?? 100,
			width: 400,
			height: 250,
			color: '4' // green
		};

		const data = await this.readCanvas(file);

		// Check if default assistant already exists
		const existingIndex = data.nodes?.findIndex(n => n.id === 'default-assistant') ?? -1;

		if (existingIndex >= 0) {
			// Update existing node
			data.nodes![existingIndex] = defaultAssistant;
		} else {
			// Add new node
			data.nodes = [...(data.nodes || []), defaultAssistant];
		}

		await this.writeCanvas(file, data);
	}

	/**
	 * Adds an AI processing node that can take inputs and produce outputs
	 */
	async addAIProcessingNode(
		file: TFile,
		nodeId: string,
		title: string,
		instruction: string,
		position?: { x: number; y: number }
	): Promise<void> {
		const data = await this.readCanvas(file);

		const processingNode: JSONCanvasTextNode = {
			id: nodeId,
			type: 'text',
			text: `# 🤖 ${title}\n\n**AI Processing Node**\n\n${instruction}\n\n---\n\n*Connect input nodes to this node, then connect this node to output nodes*`,
			x: position?.x ?? 300,
			y: position?.y ?? 100,
			width: 350,
			height: 200,
			color: '6' // purple for AI processing nodes
		};

		data.nodes = [...(data.nodes || []), processingNode];
		await this.writeCanvas(file, data);
	}

	/**
	 * Adds an output node for AI processing results
	 */
	async addOutputNode(
		file: TFile,
		nodeId: string,
		title: string,
		position?: { x: number; y: number }
	): Promise<void> {
		const data = await this.readCanvas(file);

		const outputNode: JSONCanvasTextNode = {
			id: nodeId,
			type: 'text',
			text: `# ${title}\n\n*Waiting for AI processing...*`,
			x: position?.x ?? 600,
			y: position?.y ?? 100,
			width: 350,
			height: 300,
			color: '3' // yellow for output nodes
		};

		data.nodes = [...(data.nodes || []), outputNode];
		await this.writeCanvas(file, data);
	}

	/**
	 * Updates an output node with processed content
	 */
	async updateOutputNode(
		file: TFile,
		nodeId: string,
		content: string
	): Promise<void> {
		const data = await this.readCanvas(file);
		const nodeIndex = data.nodes?.findIndex(n => n.id === nodeId) ?? -1;

		if (nodeIndex === -1) {
			throw new Error(`Output node ${nodeId} not found`);
		}

		const existingNode = data.nodes![nodeIndex] as JSONCanvasTextNode;
		const updatedNode: JSONCanvasTextNode = {
			...existingNode,
			text: content
		};

		data.nodes![nodeIndex] = updatedNode;
		await this.writeCanvas(file, data);
	}

	/**
	 * Gets the content of a node by ID
	 */
	async getNodeContent(file: TFile, nodeId: string): Promise<string | null> {
		const data = await this.readCanvas(file);
		const node = data.nodes?.find(n => n.id === nodeId);

		if (!node || node.type !== 'text') {
			return null;
		}

		return (node as JSONCanvasTextNode).text;
	}

	/**
	 * Gets all input nodes connected to a specific node
	 */
	async getInputNodes(file: TFile, nodeId: string): Promise<JSONCanvasNode[]> {
		const data = await this.readCanvas(file);

		// Find all edges that point TO this node
		const inputEdges = data.edges?.filter(e => e.toNode === nodeId) || [];

		// Get the source nodes
		const inputNodes = inputEdges
			.map(edge => data.nodes?.find(n => n.id === edge.fromNode))
			.filter((node): node is JSONCanvasNode => node !== undefined);

		return inputNodes;
	}

	/**
	 * Gets all output nodes connected from a specific node
	 */
	async getOutputNodes(file: TFile, nodeId: string): Promise<JSONCanvasNode[]> {
		const data = await this.readCanvas(file);

		// Find all edges that point FROM this node
		const outputEdges = data.edges?.filter(e => e.fromNode === nodeId) || [];

		// Get the target nodes
		const outputNodes = outputEdges
			.map(edge => data.nodes?.find(n => n.id === edge.toNode))
			.filter((node): node is JSONCanvasNode => node !== undefined);

		return outputNodes;
	}

	/**
	 * Gets a color for an agent based on its role
	 */
	private getAgentColor(role: string): CanvasColor {
		const lowerRole = role.toLowerCase();

		if (lowerRole.includes('coordinator') || lowerRole.includes('manager')) return '1'; // red
		if (lowerRole.includes('research') || lowerRole.includes('analyst')) return '5'; // cyan
		if (lowerRole.includes('writer') || lowerRole.includes('editor')) return '3'; // yellow
		if (lowerRole.includes('critic') || lowerRole.includes('reviewer')) return '2'; // orange
		if (lowerRole.includes('specialist') || lowerRole.includes('expert')) return '6'; // purple

		return '4'; // green as default
	}

	/**
	 * Opens a canvas file in Obsidian
	 */
	async openCanvas(file: TFile): Promise<void> {
		const leaf = this.app.workspace.getLeaf(false);
		await leaf.openFile(file);
	}
}
