
import axios from 'axios';
import { CONFIG } from '../Config';

type LogLevel = 'INFO' | 'ERROR' | 'WARN';

const LoggerService = {
    log: async (level: LogLevel, message: string, details?: any, source?: string) => {
        // Always log to console for development visibility
        if (level === 'ERROR') {
            console.error(`[${source}] ${message}`, details);
        } else if (level === 'WARN') {
            console.warn(`[${source}] ${message}`, details);
        } else {
            console.log(`[${source}] ${message}`, details);
        }

        try {
            await axios.post(`${CONFIG.API_URL}/api/logs`, {
                level,
                message,
                details,
                source: source || 'App'
            });
        } catch (error) {
            // Fallback if logging fails - just print to console
            console.error('Failed to send log to server:', error);
        }
    },

    info: (message: string, details?: any, source?: string) => {
        LoggerService.log('INFO', message, details, source);
    },

    error: (message: string, details?: any, source?: string) => {
        LoggerService.log('ERROR', message, details, source);
    },

    warn: (message: string, details?: any, source?: string) => {
        LoggerService.log('WARN', message, details, source);
    }
};

export default LoggerService;
