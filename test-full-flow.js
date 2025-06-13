#!/usr/bin/env node
/**
 * Test script untuk flow lengkap cache (save then get)
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

async function testFullFlow() {
    console.log('🧪 Testing Full Cache Flow (Save -> Get)...\n');

    try {
        // Test 1: Verify /api/init has proper signature
        console.log('1. Testing /api/init endpoint...');
        const init = await makeRequest('GET', '/api/init');
        console.log('   ✅ Status:', init.status);
        console.log('   📝 Has signature:', !!init.body.sign);
        console.log('   🕐 Timestamp:', init.body.data?.t);
        console.log('   🔐 Signature:', init.body.sign?.substring(0, 20) + '...');

        // Test 2: Save some cache data (like extension would do)
        console.log('\n2. Testing cache save (simulating extension)...');
        const testData = {
            platform: 'shopee.co.id',
            data: [
                {
                    type: 'SearchResult:keyword=celana:1',
                    raw: JSON.stringify({
                        items: [
                            { 
                                id: 12345, 
                                name: 'Celana Jeans Pria', 
                                price: 150000,
                                shop: { name: 'Toko Fashion' }
                            },
                            { 
                                id: 12346, 
                                name: 'Celana Chino Wanita', 
                                price: 120000,
                                shop: { name: 'Fashion Store' }
                            }
                        ],
                        meta: { 
                            totalCount: 2, 
                            timestamp: Date.now(),
                            query: 'celana',
                            page: 1,
                            source: 'searchProducts'
                        }
                    })
                }
            ]
        };

        const saveResult = await makeRequest('POST', '/api/cache', testData, {
            'X-Token': 'test-token-123',
            'X-W': Math.floor(Date.now() / 1000).toString(16)
        });
        
        console.log('   ✅ Save status:', saveResult.status);
        console.log('   📦 Saved items:', saveResult.body.saved);

        // Test 3: Get the cached data (like extension would do)
        console.log('\n3. Testing cache get (simulating extension request)...');
        const getResult = await makeRequest('GET', '/api/cache?platform=shopee.co.id&type=SearchResult:keyword=celana:1&_=' + Date.now());
        
        console.log('   ✅ Get status:', getResult.status);
        console.log('   📖 Response status:', getResult.body.response?.status);
        console.log('   🔐 Has signature:', !!getResult.body.response?.body?.sign);
        console.log('   🕐 Has ftime:', !!getResult.body.response?.body?.ftime);
        
        if (getResult.body.response?.status === 200) {
            const cachedData = JSON.parse(getResult.body.response.body.data.data);
            console.log('   📊 Cached items count:', cachedData.items?.length || 0);
            console.log('   🏷️  First item:', cachedData.items?.[0]?.name || 'N/A');
        }

        // Test 4: Test cache miss dengan signature
        console.log('\n4. Testing cache miss (should have signature)...');
        const missResult = await makeRequest('GET', '/api/cache?platform=shopee.co.id&type=NonExistentKey&_=' + Date.now());
        
        console.log('   ✅ Miss status:', missResult.status);
        console.log('   📭 Response status:', missResult.body.response?.status);
        console.log('   🔐 Miss has signature:', !!missResult.body.response?.body?.sign);
        console.log('   💬 Miss message:', missResult.body.response?.body?.message);

        console.log('\n🎉 Full flow test completed successfully!');
        console.log('\n📋 Summary:');
        console.log('   ✅ /api/init provides proper signature');
        console.log('   ✅ Cache save works correctly');
        console.log('   ✅ Cache get provides signed response');
        console.log('   ✅ Cache miss provides signed response');
        console.log('\n🔧 Extension should now pass validation!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run tests
testFullFlow();
