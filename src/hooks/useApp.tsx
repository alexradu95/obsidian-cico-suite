import { useContext } from 'react';
import { AppContext, AppContextType } from '../context/AppContext';

/**
 * Custom React hook for accessing the Obsidian app and plugin instances.
 * Must be used within an AppContext.Provider component.
 *
 * @hook
 * @returns {AppContextType} Object containing app and plugin instances
 * @throws {Error} If used outside of AppContext.Provider
 * @example
 * const { app, plugin } = useApp();
 * const activeFile = app.workspace.getActiveFile();
 */
export const useApp = (): AppContextType => {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error('useApp must be used within AppContext.Provider');
	}
	return context;
};
