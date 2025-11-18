import { createContext } from 'react';
import { App } from 'obsidian';
import type DailyAIAssistantPlugin from '../main';

/**
 * Type definition for the AppContext value.
 * Provides access to Obsidian app and plugin instances throughout React components.
 *
 * @interface AppContextType
 * @property {App} app - The Obsidian app instance
 * @property {DailyAIAssistantPlugin} plugin - The Daily AI Assistant plugin instance
 */
export interface AppContextType {
	app: App;
	plugin: DailyAIAssistantPlugin;
}

/**
 * React Context for sharing Obsidian app and plugin instances.
 * Allows React components to access Obsidian functionality through the useApp hook.
 *
 * @const {React.Context<AppContextType | undefined>}
 * @example
 * // Providing context
 * <AppContext.Provider value={{ app, plugin }}>
 *   <AIAssistantView />
 * </AppContext.Provider>
 *
 * // Consuming context via useApp hook
 * const { app, plugin } = useApp();
 */
export const AppContext = createContext<AppContextType | undefined>(undefined);
