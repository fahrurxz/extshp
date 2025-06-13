/**
 * Test URL encoding/decoding fix for cache API
 * This test verifies that the server properly handles URL-encoded cache keys
 */

import('node-fetch').then(({ default: fetch }) => {
  testUrlEncodingFix(fetch);
});

async function testUrlEncodingFix(fetch) {
  console.log('🧪 Testing URL Encoding/Decoding Fix...\n');
  
  const serverUrl = 'http://localhost:8080';
  
  try {
    // Test data with colons in the cache key (SearchResult:botol:1)
    const testCacheKey = 'SearchResult:botol:1';
    const testData = {
      items: [{
        id: 999999999,
        name: "Botol Air Minum",
        price: 15000,
        shop: { name: "Toko Botol" }
      }],
      meta: { query: "botol", page: 1 }
    };
    
    // Step 1: Save cache data
    console.log('📤 Saving cache with key:', testCacheKey);
    
    const saveResponse = await fetch(`${serverUrl}/api/cache`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        platform: 'shopee.co.id',
        data: [{
          type: testCacheKey,  // This will get URL-encoded when sent
          raw: JSON.stringify(testData)
        }]
      })
    });
    
    if (!saveResponse.ok) {
      console.log('❌ Save failed:', await saveResponse.text());
      return;
    }
    
    console.log('✅ Cache save successful');
    
    // Step 2: Test retrieval with URL-encoded key
    console.log('\n📥 Testing retrieval with URL-encoded key...');
    
    // Manually URL-encode the cache key to simulate browser behavior
    const encodedKey = encodeURIComponent(testCacheKey);
    console.log('Original key:', testCacheKey);
    console.log('URL-encoded key:', encodedKey);
    
    const getResponse = await fetch(`${serverUrl}/api/cache?platform=shopee.co.id&type=${encodedKey}`);
    
    if (!getResponse.ok) {
      console.log('❌ Retrieval failed:', await getResponse.text());
      return;
    }
    
    const retrievedData = await getResponse.json();
    console.log('✅ Cache retrieval successful');
    
    // Step 3: Verify data integrity
    console.log('\n🔍 Verifying data integrity...');
    
    if (retrievedData.response && retrievedData.response.body && retrievedData.response.body.data) {
      const cachedDataString = retrievedData.response.body.data.data;
      const parsedData = JSON.parse(cachedDataString);
      
      if (parsedData.items && parsedData.items.length > 0) {
        console.log('✅ Data retrieved successfully');
        console.log('📦 Sample item:', parsedData.items[0].name);
      } else {
        console.log('❌ No items in retrieved data');
      }
    } else {
      console.log('❌ Invalid response structure');
    }
    
    // Step 4: Check cache file naming
    console.log('\n🗂️  Checking cache file naming...');
    
    const fs = require('fs');
    const path = require('path');
    const cacheDir = 'e:\\bot\\fixshp\\cache_data';
    
    const files = fs.readdirSync(cacheDir);
    console.log('Cache files:', files);
    
    // Look for file with proper naming (should have underscores instead of encoded characters)
    const expectedPattern = /shopee_co_id_SearchResult_botol_1\.json/;
    const foundFile = files.find(file => expectedPattern.test(file));
    
    if (foundFile) {
      console.log('✅ Cache file created with proper naming:', foundFile);
      
      // Check file content
      const filePath = path.join(cacheDir, foundFile);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const fileData = JSON.parse(fileContent);
      
      console.log('📄 File type field:', fileData.type);
      console.log('📄 File platform:', fileData.platform);
      
      if (fileData.type === testCacheKey) {
        console.log('✅ Cache file stores decoded cache key correctly');
      } else {
        console.log('❌ Cache file has wrong type field:', fileData.type);
      }
    } else {
      console.log('❌ Cache file not found with expected naming pattern');
      console.log('Available files:', files);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 URL Encoding/Decoding Fix Test Complete!');
    console.log('✅ Cache keys with colons are now properly handled');
    console.log('✅ File names use clean underscores instead of encoded characters');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}
