import('node-fetch').then(({ default: fetch }) => {
  debugCacheResponse(fetch);
});

async function debugCacheResponse(fetch) {
  try {
    const response = await fetch('http://localhost:8080/api/cache?platform=shopee.co.id&type=SearchResult:baju:0');
    const data = await response.json();
    console.log('Cache response structure:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}
