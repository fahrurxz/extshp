/**
 * Test the fix for [object Object] in cache keys
 * This simulates what the extension does when calling getProducts
 */

import('node-fetch').then(({ default: fetch }) => {
  testObjectObjectFix(fetch);
});

async function testObjectObjectFix(fetch) {
  console.log('🧪 Testing Fix for [object Object] in Cache Keys\n');
  
  const serverUrl = 'http://localhost:8080';
  
  // Simulate how the extension calls the cache API
  // The extension should now use proper string values instead of objects
  
  // Test case 1: Normal search query
  console.log('📝 Test 1: Normal search query');
  await testCacheKey(fetch, serverUrl, {
    description: 'Search for "baju" on page 0',
    cacheKey: 'SearchResult:keyword%3Dbaju:0',  // This is what the extension should send
    expectedDecodedKey: 'SearchResult:keyword=baju:0',
    data: { items: [{ name: "Baju Kaos" }], meta: { query: "keyword=baju", page: 0 } }
  });
  
  // Test case 2: Search with additional parameters
  console.log('\n📝 Test 2: Search with additional parameters');
  await testCacheKey(fetch, serverUrl, {
    description: 'Search for "sepatu" with filters on page 1',
    cacheKey: 'SearchResult:keyword%3Dsepatu%26sortBy%3Dprice:1',
    expectedDecodedKey: 'SearchResult:keyword=sepatu&sortBy=price:1',
    data: { items: [{ name: "Sepatu Nike" }], meta: { query: "keyword=sepatu&sortBy=price", page: 1 } }
  });
  
  // Test case 3: Empty query
  console.log('\n📝 Test 3: Empty query');
  await testCacheKey(fetch, serverUrl, {
    description: 'Empty search query on page 0',
    cacheKey: 'SearchResult::0',
    expectedDecodedKey: 'SearchResult::0',
    data: { items: [], meta: { query: "", page: 0 } }
  });
}

async function testCacheKey(fetch, serverUrl, testCase) {
  try {
    console.log(`   ${testCase.description}`);
    console.log(`   Cache Key: ${testCase.cacheKey}`);
    console.log(`   Expected Decoded: ${testCase.expectedDecodedKey}`);
    
    // Save data
    const saveResponse = await fetch(`${serverUrl}/api/cache`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform: 'shopee.co.id',
        data: [{
          type: testCase.cacheKey,
          raw: JSON.stringify(testCase.data)
        }]
      })
    });
    
    if (!saveResponse.ok) {
      throw new Error(`Save failed: ${await saveResponse.text()}`);
    }
    
    console.log('   ✅ Save successful');
    
    // Retrieve data
    const getResponse = await fetch(`${serverUrl}/api/cache?platform=shopee.co.id&type=${encodeURIComponent(testCase.cacheKey)}`);
    
    if (!getResponse.ok) {
      throw new Error(`Get failed: ${await getResponse.text()}`);
    }
    
    console.log('   ✅ Retrieval successful');
    
    // Check cache file
    const fs = require('fs');
    const cacheDir = 'e:\\bot\\fixshp\\cache_data';
    const files = fs.readdirSync(cacheDir);
    
    // Find the file for this test
    const expectedFilePattern = new RegExp(`shopee_co_id_SearchResult.*\\.json`);
    const cacheFile = files.find(file => expectedFilePattern.test(file));
    
    if (cacheFile) {
      console.log(`   📄 Cache file: ${cacheFile}`);
      
      // Check file content
      const filePath = require('path').join(cacheDir, cacheFile);
      const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      console.log(`   🔍 File type field: "${fileContent.type}"`);
      
      if (fileContent.type === testCase.expectedDecodedKey) {
        console.log('   ✅ Cache key is properly decoded (no [object Object])');
      } else if (fileContent.type.includes('[object Object]')) {
        console.log('   ❌ Still contains [object Object]!');
      } else {
        console.log(`   ⚠️  Unexpected cache key format: ${fileContent.type}`);
      }
    } else {
      console.log('   ❌ Cache file not found');
    }
    
  } catch (error) {
    console.log(`   ❌ Test failed: ${error.message}`);
  }
}
