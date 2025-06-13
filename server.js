#!/usr/bin/env node
/**
 * Enhanced Tokpee Cache Server - Production Ready
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

const app = express();
const PORT = 8080;

// Cache storage directory
const CACHE_DIR = path.join(__dirname, 'cache_data');
const LOG_DIR = path.join(__dirname, 'logs');

// Ensure directories exist
if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    console.log('📁 Created cache directory:', CACHE_DIR);
}

if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    console.log('📁 Created logs directory:', LOG_DIR);
}

// In-memory cache for fast access
const memoryCache = new Map();
const cacheStats = {
    saves: 0,
    gets: 0,
    hits: 0,
    misses: 0,
    errors: 0
};

// Utility functions
function logToFile(type, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        type,
        message,
        data: data ? (typeof data === 'object' ? JSON.stringify(data) : data) : null
    };
    
    const logFile = path.join(LOG_DIR, `${new Date().toISOString().split('T')[0]}.log`);
    const logLine = JSON.stringify(logEntry) + '\n';
    
    fs.appendFileSync(logFile, logLine);
    console.log(`[${timestamp}] ${type}: ${message}`);
}

function sanitizeKey(key) {
    return key.replace(/[^a-zA-Z0-9_-]/g, '_');
}

function generateFileHash(data) {
    return crypto.createHash('md5').update(data).digest('hex');
}

function compressData(data) {
    try {
        return zlib.gzipSync(Buffer.from(data, 'utf8'));
    } catch (error) {
        logToFile('ERROR', 'Compression failed', error.message);
        return Buffer.from(data, 'utf8');
    }
}

function decompressData(buffer) {
    try {
        return zlib.gunzipSync(buffer).toString('utf8');
    } catch (error) {
        logToFile('WARN', 'Decompression failed, returning raw buffer');
        return buffer.toString('utf8');
    }
}

// Enhanced middleware
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Token', 'X-W', 'Accept']
}));

// Custom body parser to handle both JSON and binary data (only for POST requests)
app.use((req, res, next) => {
    if (req.method === 'POST' && req.headers['content-type'] === 'application/octet-stream') {
        let data = [];
        req.on('data', chunk => {
            data.push(chunk);
        });
        req.on('end', () => {
            try {
                const buffer = Buffer.concat(data);
                const decompressed = decompressData(buffer);
                req.body = JSON.parse(decompressed);
                logToFile('INFO', 'Binary data parsed successfully', {
                    originalSize: buffer.length,
                    decompressedSize: decompressed.length
                });
                next();
            } catch (error) {
                logToFile('ERROR', 'Failed to parse binary data', error.message);
                res.status(400).json({ error: 'Invalid binary data format' });
            }
        });
    } else {
        next();
    }
});

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Request logging middleware
app.use((req, res, next) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        logToFile('REQUEST', `${req.method} ${req.url}`, {
            headers: req.headers,
            bodySize: req.body ? JSON.stringify(req.body).length : 0,
            status: res.statusCode,
            duration: `${duration}ms`
        });
    });
    
    next();
});

// Root route
app.get('/', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Enhanced Tokpee Cache Server',
        stats: cacheStats,
        uptime: process.uptime()
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        cache: {
            memoryEntries: memoryCache.size,
            stats: cacheStats
        },
        system: {
            memory: process.memoryUsage(),
            uptime: process.uptime()
        }
    });
});

// API verify endpoint
app.get('/api/verify', (req, res) => {
    logToFile('INFO', 'Verify endpoint accessed');
    res.json({ status: true, message: 'verify ok', timestamp: Date.now() });
});

// Generate validation signature for responses
function generateValidationSignature(timestamp) {
    const signatures = [
        "1M&F!11=TO3+cSY2*!EL/MT\"=0K:jK3&ND",
        "2N&G!22=UP4+dTZ3*!FM/NU\"=1L:kL4&OE", 
        "3O&H!33=VQ5+eUA4*!GN/OV\"=2M:lM5&PF",
        "4P&I!44=WR6+fVB5*!HO/PW\"=3N:mN6&QG",
        "5Q&J!55=XS7+gWC6*!IP/QX\"=4O:nO7&RH"
    ];
    
    // Use timestamp to select signature (simple rotation)
    const index = timestamp % signatures.length;
    return signatures[index];
}

// Generate signature for cache responses - use the exact same format as init
function generateSignature(responseBody, timestamp) {
    // Always use the first signature pattern for consistency
    return "1M&F!11=TO3+cSY2*!EL/MT\"=0K:jK3&ND";
}

// API init endpoint - required by extension
app.get('/api/init', (req, res) => {
    logToFile('INFO', 'Init endpoint accessed');
    
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Generate response in expected format
    const initResponse = {
        status: true,
        data: {
            s: [1, 21, 31, 11, 10], // Configuration array
            u: "Wzk0LDEwMSwyMzUsMTI2LDEyNyw5OSwxMTAsMTAxLDEyNyw5OCwxMDQsMTA2LDEyNywxMTAsMTExLDM3XQ==", // Base64 encoded data
            c: { s: [] }, // Configuration object
            t: timestamp
        },
        sign: generateValidationSignature(timestamp)
    };
    
    logToFile('INFO', 'Init response generated', { timestamp, hasSign: !!initResponse.sign });
    res.json(initResponse);
});

// API log endpoint - required by extension for logging
app.post('/api/log', (req, res) => {
    try {
        logToFile('INFO', 'Extension log received', req.body);
        res.json({ status: 'success', timestamp: Date.now() });
    } catch (error) {
        logToFile('ERROR', 'Failed to process extension log', error.message);
        res.status(500).json({ error: 'Failed to process log' });
    }
});

// Helper function to generate signature for validation
function generateSignature(data, timestamp) {
    try {
        // Create a simple signature that mimics the expected format
        const content = JSON.stringify(data);
        const hash = crypto.createHash('sha256').update(content + ':' + timestamp).digest('hex');
        
        // Format: hash-timestamp-size
        return `${hash.substring(0, 16)}-${timestamp}-${content.length}`;
    } catch (error) {
        logToFile('ERROR', 'Failed to generate signature', error.message);
        return `fallback-${timestamp}-0`;
    }
}

// Cache save endpoint (POST)
app.post('/api/cache', (req, res) => {
    try {
        logToFile('INFO', 'Cache save request received', {
            headers: {
                'X-Token': req.headers['x-token'],
                'X-W': req.headers['x-w'],
                'Content-Type': req.headers['content-type']
            },
            bodyKeys: Object.keys(req.body || {})
        });

        const { platform, data } = req.body;
        
        if (!platform || !data || !Array.isArray(data)) {
            logToFile('ERROR', 'Invalid cache save request format', req.body);
            return res.status(400).json({ 
                error: 'Invalid request format. Expected: { platform, data: [] }' 
            });
        }

        let savedCount = 0;
        const errors = [];
          for (const item of data) {
            try {
                if (!item.type || !item.raw) {
                    errors.push(`Missing type or raw data: ${JSON.stringify(item)}`);
                    continue;
                }

                // URL-decode the type to handle encoded colons and other characters
                const decodedType = decodeURIComponent(item.type);
                const cacheKey = `${platform}:${sanitizeKey(decodedType)}`;
                const timestamp = Date.now();
                
                logToFile('INFO', 'Processing cache item', {
                    originalType: item.type,
                    decodedType: decodedType,
                    cacheKey: cacheKey
                });
                
                // Validate JSON data
                let parsedData;
                try {
                    parsedData = typeof item.raw === 'string' ? JSON.parse(item.raw) : item.raw;
                } catch (jsonError) {
                    logToFile('WARN', 'Invalid JSON in cache data, storing as raw', decodedType);
                    parsedData = { raw: item.raw, error: 'invalid_json' };
                }                const cacheEntry = {
                    platform,
                    type: decodedType,  // Use decoded type instead of original
                    data: parsedData,
                    timestamp,
                    hash: generateFileHash(item.raw),
                    size: item.raw.length
                };

                // Save to memory cache
                memoryCache.set(cacheKey, cacheEntry);

                // Save to disk
                const fileName = `${sanitizeKey(cacheKey)}.json`;
                const filePath = path.join(CACHE_DIR, fileName);
                
                fs.writeFileSync(filePath, JSON.stringify(cacheEntry, null, 2));
                
                logToFile('INFO', 'Cache entry saved', {
                    key: cacheKey,
                    size: cacheEntry.size,
                    file: fileName
                });
                
                savedCount++;
                  } catch (itemError) {
                const decodedType = decodeURIComponent(item.type || 'unknown');
                const errorMsg = `Failed to save item ${decodedType}: ${itemError.message}`;
                errors.push(errorMsg);
                logToFile('ERROR', errorMsg, itemError);
            }
        }

        cacheStats.saves += savedCount;
        
        if (errors.length > 0) {
            cacheStats.errors += errors.length;
        }

        const response = {
            status: 'success',
            saved: savedCount,
            errors: errors.length > 0 ? errors : undefined,
            timestamp: Date.now()
        };

        logToFile('INFO', 'Cache save completed', response);
        res.json(response);

    } catch (error) {
        cacheStats.errors++;
        logToFile('ERROR', 'Cache save failed', error.message);
        res.status(500).json({ 
            error: 'Internal server error', 
            message: error.message 
        });
    }
});

// Cache get endpoint (GET)
app.get('/api/cache', (req, res) => {
    try {
        const { platform, type } = req.query;
        
        // URL-decode the type parameter to handle encoded colons and other characters
        const decodedType = type ? decodeURIComponent(type) : type;
        
        logToFile('INFO', 'Cache get request', { 
            platform, 
            type: type, 
            decodedType: decodedType,
            originalRaw: req.url
        });
        
        if (!platform || !decodedType) {
            return res.status(400).json({ 
                error: 'Missing required parameters: platform, type' 
            });
        }

        const cacheKey = `${platform}:${sanitizeKey(decodedType)}`;
        cacheStats.gets++;// Try memory cache first
        if (memoryCache.has(cacheKey)) {
            const entry = memoryCache.get(cacheKey);
            cacheStats.hits++;
            
            logToFile('INFO', 'Cache hit (memory)', { key: cacheKey });
            
            const timestamp = Date.now();
            const responseBody = {
                data: {
                    data: JSON.stringify(entry.data),
                    date: entry.timestamp,
                    need_update: false,
                    finger: 'cached_data'
                }
            };
            
            // Add signature after responseBody is complete
            responseBody.sign = generateSignature(responseBody, timestamp);
            responseBody.ftime = timestamp;
            
            const finalResponse = {
                response: {
                    status: 200,
                    body: responseBody
                }
            };
            
            logToFile('INFO', 'Memory cache response sent', { 
                hasSign: !!responseBody.sign,
                responseStructure: Object.keys(finalResponse.response.body)
            });
            
            return res.json(finalResponse);
        }

        // Try disk cache
        const fileName = `${sanitizeKey(cacheKey)}.json`;
        const filePath = path.join(CACHE_DIR, fileName);
        
        if (fs.existsSync(filePath)) {
            try {
                const fileContent = fs.readFileSync(filePath, 'utf8');
                const entry = JSON.parse(fileContent);
                
                // Restore to memory cache
                memoryCache.set(cacheKey, entry);
                cacheStats.hits++;                logToFile('INFO', 'Cache hit (disk)', { key: cacheKey });
                
                const timestamp = Date.now();
                const responseBody = {
                    data: {
                        data: JSON.stringify(entry.data),
                        date: entry.timestamp,
                        need_update: false,
                        finger: 'cached_data'
                    }
                };
                
                // Add signature after responseBody is complete
                responseBody.sign = generateSignature(responseBody, timestamp);
                responseBody.ftime = timestamp;
                
                const finalResponse = {
                    response: {
                        status: 200,
                        body: responseBody
                    }
                };
                
                logToFile('INFO', 'Disk cache response sent', { 
                    hasSign: !!responseBody.sign,
                    responseStructure: Object.keys(finalResponse.response.body)
                });
                
                return res.json(finalResponse);
                
            } catch (fileError) {
                logToFile('ERROR', 'Failed to read cache file', fileError.message);
            }
        }        // Cache miss
        cacheStats.misses++;
        logToFile('INFO', 'Cache miss', { key: cacheKey });
        
        const timestamp = Date.now();
        const responseBody = {
            message: 'cache miss',
            data: null
        };
        
        // Add signature after responseBody is complete
        responseBody.sign = generateSignature(responseBody, timestamp);
        responseBody.ftime = timestamp;
        
        const finalResponse = {
            response: {
                status: 503,
                body: responseBody
            }
        };
        
        logToFile('INFO', 'Cache miss response sent', { 
            hasSign: !!responseBody.sign,
            responseStructure: Object.keys(finalResponse.response.body)
        });
        
        res.json(finalResponse);

    } catch (error) {
        cacheStats.errors++;
        logToFile('ERROR', 'Cache get failed', error.message);
        res.status(500).json({ 
            error: 'Internal server error', 
            message: error.message 
        });
    }
});

// Cache statistics endpoint
app.get('/api/stats', (req, res) => {
    const diskFiles = fs.readdirSync(CACHE_DIR).filter(f => f.endsWith('.json'));
    
    res.json({
        stats: cacheStats,
        cache: {
            memoryEntries: memoryCache.size,
            diskFiles: diskFiles.length
        },
        system: {
            memory: process.memoryUsage(),
            uptime: process.uptime()
        }
    });
});

// Clear cache endpoint
app.delete('/api/cache', (req, res) => {
    try {
        // Clear memory cache
        memoryCache.clear();
        
        // Clear disk cache
        const files = fs.readdirSync(CACHE_DIR);
        let deletedCount = 0;
        
        for (const file of files) {
            if (file.endsWith('.json')) {
                fs.unlinkSync(path.join(CACHE_DIR, file));
                deletedCount++;
            }
        }
        
        logToFile('INFO', 'Cache cleared', { deletedFiles: deletedCount });
        
        res.json({
            status: 'success',
            message: 'Cache cleared',
            deletedFiles: deletedCount
        });
        
    } catch (error) {
        logToFile('ERROR', 'Failed to clear cache', error.message);
        res.status(500).json({ error: 'Failed to clear cache' });
    }
});

// Error handler
app.use((error, req, res, next) => {
    cacheStats.errors++;
    logToFile('ERROR', 'Unhandled error', error.message);
    res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
    });
});

// Graceful shutdown
process.on('SIGINT', () => {
    logToFile('INFO', 'Server shutting down gracefully');
    console.log('\n🛑 Server shutting down gracefully...');
    process.exit(0);
});

// Start server
app.listen(PORT, () => {
    logToFile('INFO', `Enhanced cache server started on port ${PORT}`);
    console.log(`✅ Enhanced Tokpee Cache Server running on http://localhost:${PORT}`);
    console.log(`📁 Cache directory: ${CACHE_DIR}`);
    console.log(`📝 Logs directory: ${LOG_DIR}`);
});
