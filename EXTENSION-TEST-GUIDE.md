# Extension Testing Guide

## Prerequisites

1. **Server Running**: Ensure the cache server is running on localhost:8080
   ```bash
   cd e:\bot\fixshp
   node server.js
   ```

2. **Extension Loaded**: Load the extension in Chrome/Edge:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select this folder

## Testing Scenarios

### 1. Basic Extension Functionality Test

**Test Shopee Search Page:**
1. Go to `https://shopee.co.id/search?keyword=tas`
2. Check browser console for logs:
   - Should see "Te.validate() called with..." logs
   - Should see cache miss message initially
   - Should see cache save after data fetch
3. Refresh the page
   - Should see cache hit on subsequent loads

**Test Tokopedia Search Page:**
1. Go to `https://www.tokopedia.com/search?st=product&q=tas`
2. Check similar console logs for Tokopedia platform

### 2. Cache Flow Verification

**Initial Request (Cache Miss):**
1. Clear cache: `DELETE http://localhost:8080/api/cache`
2. Visit a product search page
3. Monitor server logs for:
   - GET request returning 503 (cache miss)
   - Extension fetching from marketplace API
   - POST request saving data to cache

**Subsequent Request (Cache Hit):**
1. Refresh the same page
2. Monitor server logs for:
   - GET request returning 200 with cached data
   - No additional API calls to marketplace

### 3. Development Features Test

**Signature Validation Bypass:**
- Extension should work on localhost without signature validation
- Check console for "development mode: bypassing signature validation" message

**Enhanced Logging:**
- All cache operations should be logged to console
- Server operations logged to `logs/cache-YYYY-MM-DD.log`

### 4. Error Handling Test

**Server Downtime:**
1. Stop the cache server
2. Visit a product page
3. Extension should gracefully degrade (may use local storage or direct API)

**Invalid Data:**
1. Manually corrupt cache data
2. Extension should handle errors gracefully

### 5. Platform Detection Test

**Shopee Domains:**
- shopee.co.id
- shopee.sg
- shopee.com.my

**Tokopedia Domains:**
- tokopedia.com
- www.tokopedia.com

### 6. Page Type Detection Test

Test on different page types:
- Search results: `/search?keyword=...`
- Category pages: `/category/...`
- Shop pages: `/shop/...`
- Product detail pages: `/product/...`

## Expected Behaviors

### Login Bypass
- Extension should always treat user as logged in
- No login prompts or authentication checks
- All features should be available immediately

### Cache Operations
- First visit: Cache miss → API call → Cache save
- Subsequent visits: Cache hit → Immediate data display
- Data should persist across browser sessions

### Error Recovery
- Network errors should not break the extension
- Invalid responses should be handled gracefully
- Extension should continue working even with partial failures

## Monitoring Tools

### Real-time Server Monitor
```bash
node monitor.js
```

### Manual API Testing
```bash
# Test cache miss
curl "http://localhost:8080/api/cache?platform=shopee.co.id&type=SearchResult:keyword=test:1"

# Test cache save
curl -X POST "http://localhost:8080/api/cache" \
  -H "Content-Type: application/json" \
  -d '{"platform":"shopee.co.id","data":[{"type":"SearchResult:keyword=test:1","raw":"{}"}]}'
```

### Browser Developer Tools
- **Console**: Check for extension logs and errors
- **Network**: Monitor API calls to marketplace and cache server
- **Application/Storage**: Check local storage and extension storage

## Troubleshooting

### Extension Not Working
1. Check if extension is loaded and enabled
2. Verify server is running on port 8080
3. Check browser console for errors
4. Ensure you're on a supported marketplace domain

### Cache Not Working
1. Check server logs in `logs/` folder
2. Verify network connectivity to localhost:8080
3. Test cache endpoints manually with curl
4. Check if cache directory has proper permissions

### Data Not Displaying
1. Verify page URL matches expected patterns
2. Check if marketplace has changed their API structure
3. Monitor network requests to see if data is being fetched
4. Check extension popup for any error messages

## Success Indicators

✅ Extension loads without errors
✅ Console shows detailed logging
✅ Cache miss/hit cycle works correctly
✅ Data persists across page refreshes
✅ Server logs show proper request/response flow
✅ Extension works on both Shopee and Tokopedia
✅ No authentication or login prompts
✅ Graceful error handling in all scenarios
