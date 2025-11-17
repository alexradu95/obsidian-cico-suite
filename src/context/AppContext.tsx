import { createContext } from 'react';
import { App } from 'obsidian';
import DailyAIAssistantPlugin from '../../main';

export interface AppContextType {
	app: App;
	plugin: DailyAIAssistantPlugin;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
