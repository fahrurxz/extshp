#!/usr/bin/env node
/**
 * Test specific search query to see if API returns data
 */

const http = require('http');

const SERVER_URL = 'http://localhost:8080';

function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(SERVER_URL + path);
        const options = {
            method,
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            headers: {
                'Content-Type': 'application/json'
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
                        body: JSON.parse(body)
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
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

async function testBajuSearch() {
    console.log('🔍 Testing "baju" search after cache clear...\n');
    
    // Test cache miss
    const testKey = 'SearchResult:keyword=baju:1';
    console.log('1. Testing cache miss for:', testKey);
    
    const result = await makeRequest('GET', `/api/cache?platform=shopee.co.id&type=${testKey}&_=${Date.now()}`);
    
    console.log('   Status:', result.status);
    console.log('   Response Status:', result.body.response?.status);
    console.log('   Message:', result.body.response?.body?.message);
    
    if (result.body.response?.status === 503) {
        console.log('   ✅ Cache miss confirmed - fresh API call should be triggered\n');
        
        console.log('2. Now refresh the Shopee search page and check:');
        console.log('   - Browser console should show API call to /v4/search/search_items');
        console.log('   - After API call, data should be saved to cache');
        console.log('   - Check cache_data/ folder for new baju search file');
        console.log('');
        console.log('3. Alternative test with different keyword:');
        console.log('   Try "laptop" or "sepatu" which might have more results');
        
    } else {
        console.log('   ❌ Unexpected response - cache should have been cleared');
        console.log('   Full response:', JSON.stringify(result.body, null, 2));
    }
}

testBajuSearch().catch(console.error);
