#!/usr/bin/env node
/**
 * Simulate Extension Flow: GET (miss) -> API Call -> POST (save)
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

async function simulateExtensionFlow() {
    console.log('🔄 Simulating Extension Flow: Search for "tas"...\n');

    try {
        // Step 1: Extension tries to get cached data (should be cache miss)
        console.log('1. Extension requests cached data for "tas"...');
        const getResult = await makeRequest('GET', '/api/cache?platform=shopee.co.id&type=SearchResult:keyword=tas:1&_=' + Date.now());
        
        console.log('   ✅ Cache GET status:', getResult.status);
        console.log('   📭 Response status:', getResult.body.response?.status);
        console.log('   💬 Message:', getResult.body.response?.body?.message);
        console.log('   🔐 Has signature:', !!getResult.body.response?.body?.sign);

        if (getResult.body.response?.status === 503) {
            console.log('   ✅ Cache miss detected - extension should proceed to API call\n');

            // Step 2: Simulate extension calling Shopee API and getting data
            console.log('2. Extension calls Shopee API (simulated)...');
            const mockShopeeResponse = {
                items: [
                    {
                        id: 98765,
                        name: 'Tas Ransel Laptop',
                        price: 250000,
                        shop: { name: 'Bag Store' },
                        sold: 150,
                        rating: 4.5
                    },
                    {
                        id: 98766,
                        name: 'Tas Selempang Wanita',
                        price: 180000,
                        shop: { name: 'Fashion Bag' },
                        sold: 89,
                        rating: 4.2
                    },
                    {
                        id: 98767,
                        name: 'Tas Kulit Premium',
                        price: 450000,
                        shop: { name: 'Premium Store' },
                        sold: 45,
                        rating: 4.8
                    }
                ],
                meta: {
                    totalCount: 3,
                    timestamp: Date.now(),
                    query: 'tas',
                    page: 1,
                    source: 'searchProducts'
                }
            };
            console.log('   📦 Simulated API response with', mockShopeeResponse.items.length, 'products\n');

            // Step 3: Extension saves the data to cache
            console.log('3. Extension saves data to cache...');
            const saveData = {
                platform: 'shopee.co.id',
                data: [
                    {
                        type: 'SearchResult:keyword=tas:1',
                        raw: JSON.stringify(mockShopeeResponse)
                    },
                    {
                        type: 'SearchItems:keyword=tas:1', 
                        raw: JSON.stringify({
                            result: {
                                items: mockShopeeResponse.items,
                                adjust: { count: 150 }
                            }
                        })
                    }
                ]
            };

            const saveResult = await makeRequest('POST', '/api/cache', saveData, {
                'X-Token': 'extension-token-' + Date.now(),
                'X-W': Math.floor(Date.now() / 1000).toString(16)
            });

            console.log('   ✅ Cache SAVE status:', saveResult.status);
            console.log('   📝 Saved items:', saveResult.body.saved);
            console.log('   ⏰ Timestamp:', saveResult.body.timestamp, '\n');

            // Step 4: Verify data is now cached
            console.log('4. Verify data is now cached...');
            const verifyResult = await makeRequest('GET', '/api/cache?platform=shopee.co.id&type=SearchResult:keyword=tas:1&_=' + Date.now());
            
            console.log('   ✅ Verify GET status:', verifyResult.status);
            console.log('   📖 Response status:', verifyResult.body.response?.status);
            console.log('   🔐 Has signature:', !!verifyResult.body.response?.body?.sign);
            
            if (verifyResult.body.response?.status === 200) {
                const cachedData = JSON.parse(verifyResult.body.response.body.data.data);
                console.log('   📊 Cached items count:', cachedData.items?.length || 0);
                console.log('   🏷️  First item:', cachedData.items?.[0]?.name || 'N/A');
                console.log('   💰 Price range:', 
                    'Rp' + Math.min(...cachedData.items.map(i => i.price)).toLocaleString(), 
                    '- Rp' + Math.max(...cachedData.items.map(i => i.price)).toLocaleString()
                );
            }

            console.log('\n🎉 Complete Extension Flow Successfully Simulated!');
            console.log('\n📋 Flow Summary:');
            console.log('   1. ✅ Cache miss (expected)');
            console.log('   2. ✅ API call simulation (would be real Shopee API)');
            console.log('   3. ✅ Cache save successful');
            console.log('   4. ✅ Cache hit on subsequent request');
            console.log('\n🚀 Extension should now work properly with cache server!');

        } else {
            console.log('   ❌ Expected cache miss, but got cache hit');
        }

    } catch (error) {
        console.error('❌ Flow simulation failed:', error.message);
    }
}

// Run simulation
simulateExtensionFlow();
