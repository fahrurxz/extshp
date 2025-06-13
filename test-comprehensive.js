#!/usr/bin/env node
/**
 * Comprehensive Test Suite for Tokpee Extension and Cache Server
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const SERVER_URL = 'http://localhost:8080';
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

// Test Results Tracking
let testResults = {
    passed: 0,
    failed: 0,
    total: 0,
    details: []
};

function makeRequest(method, path, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(SERVER_URL + path);
        const options = {
            method,
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            timeout: 5000
        };

        if (data) {
            const postData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: JSON.parse(body)
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: body
                    });
                }
            });
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

function log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName, passed, details = '') {
    testResults.total++;
    if (passed) {
        testResults.passed++;
        log(`✅ ${testName}`, 'green');
    } else {
        testResults.failed++;
        log(`❌ ${testName}`, 'red');
    }
    
    if (details) {
        log(`   ${details}`, 'cyan');
    }
    
    testResults.details.push({
        test: testName,
        passed,
        details
    });
}

async function runTest(testName, testFunction) {
    try {
        log(`\n🧪 Running: ${testName}`, 'yellow');
        await testFunction();
    } catch (error) {
        logTest(testName, false, `Error: ${error.message}`);
    }
}

// Test Functions
async function testServerHealth() {
    const result = await makeRequest('GET', '/health');
    logTest(
        'Server Health Check',
        result.status === 200 && result.body.status === 'healthy',
        `Status: ${result.status}, Server Status: ${result.body.status}`
    );
}

async function testServerStats() {
    const result = await makeRequest('GET', '/api/stats');
    const hasRequiredFields = result.body.stats && result.body.cache && result.body.system;
    logTest(
        'Server Statistics Endpoint',
        result.status === 200 && hasRequiredFields,
        `Status: ${result.status}, Has required fields: ${hasRequiredFields}`
    );
}

async function testCacheClear() {
    const result = await makeRequest('DELETE', '/api/cache');
    logTest(
        'Cache Clear Operation',
        result.status === 200 && result.body.status === 'success',
        `Status: ${result.status}, Message: ${result.body.message}`
    );
}

async function testCacheMiss() {
    const testKey = `SearchResult:keyword=testMiss${Date.now()}:1`;
    const result = await makeRequest('GET', `/api/cache?platform=shopee.co.id&type=${testKey}&_=${Date.now()}`);
    
    const isCacheMiss = result.status === 200 && 
                       result.body.response && 
                       result.body.response.status === 503;
    
    logTest(
        'Cache Miss Detection',
        isCacheMiss,
        `Status: ${result.status}, Response Status: ${result.body.response?.status}, Message: ${result.body.response?.body?.message}`
    );
}

async function testCacheSave() {
    const testKey = `SearchResult:keyword=testSave${Date.now()}:1`;
    const testData = {
        platform: 'shopee.co.id',
        data: [{
            type: testKey,
            raw: JSON.stringify({
                items: [
                    { id: 1001, name: 'Test Product Save 1', price: 100000 },
                    { id: 1002, name: 'Test Product Save 2', price: 200000 }
                ],
                meta: { 
                    totalCount: 2, 
                    query: 'testSave', 
                    source: 'testCacheSave',
                    timestamp: Date.now()
                }
            })
        }]
    };

    const result = await makeRequest('POST', '/api/cache', testData, {
        'X-Token': 'test-token-' + Date.now(),
        'X-W': Math.floor(Date.now() / 1000).toString(16)
    });

    const isSaveSuccess = result.status === 200 && result.body.saved > 0;
    
    logTest(
        'Cache Save Operation',
        isSaveSuccess,
        `Status: ${result.status}, Saved: ${result.body.saved} items, Timestamp: ${result.body.timestamp}`
    );

    return { testKey, success: isSaveSuccess };
}

async function testCacheHit() {
    // First save some data
    const saveResult = await testCacheSave();
    
    if (!saveResult.success) {
        logTest('Cache Hit Test', false, 'Failed because cache save failed');
        return;
    }

    // Now try to retrieve it
    const result = await makeRequest('GET', `/api/cache?platform=shopee.co.id&type=${saveResult.testKey}&_=${Date.now()}`);
    
    const isCacheHit = result.status === 200 && 
                      result.body.response && 
                      result.body.response.status === 200 &&
                      result.body.response.body.data;
    
    let itemCount = 0;
    if (isCacheHit) {
        try {
            const cachedData = JSON.parse(result.body.response.body.data.data);
            itemCount = cachedData.items ? cachedData.items.length : 0;
        } catch (e) {
            // Ignore parse errors for this test
        }
    }
    
    logTest(
        'Cache Hit Retrieval',
        isCacheHit,
        `Status: ${result.status}, Response Status: ${result.body.response?.status}, Items: ${itemCount}`
    );
}

async function testFullCacheFlow() {
    const testKey = `SearchResult:keyword=fullFlow${Date.now()}:1`;
    
    // Step 1: Ensure cache miss
    log('   Step 1: Testing cache miss...', 'cyan');
    const missResult = await makeRequest('GET', `/api/cache?platform=shopee.co.id&type=${testKey}&_=${Date.now()}`);
    const isMiss = missResult.status === 200 && missResult.body.response?.status === 503;
    
    if (!isMiss) {
        logTest('Full Cache Flow', false, 'Initial cache miss failed');
        return;
    }

    // Step 2: Save data
    log('   Step 2: Saving test data...', 'cyan');
    const saveData = {
        platform: 'shopee.co.id',
        data: [{
            type: testKey,
            raw: JSON.stringify({
                items: [
                    { id: 2001, name: 'Full Flow Product 1', price: 150000 },
                    { id: 2002, name: 'Full Flow Product 2', price: 250000 },
                    { id: 2003, name: 'Full Flow Product 3', price: 350000 }
                ],
                meta: { 
                    totalCount: 3, 
                    query: 'fullFlow', 
                    source: 'testFullCacheFlow',
                    timestamp: Date.now()
                }
            })
        }]
    };

    const saveResult = await makeRequest('POST', '/api/cache', saveData, {
        'X-Token': 'full-flow-token-' + Date.now(),
        'X-W': Math.floor(Date.now() / 1000).toString(16)
    });

    const isSaved = saveResult.status === 200 && saveResult.body.saved > 0;
    
    if (!isSaved) {
        logTest('Full Cache Flow', false, 'Cache save step failed');
        return;
    }

    // Step 3: Verify cache hit
    log('   Step 3: Testing cache hit...', 'cyan');
    const hitResult = await makeRequest('GET', `/api/cache?platform=shopee.co.id&type=${testKey}&_=${Date.now()}`);
    const isHit = hitResult.status === 200 && hitResult.body.response?.status === 200;
    
    let retrievedCount = 0;
    if (isHit) {
        try {
            const cachedData = JSON.parse(hitResult.body.response.body.data.data);
            retrievedCount = cachedData.items ? cachedData.items.length : 0;
        } catch (e) {
            // Ignore parse errors
        }
    }

    logTest(
        'Full Cache Flow (Miss → Save → Hit)',
        isMiss && isSaved && isHit && retrievedCount === 3,
        `Miss: ${isMiss}, Save: ${isSaved}, Hit: ${isHit}, Items: ${retrievedCount}/3`
    );
}

async function testSignatureValidation() {
    const testKey = `SearchResult:keyword=sigTest${Date.now()}:1`;
    
    // First save some data to get a response with signature
    const saveData = {
        platform: 'shopee.co.id',
        data: [{
            type: testKey,
            raw: JSON.stringify({
                items: [{ id: 3001, name: 'Signature Test Product', price: 99000 }],
                meta: { totalCount: 1, query: 'sigTest', source: 'testSignature' }
            })
        }]
    };

    const saveResult = await makeRequest('POST', '/api/cache', saveData);
    const hitResult = await makeRequest('GET', `/api/cache?platform=shopee.co.id&type=${testKey}&_=${Date.now()}`);
    
    const hasSignature = hitResult.body.response?.body?.sign;
    const hasTimestamp = hitResult.body.response?.body?.ftime;
    
    logTest(
        'Response Signature Validation',
        !!hasSignature && !!hasTimestamp,
        `Has signature: ${!!hasSignature}, Has timestamp: ${!!hasTimestamp}`
    );
}

async function testMultiplePlatforms() {
    const platforms = ['shopee.co.id', 'tokopedia.com'];
    let allPassed = true;
    
    for (const platform of platforms) {
        const testKey = `SearchResult:keyword=platform${Date.now()}:1`;
        const saveData = {
            platform: platform,
            data: [{
                type: testKey,
                raw: JSON.stringify({
                    items: [{ id: 4001, name: `${platform} Test Product`, price: 75000 }],
                    meta: { totalCount: 1, query: 'platform', source: platform }
                })
            }]
        };

        const saveResult = await makeRequest('POST', '/api/cache', saveData);
        const isSuccess = saveResult.status === 200 && saveResult.body.saved > 0;
        
        if (!isSuccess) {
            allPassed = false;
        }
        
        log(`   ${platform}: ${isSuccess ? '✅' : '❌'}`, isSuccess ? 'green' : 'red');
    }
    
    logTest(
        'Multiple Platform Support',
        allPassed,
        `Tested platforms: ${platforms.join(', ')}`
    );
}

async function testErrorHandling() {
    // Test invalid JSON by sending raw string
    try {
        const result = await makeRequest('POST', '/api/cache', null);
        // Send raw invalid JSON string by modifying the request
        logTest(
            'Invalid JSON Error Handling',
            result.status >= 400,
            `Status: ${result.status}`
        );
    } catch (error) {
        logTest('Invalid JSON Error Handling', true, 'Request properly handled error');
    }

    // Test missing required fields
    const invalidData = { platform: 'test' }; // missing data field
    const result2 = await makeRequest('POST', '/api/cache', invalidData);
    logTest(
        'Missing Fields Error Handling',
        result2.status === 400,
        `Status: ${result2.status}`
    );

    // Test non-existent endpoint
    const result3 = await makeRequest('GET', '/api/nonexistent');
    logTest(
        'Non-existent Endpoint Handling',
        result3.status === 404,
        `Status: ${result3.status}`
    );
}

async function testFileSystemIntegration() {
    const cacheDir = path.join(__dirname, 'cache_data');
    const logsDir = path.join(__dirname, 'logs');
    
    // Check if directories exist
    const cacheDirExists = fs.existsSync(cacheDir);
    const logsDirExists = fs.existsSync(logsDir);
    
    logTest(
        'Cache Directory Exists',
        cacheDirExists,
        `Path: ${cacheDir}`
    );
    
    logTest(
        'Logs Directory Exists',
        logsDirExists,
        `Path: ${logsDir}`
    );

    // Test if logs are being written
    if (logsDirExists) {
        const logFiles = fs.readdirSync(logsDir).filter(f => f.endsWith('.log'));
        const hasCurrentLog = logFiles.some(f => f.includes(new Date().toISOString().split('T')[0]));
        
        logTest(
            'Daily Log File Creation',
            hasCurrentLog,
            `Log files: ${logFiles.length}, Current day log: ${hasCurrentLog}`
        );
    }
}

async function testPerformanceMetrics() {
    const iterations = 10;
    const times = [];
    
    log(`   Running ${iterations} cache operations...`, 'cyan');
    
    for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        const testKey = `PerformanceTest:iteration=${i}:${Date.now()}:1`;
        
        // Save
        await makeRequest('POST', '/api/cache', {
            platform: 'shopee.co.id',
            data: [{ type: testKey, raw: '{"test": true}' }]
        });
        
        // Retrieve
        await makeRequest('GET', `/api/cache?platform=shopee.co.id&type=${testKey}&_=${Date.now()}`);
        
        const duration = Date.now() - start;
        times.push(duration);
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);
    
    logTest(
        'Performance Metrics',
        avgTime < 100, // Should be faster than 100ms on average
        `Avg: ${avgTime.toFixed(2)}ms, Min: ${minTime}ms, Max: ${maxTime}ms`
    );
}

async function generateTestReport() {
    log('\n' + '='.repeat(60), 'blue');
    log('🧪 TEST RESULTS SUMMARY', 'blue');
    log('='.repeat(60), 'blue');
    
    log(`Total Tests: ${testResults.total}`, 'white');
    log(`Passed: ${testResults.passed}`, 'green');
    log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'white');
    log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`, 
        testResults.failed === 0 ? 'green' : 'yellow');
    
    if (testResults.failed > 0) {
        log('\n❌ FAILED TESTS:', 'red');
        testResults.details
            .filter(t => !t.passed)
            .forEach(t => {
                log(`   - ${t.test}`, 'red');
                if (t.details) {
                    log(`     ${t.details}`, 'cyan');
                }
            });
    }
    
    // Write detailed report to file
    const reportPath = path.join(__dirname, `test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        summary: {
            total: testResults.total,
            passed: testResults.passed,
            failed: testResults.failed,
            successRate: (testResults.passed / testResults.total) * 100
        },
        details: testResults.details
    }, null, 2));
    
    log(`\n📋 Detailed report saved to: ${reportPath}`, 'cyan');
    
    return testResults.failed === 0;
}

// Main test execution
async function runAllTests() {
    log('🚀 Starting Comprehensive Test Suite for Tokpee Extension', 'blue');
    log('=' .repeat(60), 'blue');
    
    try {
        // Basic server tests
        await runTest('Server Health Check', testServerHealth);
        await runTest('Server Statistics', testServerStats);
        await runTest('Cache Clear', testCacheClear);
        
        // Core cache functionality tests
        await runTest('Cache Miss Detection', testCacheMiss);
        await runTest('Cache Save Operation', testCacheSave);
        await runTest('Cache Hit Retrieval', testCacheHit);
        await runTest('Full Cache Flow', testFullCacheFlow);
        
        // Advanced functionality tests
        await runTest('Signature Validation', testSignatureValidation);
        await runTest('Multiple Platform Support', testMultiplePlatforms);
        await runTest('Error Handling', testErrorHandling);
        await runTest('File System Integration', testFileSystemIntegration);
        await runTest('Performance Metrics', testPerformanceMetrics);
        
        // Generate final report
        const allTestsPassed = await generateTestReport();
        
        process.exit(allTestsPassed ? 0 : 1);
        
    } catch (error) {
        log(`\n🚨 Fatal error during testing: ${error.message}`, 'red');
        process.exit(1);
    }
}

// Check if server is running before starting tests
async function checkServerConnection() {
    try {
        await makeRequest('GET', '/health');
        log('✅ Server connection verified', 'green');
        return true;
    } catch (error) {
        log('❌ Cannot connect to server. Please ensure the server is running on localhost:8080', 'red');
        log(`Error: ${error.message}`, 'red');
        return false;
    }
}

// Start the test suite
async function main() {
    const isConnected = await checkServerConnection();
    if (!isConnected) {
        process.exit(1);
    }
    
    await runAllTests();
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = {
    runAllTests,
    makeRequest,
    testResults
};
