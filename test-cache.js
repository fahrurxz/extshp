#!/usr/bin/env node
/**
 * Test script untuk cache server
 */

const http = require('http');

const SERVER_URL = 'http://localhost:8080';

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
            }
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

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function testCacheServer() {
    console.log('🧪 Testing Enhanced Cache Server...\n');

    try {
        // Test 1: Health check
        console.log('1. Testing health endpoint...');
        const health = await makeRequest('GET', '/health');
        console.log('   ✅ Health:', health.status === 200 ? 'OK' : 'FAILED');
        console.log('   📊 Stats:', health.body.cache);

        // Test 2: Save cache data
        console.log('\n2. Testing cache save...');
        const testData = {
            platform: 'shopee',
            data: [
                {
                    type: 'SearchResult:keyword=laptop:1',
                    raw: JSON.stringify({
                        items: [
                            { id: 1, name: 'Laptop Gaming', price: 15000000 },
                            { id: 2, name: 'Laptop Office', price: 8000000 }
                        ],
                        meta: { totalCount: 2, timestamp: Date.now() }
                    })
                },
                {
                    type: 'SearchItems:keyword=laptop:1',
                    raw: JSON.stringify({
                        result: { items: [], adjust: { count: 50 } }
                    })
                }
            ]
        };

        const saveResult = await makeRequest('POST', '/api/cache', testData, {
            'X-Token': 'test-token',
            'X-W': Math.floor(Date.now() / 1000).toString(16)
        });
        
        console.log('   ✅ Save status:', saveResult.status);
        console.log('   📝 Save result:', saveResult.body);

        // Test 3: Get cache data
        console.log('\n3. Testing cache get...');
        const getResult = await makeRequest('GET', '/api/cache?platform=shopee&type=SearchResult:keyword=laptop:1');
        console.log('   ✅ Get status:', getResult.status);
        console.log('   📖 Get result:', getResult.body.response?.status === 200 ? 'FOUND' : 'NOT_FOUND');

        // Test 4: Cache miss
        console.log('\n4. Testing cache miss...');
        const missResult = await makeRequest('GET', '/api/cache?platform=shopee&type=NonExistentKey');
        console.log('   ✅ Miss status:', missResult.status);
        console.log('   📭 Miss result:', missResult.body.response?.status === 503 ? 'EXPECTED_MISS' : 'UNEXPECTED');

        // Test 5: Stats
        console.log('\n5. Testing stats endpoint...');
        const stats = await makeRequest('GET', '/api/stats');
        console.log('   ✅ Stats:', stats.status === 200 ? 'OK' : 'FAILED');
        console.log('   📈 Cache stats:', stats.body.stats);

        console.log('\n🎉 All tests completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run tests
testCacheServer();
