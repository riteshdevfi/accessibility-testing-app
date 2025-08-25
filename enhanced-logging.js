#!/usr/bin/env node

// Enhanced Logging System for Pa11y Dashboard
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Enhanced logging functions
const logger = {
    info: (message, data = {}) => {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: 'INFO',
            message,
            data,
            requestId: data.requestId || 'unknown'
        };
        console.log(`[${logEntry.timestamp}] INFO: ${message}`, data);
        fs.appendFileSync(path.join(logsDir, 'app.log'), JSON.stringify(logEntry) + '\n');
    },
    
    error: (message, error = null, data = {}) => {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: 'ERROR',
            message,
            error: error ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : null,
            data,
            requestId: data.requestId || 'unknown'
        };
        console.error(`[${logEntry.timestamp}] ERROR: ${message}`, error);
        fs.appendFileSync(path.join(logsDir, 'app.log'), JSON.stringify(logEntry) + '\n');
    },
    
    debug: (message, data = {}) => {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: 'DEBUG',
            message,
            data,
            requestId: data.requestId || 'unknown'
        };
        console.log(`[${logEntry.timestamp}] DEBUG: ${message}`, data);
        fs.appendFileSync(path.join(logsDir, 'debug.log'), JSON.stringify(logEntry) + '\n');
    },
    
    objectId: (action, objectId, data = {}) => {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: 'OBJECTID',
            action,
            objectId,
            data,
            requestId: data.requestId || 'unknown'
        };
        console.log(`[${logEntry.timestamp}] OBJECTID: ${action} - ${objectId}`, data);
        fs.appendFileSync(path.join(logsDir, 'objectid.log'), JSON.stringify(logEntry) + '\n');
    }
};

module.exports = logger;
