#!/usr/bin/env node

// Log Analysis Script for Pa11y Dashboard
const fs = require('fs');
const path = require('path');

function analyzeLogs() {
    console.log('🔍 Pa11y Dashboard Log Analysis');
    console.log('================================');
    
    const logsDir = path.join(__dirname, 'logs');
    
    if (!fs.existsSync(logsDir)) {
        console.log('❌ No logs directory found. Run the application first to generate logs.');
        return;
    }
    
    const logFiles = {
        app: path.join(logsDir, 'app.log'),
        debug: path.join(logsDir, 'debug.log'),
        objectid: path.join(logsDir, 'objectid.log')
    };
    
    // Analyze ObjectID logs
    console.log('\n📊 ObjectID Analysis:');
    console.log('---------------------');
    
    if (fs.existsSync(logFiles.objectid)) {
        const objectIdLogs = fs.readFileSync(logFiles.objectid, 'utf8')
            .split('\n')
            .filter(line => line.trim())
            .map(line => {
                try {
                    return JSON.parse(line);
                } catch (e) {
                    return null;
                }
            })
            .filter(log => log !== null);
        
        const objectIdStats = {};
        objectIdLogs.forEach(log => {
            if (!objectIdStats[log.objectId]) {
                objectIdStats[log.objectId] = {
                    actions: [],
                    firstSeen: log.timestamp,
                    lastSeen: log.timestamp
                };
            }
            objectIdStats[log.objectId].actions.push(log.action);
            objectIdStats[log.objectId].lastSeen = log.timestamp;
        });
        
        console.log(`Total ObjectIDs tracked: ${Object.keys(objectIdStats).length}`);
        
        Object.entries(objectIdStats).forEach(([objectId, stats]) => {
            console.log(`\n🔸 ObjectID: ${objectId}`);
            console.log(`   First seen: ${stats.firstSeen}`);
            console.log(`   Last seen: ${stats.lastSeen}`);
            console.log(`   Actions: ${stats.actions.join(', ')}`);
        });
    } else {
        console.log('No ObjectID logs found');
    }
    
    // Analyze error logs
    console.log('\n❌ Error Analysis:');
    console.log('------------------');
    
    if (fs.existsSync(logFiles.app)) {
        const appLogs = fs.readFileSync(logFiles.app, 'utf8')
            .split('\n')
            .filter(line => line.trim())
            .map(line => {
                try {
                    return JSON.parse(line);
                } catch (e) {
                    return null;
                }
            })
            .filter(log => log !== null && log.level === 'ERROR');
        
        const errorStats = {};
        appLogs.forEach(log => {
            const errorType = log.message;
            if (!errorStats[errorType]) {
                errorStats[errorType] = {
                    count: 0,
                    examples: []
                };
            }
            errorStats[errorType].count++;
            if (errorStats[errorType].examples.length < 3) {
                errorStats[errorType].examples.push({
                    timestamp: log.timestamp,
                    requestId: log.requestId,
                    data: log.data
                });
            }
        });
        
        console.log(`Total errors: ${appLogs.length}`);
        
        Object.entries(errorStats).forEach(([errorType, stats]) => {
            console.log(`\n🔸 ${errorType}: ${stats.count} occurrences`);
            stats.examples.forEach(example => {
                console.log(`   - ${example.timestamp} (Request: ${example.requestId})`);
                if (example.data && example.data.objectId) {
                    console.log(`     ObjectID: ${example.data.objectId}`);
                }
            });
        });
    } else {
        console.log('No app logs found');
    }
    
    // Analyze recent activity
    console.log('\n📈 Recent Activity (last 10 minutes):');
    console.log('--------------------------------------');
    
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    
    if (fs.existsSync(logFiles.app)) {
        const recentLogs = fs.readFileSync(logFiles.app, 'utf8')
            .split('\n')
            .filter(line => line.trim())
            .map(line => {
                try {
                    return JSON.parse(line);
                } catch (e) {
                    return null;
                }
            })
            .filter(log => log !== null && log.timestamp >= tenMinutesAgo)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        recentLogs.forEach(log => {
            const time = new Date(log.timestamp).toLocaleTimeString();
            console.log(`[${time}] ${log.level}: ${log.message}`);
            if (log.data && log.data.objectId) {
                console.log(`  ObjectID: ${log.data.objectId}`);
            }
        });
    }
    
    // Check for specific patterns
    console.log('\n🔍 Pattern Analysis:');
    console.log('-------------------');
    
    if (fs.existsSync(logFiles.app)) {
        const allLogs = fs.readFileSync(logFiles.app, 'utf8');
        
        const patterns = {
            'ObjectID generation failed': (allLogs.match(/ObjectID generation failed/g) || []).length,
            'Invalid ObjectID format': (allLogs.match(/Invalid ObjectID format/g) || []).length,
            'Pa11y timed out': (allLogs.match(/Pa11y timed out/g) || []).length,
            'model:task:runById failed': (allLogs.match(/model:task:runById failed/g) || []).length,
            'ECONNREFUSED': (allLogs.match(/ECONNREFUSED/g) || []).length
        };
        
        Object.entries(patterns).forEach(([pattern, count]) => {
            if (count > 0) {
                console.log(`🔸 ${pattern}: ${count} occurrences`);
            }
        });
    }
}

// Run the analysis
analyzeLogs();
