// Debug script to see the raw Shopee API data structure
const fs = require('fs');

// Check if there are any log files that might contain the raw API response
const logFiles = fs.readdirSync('./').filter(f => f.endsWith('.log') || f.includes('log'));
console.log('Available log files:', logFiles);

// Try to find domCacheMap logs
if (fs.existsSync('server.log')) {
  const logContent = fs.readFileSync('server.log', 'utf8');
  const lines = logContent.split('\n');
  
  // Look for domCacheMap data
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('domCacheMap result:')) {
      console.log('Found domCacheMap log:', lines[i]);
      // Try to find the next few lines that might contain the data
      for (let j = i; j < Math.min(i + 10, lines.length); j++) {
        if (lines[j].includes('items') || lines[j].includes('body')) {
          console.log('Related line:', lines[j]);
        }
      }
      break;
    }
  }
}

console.log('\nTrying to simulate what the extension might get from domCacheMap...');

// Simulate what getDomCacheMap might return based on typical Shopee API structure
const typicalShopeeApiResponse = {
  body: {
    items: [
      {
        itemid: 27982394871,
        name: "KAOS POLOS LENGAN PENDEK PRIA WANITA DEWASA ANAK COTTON COMBED 30S",
        shopid: 322929592,
        shop_name: "GROSIR KAOS POLOS MURAH",
        price: 3500000, // in cents (35,000 IDR)
        image: "id-11134207-7r98y-lqr6j8vkhc9va2",
        historical_sold: 1847,
        item_rating: {
          rating_star: 4.8,
          rating_count: [156, 0, 0, 0, 0]
        },
        shop_location: "KOTA BANDUNG",
        stock: 999,
        liked_count: 45,
        is_official_shop: false,
        shopee_verified: true,
        is_preferred_plus_seller: false,
        ctime: 1625097600, // timestamp
        description: "Kaos polos berkualitas tinggi"
      }
    ],
    total_count: 2000
  }
};

console.log('\nExpected domCacheMap structure:');
console.log('Item fields:', Object.keys(typicalShopeeApiResponse.body.items[0]));
console.log('Sample item:');
console.log(JSON.stringify(typicalShopeeApiResponse.body.items[0], null, 2));
