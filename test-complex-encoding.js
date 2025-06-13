/**
 * Test complex URL encoding scenarios
 */

import('node-fetch').then(({ default: fetch }) => {
  testComplexUrlEncoding(fetch);
});

async function testComplexUrlEncoding(fetch) {
  console.log('🧪 Testing Complex URL Encoding Scenarios...\n');
  
  const serverUrl = 'http://localhost:8080';
  
  const testCases = [
    {
      name: 'Simple search with colon',
      key: 'SearchResult:baju:0',
      expectedFile: 'shopee_co_id_SearchResult_baju_0.json'
    },
    {
      name: 'Search with special chars',
      key: 'SearchResult:keyword=sepatu%20nike:page=2',
      expectedFile: 'shopee_co_id_SearchResult_keyword_sepatu_20nike_page_2.json'
    },
    {
      name: 'Product detail',
      key: 'ProductDetail:12345:shopid=67890',
      expectedFile: 'shopee_co_id_ProductDetail_12345_shopid_67890.json'
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`📝 Testing: ${testCase.name}`);
    console.log(`   Key: ${testCase.key}`);
    console.log(`   Expected file: ${testCase.expectedFile}`);
    
    try {
      // Save test data
      const saveResponse = await fetch(`${serverUrl}/api/cache`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'shopee.co.id',
          data: [{
            type: testCase.key,
            raw: JSON.stringify({ test: 'data', key: testCase.key })
          }]
        })
      });
      
      if (saveResponse.ok) {
        console.log('   ✅ Save successful');
        
        // Test retrieval
        const encodedKey = encodeURIComponent(testCase.key);
        const getResponse = await fetch(`${serverUrl}/api/cache?platform=shopee.co.id&type=${encodedKey}`);
        
        if (getResponse.ok) {
          console.log('   ✅ Retrieval successful');
        } else {
          console.log('   ❌ Retrieval failed');
        }
      } else {
        console.log('   ❌ Save failed');
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
  
  // Check all generated files
  console.log('🗂️  Generated cache files:');
  const fs = require('fs');
  const cacheDir = 'e:\\bot\\fixshp\\cache_data';
  const files = fs.readdirSync(cacheDir);
  
  files.forEach(file => {
    console.log(`   📄 ${file}`);
  });
  
  console.log('\n✅ Complex URL encoding test complete!');
}
