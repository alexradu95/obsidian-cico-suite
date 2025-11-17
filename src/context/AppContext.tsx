import { createContext } from 'react';
import { App } from 'obsidian';
import type DailyAIAssistantPlugin from '../main';

export interface AppContextType {
	app: App;
	plugin: DailyAIAssistantPlugin;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
