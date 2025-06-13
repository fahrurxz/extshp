#!/usr/bin/env node
/**
 * Cache Server Monitor - Real-time monitoring
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const SERVER_URL = 'http://localhost:8080';
const LOG_DIR = path.join(__dirname, 'logs');
const MONITOR_INTERVAL = 5000; // 5 seconds

let lastLogPosition = 0;
let previousStats = null;

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const url = new URL(SERVER_URL + path);
        const options = {
            method: 'GET',
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            headers: { 'Content-Type': 'application/json' }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        body: JSON.parse(body)
                    });
                } catch (e) {
                    reject(new Error('Invalid JSON response'));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleTimeString();
}

function readNewLogEntries() {
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(LOG_DIR, `${today}.log`);
    
    if (!fs.existsSync(logFile)) {
        return [];
    }
    
    const fileSize = fs.statSync(logFile).size;
    if (fileSize <= lastLogPosition) {
        return [];
    }
    
    const buffer = Buffer.alloc(fileSize - lastLogPosition);
    const fd = fs.openSync(logFile, 'r');
    fs.readSync(fd, buffer, 0, buffer.length, lastLogPosition);
    fs.closeSync(fd);
    
    lastLogPosition = fileSize;
    
    const newContent = buffer.toString();
    const lines = newContent.split('\n').filter(line => line.trim());
    
    return lines.map(line => {
        try {
            return JSON.parse(line);
        } catch (e) {
            return null;
        }
    }).filter(entry => entry !== null);
}

function displayStats(stats) {
    console.clear();
    console.log('🔍 Tokpee Cache Server Monitor');
    console.log('================================\n');
    
    if (!stats) {
        console.log('❌ Server not responding');
        return;
    }
    
    const { stats: cacheStats, cache, system } = stats.body;
    
    console.log('📊 CACHE STATISTICS:');
    console.log(`   Saves: ${cacheStats.saves} (+${cacheStats.saves - (previousStats?.saves || 0)})`);
    console.log(`   Gets:  ${cacheStats.gets} (+${cacheStats.gets - (previousStats?.gets || 0)})`);
    console.log(`   Hits:  ${cacheStats.hits} (${cacheStats.gets > 0 ? Math.round(cacheStats.hits / cacheStats.gets * 100) : 0}% hit rate)`);
    console.log(`   Misses: ${cacheStats.misses}`);
    console.log(`   Errors: ${cacheStats.errors}\n`);
    
    console.log('💾 CACHE STATUS:');
    console.log(`   Memory Entries: ${cache.memoryEntries}`);
    console.log(`   Disk Files: ${cache.diskFiles}\n`);
    
    console.log('🖥️  SYSTEM STATUS:');
    console.log(`   Uptime: ${Math.floor(system.uptime / 60)}m ${Math.floor(system.uptime % 60)}s`);
    console.log(`   Memory: ${Math.round(system.memory.heapUsed / 1024 / 1024)}MB / ${Math.round(system.memory.heapTotal / 1024 / 1024)}MB\n`);
    
    previousStats = cacheStats;
}

function displayLogs(entries) {
    if (entries.length === 0) return;
    
    console.log('📝 RECENT LOG ENTRIES:');
    console.log('----------------------');
    
    entries.slice(-10).forEach(entry => {
        const time = formatTimestamp(entry.timestamp);
        const type = entry.type.padEnd(5);
        let message = entry.message;
        
        // Color coding for different log types
        const colors = {
            'INFO': '\x1b[32m',  // Green
            'WARN': '\x1b[33m',  // Yellow
            'ERROR': '\x1b[31m', // Red
            'REQUEST': '\x1b[36m' // Cyan
        };
        
        const color = colors[entry.type] || '\x1b[0m';
        const reset = '\x1b[0m';
        
        console.log(`${color}[${time}] ${type}${reset} ${message}`);
        
        // Show additional data for important events
        if (entry.data && (entry.type === 'ERROR' || entry.message.includes('saved') || entry.message.includes('hit'))) {
            const data = typeof entry.data === 'string' ? entry.data : JSON.stringify(entry.data);
            if (data.length < 100) {
                console.log(`           └─ ${data}`);
            }
        }
    });
    
    console.log('');
}

async function monitor() {
    try {
        // Get server stats
        const stats = await makeRequest('/api/stats');
        displayStats(stats);
        
        // Read new log entries
        const newEntries = readNewLogEntries();
        displayLogs(newEntries);
        
        console.log(`🔄 Monitoring... (refreshing every ${MONITOR_INTERVAL/1000}s, press Ctrl+C to stop)`);
        
    } catch (error) {
        console.clear();
        console.log('🔍 Tokpee Cache Server Monitor');
        console.log('================================\n');
        console.log('❌ CONNECTION ERROR:', error.message);
        console.log('\n   Make sure the server is running on http://localhost:8080');
        console.log(`\n🔄 Retrying in ${MONITOR_INTERVAL/1000} seconds...`);
    }
}

// Start monitoring
console.log('🚀 Starting Cache Server Monitor...\n');

// Initial call
monitor();

// Set up interval
const interval = setInterval(monitor, MONITOR_INTERVAL);

// Graceful shutdown
process.on('SIGINT', () => {
    clearInterval(interval);
    console.log('\n\n👋 Monitor stopped. Goodbye!');
    process.exit(0);
});

console.log('Press Ctrl+C to stop monitoring...\n');
