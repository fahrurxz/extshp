#!/usr/bin/env node
/**
 * Tokpee Mock Server
 * Bypasses authentication and always returns status: true
 * Use this when you don't have access to login credentials
 */

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = 8080;

// Simple in-memory cache storage
const cacheStorage = new Map();

console.log('🎭 Tokpee Mock Server - Cache Storage Initialized');

// Z85 encoding for signature generation (simplified version)
const Z85_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#';

function z85Encode(data) {
    // Simplified Z85 encoding for demo purposes
    // In a real implementation, this would be more complex
    const encoded = Buffer.from(data).toString('base64');
    return encoded;
}

// Generate a proper signature that the extension can validate
function generateMockSignature(responseData, clientTime) {
    try {
        // Generate a mock hash using the same pattern as the extension expects
        const salt = crypto.randomBytes(8).toString('hex');
        const dataHash = crypto.createHash('sha256').update(JSON.stringify(responseData)).digest('hex').substring(0, 16);
        
        // Create signature in the format: hash-salt-chunksize
        const signatureData = `${dataHash}-${salt}-0`;
        
        // Encode using a simple method that can be "decoded" by the extension
        const encoded = z85Encode(signatureData);
        
        return encoded;
    } catch (error) {
        console.warn('Error generating signature:', error);
        // Fallback to a valid format
        return z85Encode('0000000000000000-abcd1234-0');
    }
}

// Configure CORS - simplified version
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Token', 'X-W', 'Accept']
}));

app.use(express.json({ limit: '50mb' })); // Increase payload limit for large API responses
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Mock authentication data
const mockAuthData = {
    deviceId: 'mock-device-12345',
    userId: 'mock-user-67890',
    userName: 'Mock User',
    signature: 'mock-signature',
    finger: 'mock-finger',
    fdiv: 'mock-fdiv'
};

// Function to generate realistic search data for any keyword
function generateRealisticSearchData(keyword, page = 0) {
    const itemsPerPage = 20;
    const startIndex = page * itemsPerPage;
    
    // Define keyword-specific product variations
    const productVariations = {
        'celana': ['Celana Jeans Pria Slim Fit', 'Celana Chino Wanita Trendy', 'Celana Cargo Tactical', 'Celana Kulot Muslimah'],
        'sepatu': ['Sepatu Sneakers Sport', 'Sepatu Formal Kulit', 'Sepatu Running Nike', 'Sepatu Heels Wanita'],
        'tas': ['Tas Ransel Laptop', 'Tas Selempang Kulit', 'Tas Tangan Wanita', 'Tas Travel Backpack'],
        'baju': ['Baju Kemeja Pria', 'Baju Atasan Wanita', 'Baju Kaos Polos', 'Baju Dress Muslim']
    };
    
    // Get variations for keyword or use generic ones
    const variations = productVariations[keyword.toLowerCase()] || [`${keyword} Premium`, `${keyword} Original`, `${keyword} Import`];
    
    const items = [];
    const totalProducts = 80 + Math.floor(Math.random() * 200);
    
    for (let i = 0; i < itemsPerPage && (startIndex + i) < totalProducts; i++) {
        const productIndex = startIndex + i;
        const variation = variations[i % variations.length];
        const basePrice = 20000 + Math.floor(Math.random() * 300000);
        const discountPercent = Math.random() < 0.7 ? Math.floor(Math.random() * 50) + 10 : 0;
        const currentPrice = discountPercent > 0 ? Math.floor(basePrice * (100 - discountPercent) / 100) : basePrice;
        
        items.push({
            item_basic: {
                itemid: 100000000 + productIndex,
                shopid: 1000000 + Math.floor(Math.random() * 900000),
                name: `${variation} REAL QUALITY`,
                price: currentPrice * 100,
                currency: "IDR",
                stock: Math.floor(Math.random() * 500) + 50,
                sold: Math.floor(Math.random() * 2000) + 100,
                rating_star: 4.0 + Math.random() * 1.0
            },
            shop_location: ["Jakarta", "Surabaya", "Bandung", "Medan"][Math.floor(Math.random() * 4)],
            is_official_shop: Math.random() < 0.3
        });
    }
    
    return {
        data: {
            items: items,
            total_count: totalProducts,
            nomore: startIndex + itemsPerPage >= totalProducts
        }
    };
}

// Function to transform search results into product detail format for analytics
function transformSearchToProductDetail(searchItem, keyword = 'unknown') {
    const item = searchItem.item_basic || searchItem;
    const currentTime = Date.now();
    const createdDate = new Date(currentTime - (Math.random() * 365 * 24 * 60 * 60 * 1000)); // Random date within last year
    
    // Generate realistic analytics data based on basic search info
    const totalSold = item.sold || Math.floor(Math.random() * 1000) + 100;
    const totalViews = Math.floor(totalSold * (10 + Math.random() * 20)); // 10-30x views vs sales
    const successRate = 0.85 + Math.random() * 0.1; // 85-95% success rate
    const successfulTransactions = Math.floor(totalSold * successRate);
    const onprocessOrders = Math.floor(totalSold * 0.05); // ~5% in process
    const rejectedTransactions = totalSold - successfulTransactions;
    
    // Calculate monthly breakdown
    const monthsOld = Math.max(1, Math.floor((currentTime - createdDate.getTime()) / (30 * 24 * 60 * 60 * 1000)));
    const soldThisMonth = Math.floor(totalSold / monthsOld * (0.8 + Math.random() * 0.4));
    const soldLastMonth = Math.floor(totalSold / monthsOld * (0.8 + Math.random() * 0.4));
    
    const price = item.price / 100; // Convert from cents to rupiah
    const stock = item.stock || Math.floor(Math.random() * 200) + 50;
    
    return {
        lq: {
            basicInfo: {
                id: item.itemid?.toString() || Math.floor(Math.random() * 1000000000).toString(),
                url: `https://shopee.co.id/product-${keyword}-${item.itemid}`,
                alias: `${keyword}-product`,
                name: item.name || `${keyword} Product`,
                createdAt: createdDate.toISOString(),
                txStats: {
                    sold: totalSold,
                    success: successfulTransactions,
                    onprocess: onprocessOrders,
                    completed: successfulTransactions,
                    transactionReject: rejectedTransactions,
                    itemSoldMth0: soldThisMonth,
                    itemSoldMth1: soldLastMonth,
                    totalSold: totalSold,
                    soldThisMonth: soldThisMonth,
                    soldLastMonth: soldLastMonth
                },
                stats: {
                    view: totalViews,
                    countView: totalViews,
                    rating: item.rating_star || (4.0 + Math.random() * 1.0),
                    countReview: Math.floor(totalSold * 0.3), // ~30% of buyers leave reviews
                    countSold: totalSold,
                    starAverage: item.rating_star || (4.0 + Math.random() * 1.0)
                },
                price: price,
                stock: stock,
                shopInfo: {
                    shopId: item.shopid?.toString() || Math.floor(Math.random() * 1000000).toString(),
                    shopName: `${keyword} Store`,
                    shopLocation: item.shop_location || "Jakarta",
                    isOfficial: item.is_official_shop || false
                }
            },
            components: [
                {
                    name: "new_variant_options",
                    data: [{
                        children: [
                            {
                                productID: item.itemid?.toString() || "123456789",
                                price: price,
                                stock: { stock: stock, available: stock }
                            }
                        ],
                        totalStock: stock,
                        hasVariant: false
                    }]
                },
                {
                    name: "product_rating",
                    data: {
                        avgStar: item.rating_star || (4.0 + Math.random() * 1.0),
                        totalCount: Math.floor(totalSold * 0.3)
                    }
                }
            ]
        },
        // Additional analytics data for comprehensive analysis
        analytics: {
            revenue: totalSold * price,
            revenuePerMonth: (totalSold * price) / monthsOld,
            soldPerMonth: totalSold / monthsOld,
            viewPerMonth: totalViews / monthsOld,
            conversion: successfulTransactions / totalViews,
            trend: (soldThisMonth - soldLastMonth) / Math.max(soldLastMonth, 1),
            monthsOld: monthsOld
        }
    };
}

// Helper function to generate mock successful responses
function createMockResponse(data = {}) {
    const baseResponse = {
        status: true,
        message: "Success",
        data: data,
        timestamp: Date.now(),
        mock: true // Indicator that this is from mock server
    };
    
    // Extract sign from data if it exists and put it at root level
    if (data.sign) {
        baseResponse.sign = data.sign;
        // Remove sign from nested data to avoid duplication
        delete data.sign;
    }
    
    // Extract ftime from data if it exists and put it at root level
    if (data.ftime) {
        baseResponse.ftime = data.ftime;
        delete data.ftime;
    }
    
    return baseResponse;
}


// Note: mockResponses is already defined earlier in the code, removing duplicate declaration

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'Tokpee Mock Server',
        status: 'running',
        message: 'This server processes real data from API cache requests',
        endpoints: Object.keys(mockResponses),
        usage: {
            cache_api: {
                description: 'Send data to /api/cache and receive it as processable response.body',
                method: 'POST',
                url: '/api/cache',
                example_request: {
                    platform: 'shopee',
                    type: 'SearchResult',
                    data: JSON.stringify({
                        items: [
                            {
                                item_basic: {
                                    itemid: 123456789,
                                    name: "Product Name",
                                    price: 10000000, // in cents
                                    stock: 100
                                }
                            }
                        ]
                    })
                },
                example_response: {
                    status: true,
                    response: {
                        body: "// Your data here as JSON object that can be processed with .map()"
                    }
                }
            },
            test_endpoint: {
                description: 'Test the cache functionality',
                method: 'POST',
                url: '/api/test-cache',
                example: 'Send testData in request body'
            }
        },
        note: 'Server now processes real data from requests instead of using dummy data'
    });
});

// Get current mock auth data
app.get('/get-auth', (req, res) => {
    res.json(mockAuthData);
});

// Set auth data (for compatibility)
app.post('/set-auth', (req, res) => {
    console.log('Auth data received (ignored in mock mode):', req.body);
    res.json({ success: true, message: 'Auth data set (mock mode)' });
});

// Import specific mock data
// const { searchResultMockData } = require('./search_result_tas_shop_mock.js');

// Simple mock data for search results

// Function to generate realistic search data for any keyword
function generateRealisticSearchData(keyword, page = 0) {
    const itemsPerPage = 20;
    const startIndex = page * itemsPerPage;
    
    // Define keyword-specific product variations
    const productVariations = {
        'celana': [
            'Celana Jeans Pria Slim Fit', 'Celana Chino Wanita Trendy', 'Celana Cargo Tactical', 
            'Celana Kulot Muslimah', 'Celana Pendek Santai', 'Celana Formal Kerja'
        ],
        'sepatu': [
            'Sepatu Sneakers Sport', 'Sepatu Formal Kulit', 'Sepatu Running Nike', 
            'Sepatu Heels Wanita', 'Sepatu Casual Pria', 'Sepatu Boots Adventure'
        ],
        'tas': [
            'Tas Ransel Laptop', 'Tas Selempang Kulit', 'Tas Tangan Wanita', 
            'Tas Travel Backpack', 'Tas Sekolah Anak', 'Tas Clutch Party'
        ],
        'baju': [
            'Baju Kemeja Pria', 'Baju Atasan Wanita', 'Baju Kaos Polos', 
            'Baju Dress Muslim', 'Baju Polo Shirt', 'Baju Blouse Kantor'
        ]
    };
    
    // Get variations for keyword or use generic ones
    const variations = productVariations[keyword.toLowerCase()] || 
        productVariations[Object.keys(productVariations).find(k => keyword.toLowerCase().includes(k))] ||
        [`${keyword} Premium`, `${keyword} Original`, `${keyword} Import`, `${keyword} Branded`, `${keyword} Murah`];
    
    const items = [];
    const totalProducts = 80 + Math.floor(Math.random() * 200); // 80-280 total products
    
    for (let i = 0; i < itemsPerPage; i++) {
        const productIndex = startIndex + i;
        if (productIndex >= totalProducts) break;
        
        const variation = variations[i % variations.length];
        const basePrice = 20000 + Math.floor(Math.random() * 300000); // 20K-320K
        const discountPercent = Math.random() < 0.7 ? Math.floor(Math.random() * 50) + 10 : 0; // 70% chance of discount
        const currentPrice = discountPercent > 0 ? Math.floor(basePrice * (100 - discountPercent) / 100) : basePrice;
        
        const item = {
            item_basic: {
                itemid: 100000000 + productIndex,
                shopid: 1000000 + Math.floor(Math.random() * 900000),
                name: `${variation} REAL QUALITY`,
                price: currentPrice * 100, // Convert to cents
                price_min: currentPrice * 100,
                price_max: currentPrice * 100,
                price_before_discount: discountPercent > 0 ? basePrice * 100 : null,
                currency: "IDR",
                stock: Math.floor(Math.random() * 500) + 50,
                sold: Math.floor(Math.random() * 2000) + 100,
                rating_star: 4.0 + Math.random() * 1.0,
                rating_count: [
                    Math.floor(Math.random() * 500) + 100, // 5 stars
                    Math.floor(Math.random() * 100) + 20,  // 4 stars  
                    Math.floor(Math.random() * 50) + 10,   // 3 stars
                    Math.floor(Math.random() * 20) + 5,    // 2 stars
                    Math.floor(Math.random() * 10) + 2     // 1 star
                ],
                discount: discountPercent > 0 ? `${discountPercent}%` : null,
                wholesale_tier_list: []
            },
            shop_location: ["Jakarta", "Surabaya", "Bandung", "Medan", "Semarang"][Math.floor(Math.random() * 5)],
            is_official_shop: Math.random() < 0.3, // 30% chance of official shop
            is_mart: Math.random() < 0.1, // 10% chance of mart
            is_preferred: Math.random() < 0.4, // 40% chance of preferred
            shop_rating: 4.0 + Math.random() * 1.0,
            ads_keyword: Math.random() < 0.2 ? keyword : null, // 20% chance of being ads
            is_adult: false,
            badgeIconList: [],
            shopInfo: {
                shop_rating: 4.0 + Math.random() * 1.0,
                follower_count: Math.floor(Math.random() * 10000) + 500
            }
        };
        
        items.push(item);
    }
    
    return {
        data: {
            items: items,
            total_count: totalProducts,
            nomore: startIndex + itemsPerPage >= totalProducts,
            sections: [],
            filters: [],
            sort_options: [],
            suggestion_algorithm: "default"
        },
        generation_info: {
            keyword: keyword,
            page: page,
            items_generated: items.length,
            total_available: totalProducts,
            generated_at: Date.now(),
            realistic_pricing: true,
            realistic_ratings: true,
            geographic_distribution: true
        }
    };
}

// Helper function to generate mock successful responses
function createMockResponse(data = {}) {
    const baseResponse = {
        status: true,
        message: "Success",
        data: data,
        timestamp: Date.now(),
        mock: true // Indicator that this is from mock server
    };
    
    // Extract sign from data if it exists and put it at root level
    if (data.sign) {
        baseResponse.sign = data.sign;
        // Remove sign from nested data to avoid duplication
        delete data.sign;
    }
    
    // Extract ftime from data if it exists and put it at root level
    if (data.ftime) {
        baseResponse.ftime = data.ftime;
        delete data.ftime;
    }
    
    return baseResponse;
}

// Mock Z85 encoded data for verification endpoint (mimics real response)
const mockZ85EncodedData = "nm&qV[3+RbZ*k:hYLS:W8bz]HMOe?J]Oa{+kWUcEHL6)7nGhQ0]QKcT8K9C7ELR?6JJ";

// Mock responses for different endpoints
const mockResponses = {
    '/api/verify': {
        status: true,
        data: mockZ85EncodedData, // Z85 encoded data containing user info
        ftime: Date.now(),
        sign: "mock-signature-verify-123456789"
    },
    '/api/init': {
        status: true,
        data: mockZ85EncodedData, // Z85 encoded data containing slicer, auth string, and time
        ftime: Date.now(),
        sign: "mock-signature-init-123456789"
    },    '/api/cache': {
        status: true,
        need_update: false,
        data: {
            lq: {
                basicInfo: {
                    id: "123456789",
                    url: "https://shopee.co.id/product-test",
                    alias: "product-test",
                    name: "CHIEF Shampoo Dandruff Eliminate",
                    description: "Shampoo untuk mengatasi ketombe dan rambut rontok",
                    stats: {
                        countReview: 742,
                        rating: 4.9,
                        countView: 15420,
                        countSold: 547,
                        reviewCount: 742,
                        starAverage: 4.9
                    },
                    txStats: {
                        itemSoldPaymentVerified: 547,
                        countSold: 547,
                        transactionSuccess: 520,
                        transactionReject: 5,
                        itemSoldMth1: 87,
                        itemSoldMth0: 92,
                        totalSold: 1205,
                        soldThisMonth: 92,
                        soldLastMonth: 87
                    },
                    price: {
                        minPrice: 99000,
                        maxPrice: 99000,
                        currentPrice: 99000,
                        originalPrice: 129000,
                        discount: 23,
                        priceRange: "Rp99.000"
                    },
                    shopInfo: {
                        shopId: "987654321",
                        shopName: "CHIEF Official Store",
                        shopLocation: "Jakarta",
                        shopRating: 4.8,
                        isPreferred: true,
                        isOfficial: true
                    }
                },
                components: [
                    {
                        name: "new_variant_options", 
                        data: [{
                            children: [
                                {
                                    productID: "123456789",
                                    optionName: ["250ml"],
                                    price: 99000,
                                    stock: { stock: 150, available: 150 },
                                    modelId: 1234567890123
                                }
                            ],
                            totalStockFmt: "150",
                            variants: [],
                            totalStock: 150,
                            hasVariant: false
                        }]
                    },
                    {
                        name: "product_rating",
                        data: {
                            ratings: [
                                { key: 5, count: 580, percentage: 78.2 },
                                { key: 4, count: 120, percentage: 16.2 },
                                { key: 3, count: 30, percentage: 4.0 },
                                { key: 2, count: 8, percentage: 1.1 },
                                { key: 1, count: 4, percentage: 0.5 }
                            ],
                            avgStar: 4.9,
                            totalCount: 742
                        }
                    }
                ]
            },
            dp: {
                productView: 15420,
                wishlistCount: 234,
                likeCount: 892,
                shareCount: 156
            },
            // Data statistik untuk extension
            rentang_harga: [15000, 450000],
            total_terjual: 2580,
            omset_per_bulan: 15200000,
            revenue: 45600000,
            sold_count: 2580,
            trend_penjualan: 12.5,
            trend_revenue: 8.7,
            date: Date.now(),
            cached_at: Date.now(),
            search_data: {
                total_products: 150,
                price_min: 15000,
                price_max: 450000,
                total_sold: 2580,
                total_revenue: 45600000,
                revenue_per_month: 15200000,
                sold_per_month: 860,
                sold_30_days: 1290,
                revenue_30_days: 23400000,
                trend_sales: 12.5,
                trend_revenue: 8.7,
                products: [
                    {
                        id: "123456789",
                        itemid: 123456789,
                        shopid: 987654321,
                        name: "CHIEF Shampoo Dandruff Eliminate",
                        price: { value: 99000, min: 99000, max: 99000 },
                        price_min: 99000,
                        price_max: 99000,
                        stock: { value: 150, available: 150 },
                        historical_sold: 547,
                        sold: 547,
                        variant: { isVariant: false, count: 1 },
                        rating_star: 4.9,
                        rating_count: [580, 120, 30, 8, 4],
                        media: [{ 
                            urlThumbnail: "https://down-id.img.susercontent.com/file/mock-product-image.jpg",
                            url: "https://down-id.img.susercontent.com/file/mock-product-image-full.jpg"
                        }],
                        shop_location: "Jakarta",
                        is_official_shop: true,
                        is_preferred_plus_seller: true
                    }                ]
            }
        },
        ftime: Date.now(),
        sign: "mock-signature-cache-123456789"
    },
    '/api/user/info': {
        status: true,
        data: {
            id: mockAuthData.userId,
            name: mockAuthData.userName,
            email: 'mock@example.com',
            subscription: 'premium',
            plan: 'premium',
            credits: 1000,
            remaining_credits: 1000,
            features: ['search_analysis', 'product_analysis', 'shop_analysis'],            settings: {
                theme: 'light',
                autoRefresh: true,
                notifications: true,
                defaultView: 'grid'
            },
            profile: {
                avatar: 'https://via.placeholder.com/100x100',
                joinDate: '2024-01-01',
                lastLogin: Date.now()
            }
        },
        ftime: Date.now(),
        sign: "mock-signature-user-123456789"
    },
    '/api/notification': {
        status: true,
        data: [
            {
                id: 'notif-001',
                title: 'Welcome to Mock Mode',
                message: 'You are using Tokpee in mock mode. All API calls will return status: true.',
                type: 'info',
                date: Date.now(),
                read: false
            },
            {
                id: 'notif-002', 
                title: 'Mock Data Update',
                message: 'Your mock data has been updated with realistic values.',
                type: 'success',
                date: Date.now() - 3600000,
                read: false
            }
        ],
        count: 2,
        unread: 2,
        ftime: Date.now(),
        sign: "mock-signature-notification-123456789"
    },
    '/api/log': {
        status: true,
        message: 'Log saved successfully (mock mode)',
        ftime: Date.now(),
        sign: "mock-signature-log-123456789"
    },
    '/api/web/claim/v1/status': {
        status: true,
        data: {
            canClaim: true,
            nextClaim: Date.now() + 3600000,
            rewards: ['coins', 'points'],
            claimAmount: 10,
            dailyLimit: 50,
            totalClaimed: 25
        },
        ftime: Date.now(),
        sign: "mock-signature-claim-123456789"
    }
};

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'Tokpee Mock Server',
        status: 'running',
        message: 'This server processes real data from API cache requests',
        endpoints: Object.keys(mockResponses),
        usage: {
            cache_api: {
                description: 'Send data to /api/cache and receive it as processable response.body',
                method: 'POST',
                url: '/api/cache',
                example_request: {
                    platform: 'shopee',
                    type: 'SearchResult',
                    data: JSON.stringify({
                        items: [
                            {
                                item_basic: {
                                    itemid: 123456789,
                                    name: "Product Name",
                                    price: 10000000, // in cents
                                    stock: 100
                                }
                            }
                        ]
                    })
                },
                example_response: {
                    status: true,
                    response: {
                        body: "// Your data here as JSON object that can be processed with .map()"
                    }
                }
            },
            test_endpoint: {
                description: 'Test the cache functionality',
                method: 'POST',
                url: '/api/test-cache',
                example: 'Send testData in request body'
            }
        },
        note: 'Server now processes real data from requests instead of using dummy data'
    });
});

// Get current mock auth data
app.get('/get-auth', (req, res) => {
    res.json(mockAuthData);
});

// Set auth data (for compatibility)
app.post('/set-auth', (req, res) => {
    console.log('Auth data received (ignored in mock mode):', req.body);
    res.json({ success: true, message: 'Auth data set (mock mode)' });
});

// Import specific mock data
// const { searchResultMockData } = require('./search_result_tas_shop_mock.js');

// Simple mock data for search results
const searchResultMockData = {
    search_data: {
        keyword: "tas",
        total_products: 150,
        price_min: 15000,
        price_max: 750000,
        total_sold: 4500,
        total_revenue: 675000000,
        revenue_per_month: 225000000,
        sold_per_month: 1500,
        trend_sales: 20.5,
        trend_revenue: 25.3,
        products: []
    },
    stats: {
        review: { value: 4200 },
        sold: { value: 4500 },
        revenue: { value: 675000000 }
    },
    cached_at: Date.now(),
    platform: "shopee"
};

// Function to generate realistic search data for any keyword
function generateRealisticSearchData(keyword, page = 0) {
    const itemsPerPage = 20;
    const startIndex = page * itemsPerPage;
    
    // Define keyword-specific product variations
    const productVariations = {
        'celana': [
            'Celana Jeans Pria Slim Fit', 'Celana Chino Wanita Trendy', 'Celana Cargo Tactical', 
            'Celana Kulot Muslimah', 'Celana Pendek Santai', 'Celana Formal Kerja'
        ],
        'sepatu': [
            'Sepatu Sneakers Sport', 'Sepatu Formal Kulit', 'Sepatu Running Nike', 
            'Sepatu Heels Wanita', 'Sepatu Casual Pria', 'Sepatu Boots Adventure'
        ],
        'tas': [
            'Tas Ransel Laptop', 'Tas Selempang Kulit', 'Tas Tangan Wanita', 
            'Tas Travel Backpack', 'Tas Sekolah Anak', 'Tas Clutch Party'
        ],
        'baju': [
            'Baju Kemeja Pria', 'Baju Atasan Wanita', 'Baju Kaos Polos', 
            'Baju Dress Muslim', 'Baju Polo Shirt', 'Baju Blouse Kantor'
        ]
    };
    
    // Get variations for keyword or use generic ones
    const variations = productVariations[keyword.toLowerCase()] || 
        productVariations[Object.keys(productVariations).find(k => keyword.toLowerCase().includes(k))] ||
        [`${keyword} Premium`, `${keyword} Original`, `${keyword} Import`, `${keyword} Branded`, `${keyword} Murah`];
    
    const items = [];
    const totalProducts = 80 + Math.floor(Math.random() * 200); // 80-280 total products
    
    for (let i = 0; i < itemsPerPage; i++) {
        const productIndex = startIndex + i;
        if (productIndex >= totalProducts) break;
        
        const variation = variations[i % variations.length];
        const basePrice = 20000 + Math.floor(Math.random() * 300000); // 20K-320K
        const discountPercent = Math.random() < 0.7 ? Math.floor(Math.random() * 50) + 10 : 0; // 70% chance of discount
        const currentPrice = discountPercent > 0 ? Math.floor(basePrice * (100 - discountPercent) / 100) : basePrice;
        
        const item = {
            item_basic: {
                itemid: 100000000 + productIndex,
                shopid: 1000000 + Math.floor(Math.random() * 900000),
                name: `${variation} REAL QUALITY`,
                price: currentPrice * 100, // Convert to cents
                price_min: currentPrice * 100,
                price_max: currentPrice * 100,
                price_before_discount: discountPercent > 0 ? basePrice * 100 : null,
                currency: "IDR",
                stock: Math.floor(Math.random() * 500) + 50,
                sold: Math.floor(Math.random() * 2000) + 100,
                rating_star: 4.0 + Math.random() * 1.0,
                rating_count: [
                    Math.floor(Math.random() * 500) + 100, // 5 stars
                    Math.floor(Math.random() * 100) + 20,  // 4 stars  
                    Math.floor(Math.random() * 50) + 10,   // 3 stars
                    Math.floor(Math.random() * 20) + 5,    // 2 stars
                    Math.floor(Math.random() * 10) + 2     // 1 star
                ],
                discount: discountPercent > 0 ? `${discountPercent}%` : null,
                wholesale_tier_list: []
            },
            shop_location: ["Jakarta", "Surabaya", "Bandung", "Medan", "Semarang"][Math.floor(Math.random() * 5)],
            is_official_shop: Math.random() < 0.3, // 30% chance of official shop
            is_mart: Math.random() < 0.1, // 10% chance of mart
            is_preferred: Math.random() < 0.4, // 40% chance of preferred
            shop_rating: 4.0 + Math.random() * 1.0,
            ads_keyword: Math.random() < 0.2 ? keyword : null, // 20% chance of being ads
            is_adult: false,
            badgeIconList: [],
            shopInfo: {
                shop_rating: 4.0 + Math.random() * 1.0,
                follower_count: Math.floor(Math.random() * 10000) + 500
            }
        };
        
        items.push(item);
    }
    
    return {
        data: {
            items: items,
            total_count: totalProducts,
            nomore: startIndex + itemsPerPage >= totalProducts,
            sections: [],
            filters: [],
            sort_options: [],
            suggestion_algorithm: "default"
        },
        generation_info: {
            keyword: keyword,
            page: page,
            items_generated: items.length,
            total_available: totalProducts,
            generated_at: Date.now(),
            realistic_pricing: true,
            realistic_ratings: true,
            geographic_distribution: true
        }
    };
}

// Helper function to transform search results into product detail format for analytics
function transformSearchToProductDetail(searchItem, keyword = 'unknown') {
    const item = searchItem.item_basic || searchItem;
    const currentTime = Date.now();
    const createdDate = new Date(currentTime - (Math.random() * 365 * 24 * 60 * 60 * 1000)); // Random date within last year
    
    // Generate realistic analytics data based on basic search info
    const totalSold = item.sold || Math.floor(Math.random() * 1000) + 100;
    const totalViews = Math.floor(totalSold * (10 + Math.random() * 20)); // 10-30x views vs sales
    const successRate = 0.85 + Math.random() * 0.1; // 85-95% success rate
    const successfulTransactions = Math.floor(totalSold * successRate);
    const onprocessOrders = Math.floor(totalSold * 0.05); // ~5% in process
    const rejectedTransactions = totalSold - successfulTransactions;
    
    // Calculate monthly breakdown
    const monthsOld = Math.max(1, Math.floor((currentTime - createdDate.getTime()) / (30 * 24 * 60 * 60 * 1000)));
    const soldThisMonth = Math.floor(totalSold / monthsOld * (0.8 + Math.random() * 0.4));
    const soldLastMonth = Math.floor(totalSold / monthsOld * (0.8 + Math.random() * 0.4));
    
    const price = item.price / 100; // Convert from cents to rupiah
    const stock = item.stock || Math.floor(Math.random() * 200) + 50;
    
    return {
        lq: {
            basicInfo: {
                id: item.itemid?.toString() || Math.floor(Math.random() * 1000000000).toString(),
                url: `https://shopee.co.id/product-${keyword}-${item.itemid}`,
                alias: `${keyword}-product`,
                name: item.name || `${keyword} Product`,
                createdAt: createdDate.toISOString(),
                txStats: {
                    sold: totalSold,
                    success: successfulTransactions,
                    onprocess: onprocessOrders,
                    completed: successfulTransactions,
                    transactionReject: rejectedTransactions,
                    itemSoldMth0: soldThisMonth,
                    itemSoldMth1: soldLastMonth,
                    totalSold: totalSold,
                    soldThisMonth: soldThisMonth,
                    soldLastMonth: soldLastMonth
                },
                stats: {
                    view: totalViews,
                    countView: totalViews,
                    rating: item.rating_star || (4.0 + Math.random() * 1.0),
                    countReview: Math.floor(totalSold * 0.3), // ~30% of buyers leave reviews
                    countSold: totalSold,
                    starAverage: item.rating_star || (4.0 + Math.random() * 1.0)
                },
                price: price,
                stock: stock,
                shopInfo: {
                    shopId: item.shopid?.toString() || Math.floor(Math.random() * 1000000).toString(),
                    shopName: `${keyword} Store`,
                    shopLocation: item.shop_location || "Jakarta",
                    isOfficial: item.is_official_shop || false
                }
            },
            components: [
                {
                    name: "new_variant_options",
                    data: [{
                        children: [
                            {
                                productID: item.itemid?.toString() || "123456789",
                                price: price,
                                stock: { stock: stock, available: stock }
                            }
                        ],
                        totalStock: stock,
                        hasVariant: false
                    }]
                },
                {
                    name: "product_rating",
                    data: {
                        avgStar: item.rating_star || (4.0 + Math.random() * 1.0),
                        totalCount: Math.floor(totalSold * 0.3)
                    }
                }
            ]
        },
        // Additional analytics data for comprehensive analysis
        analytics: {
            revenue: totalSold * price,
            revenuePerMonth: (totalSold * price) / monthsOld,
            soldPerMonth: totalSold / monthsOld,
            viewPerMonth: totalViews / monthsOld,
            conversion: successfulTransactions / totalViews,
            trend: (soldThisMonth - soldLastMonth) / Math.max(soldLastMonth, 1),
            monthsOld: monthsOld
        }
    };
}

// Helper function to generate mock successful responses
function createMockResponse(data = {}) {
    const baseResponse = {
        status: true,
        message: "Success",
        data: data,
        timestamp: Date.now(),
        mock: true // Indicator that this is from mock server
    };
    
    // Extract sign from data if it exists and put it at root level
    if (data.sign) {
        baseResponse.sign = data.sign;
        // Remove sign from nested data to avoid duplication
        delete data.sign;
    }
    
    // Extract ftime from data if it exists and put it at root level
    if (data.ftime) {
        baseResponse.ftime = data.ftime;
        delete data.ftime;
    }
    
    return baseResponse;
}

// Mock Z85 encoded data for verification endpoint (mimics real response)
const mockZ85EncodedData = "nm&qV[3+RbZ*k:hYLS:W8bz]HMOe?J]Oa{+kWUcEHL6)7nGhQ0]QKcT8K9C7ELR?6JJ";

// Mock responses for different endpoints
const mockResponses = {
    '/api/verify': {
        status: true,
        data: mockZ85EncodedData, // Z85 encoded data containing user info
        ftime: Date.now(),
        sign: "mock-signature-verify-123456789"
    },
    '/api/init': {
        status: true,
        data: mockZ85EncodedData, // Z85 encoded data containing slicer, auth string, and time
        ftime: Date.now(),
        sign: "mock-signature-init-123456789"
    },    '/api/cache': {
        status: true,
        need_update: false,
        data: {
            lq: {
                basicInfo: {
                    id: "123456789",
                    url: "https://shopee.co.id/product-test",
                    alias: "product-test",
                    name: "CHIEF Shampoo Dandruff Eliminate",
                    description: "Shampoo untuk mengatasi ketombe dan rambut rontok",
                    stats: {
                        countReview: 742,
                        rating: 4.9,
                        countView: 15420,
                        countSold: 547,
                        reviewCount: 742,
                        starAverage: 4.9
                    },
                    txStats: {
                        itemSoldPaymentVerified: 547,
                        countSold: 547,
                        transactionSuccess: 520,
                        transactionReject: 5,
                        itemSoldMth1: 87,
                        itemSoldMth0: 92,
                        totalSold: 1205,
                        soldThisMonth: 92,
                        soldLastMonth: 87
                    },
                    price: {
                        minPrice: 99000,
                        maxPrice: 99000,
                        currentPrice: 99000,
                        originalPrice: 129000,
                        discount: 23,
                        priceRange: "Rp99.000"
                    },
                    shopInfo: {
                        shopId: "987654321",
                        shopName: "CHIEF Official Store",
                        shopLocation: "Jakarta",
                        shopRating: 4.8,
                        isPreferred: true,
                        isOfficial: true
                    }
                },
                components: [
                    {
                        name: "new_variant_options", 
                        data: [{
                            children: [
                                {
                                    productID: "123456789",
                                    optionName: ["250ml"],
                                    price: 99000,
                                    stock: { stock: 150, available: 150 },
                                    modelId: 1234567890123
                                }
                            ],
                            totalStockFmt: "150",
                            variants: [],
                            totalStock: 150,
                            hasVariant: false
                        }]
                    },
                    {
                        name: "product_rating",
                        data: {
                            ratings: [
                                { key: 5, count: 580, percentage: 78.2 },
                                { key: 4, count: 120, percentage: 16.2 },
                                { key: 3, count: 30, percentage: 4.0 },
                                { key: 2, count: 8, percentage: 1.1 },
                                { key: 1, count: 4, percentage: 0.5 }
                            ],
                            avgStar: 4.9,
                            totalCount: 742
                        }
                    }
                ]
            },
            dp: {
                productView: 15420,
                wishlistCount: 234,
                likeCount: 892,
                shareCount: 156
            },
            // Data statistik untuk extension
            rentang_harga: [15000, 450000],
            total_terjual: 2580,
            omset_per_bulan: 15200000,
            revenue: 45600000,
            sold_count: 2580,
            trend_penjualan: 12.5,
            trend_revenue: 8.7,
            date: Date.now(),
            cached_at: Date.now(),
            search_data: {
                total_products: 150,
                price_min: 15000,
                price_max: 450000,
                total_sold: 2580,
                total_revenue: 45600000,
                revenue_per_month: 15200000,
                sold_per_month: 860,
                sold_30_days: 1290,
                revenue_30_days: 23400000,
                trend_sales: 12.5,
                trend_revenue: 8.7,
                products: [
                    {
                        id: "123456789",
                        itemid: 123456789,
                        shopid: 987654321,
                        name: "CHIEF Shampoo Dandruff Eliminate",
                        price: { value: 99000, min: 99000, max: 99000 },
                        price_min: 99000,
                        price_max: 99000,
                        stock: { value: 150, available: 150 },
                        historical_sold: 547,
                        sold: 547,
                        variant: { isVariant: false, count: 1 },
                        rating_star: 4.9,
                        rating_count: [580, 120, 30, 8, 4],
                        media: [{ 
                            urlThumbnail: "https://down-id.img.susercontent.com/file/mock-product-image.jpg",
                            url: "https://down-id.img.susercontent.com/file/mock-product-image-full.jpg"
                        }],
                        shop_location: "Jakarta",
                        is_official_shop: true,
                        is_preferred_plus_seller: true
                    }                ]
            }
        },
        ftime: Date.now(),
        sign: "mock-signature-cache-123456789"
    },
    '/api/user/info': {
        status: true,
        data: {
            id: mockAuthData.userId,
            name: mockAuthData.userName,
            email: 'mock@example.com',
            subscription: 'premium',
            plan: 'premium',
            credits: 1000,
            remaining_credits: 1000,
            features: ['search_analysis', 'product_analysis', 'shop_analysis'],            settings: {
                theme: 'light',
                autoRefresh: true,
                notifications: true,
                defaultView: 'grid'
            },
            profile: {
                avatar: 'https://via.placeholder.com/100x100',
                joinDate: '2024-01-01',
                lastLogin: Date.now()
            }
        },
        ftime: Date.now(),
        sign: "mock-signature-user-123456789"
    },
    '/api/notification': {
        status: true,
        data: [
            {
                id: 'notif-001',
                title: 'Welcome to Mock Mode',
                message: 'You are using Tokpee in mock mode. All API calls will return status: true.',
                type: 'info',
                date: Date.now(),
                read: false
            },
            {
                id: 'notif-002', 
                title: 'Mock Data Update',
                message: 'Your mock data has been updated with realistic values.',
                type: 'success',
                date: Date.now() - 3600000,
                read: false
            }
        ],
        count: 2,
        unread: 2,
        ftime: Date.now(),
        sign: "mock-signature-notification-123456789"
    },
    '/api/log': {
        status: true,
        message: 'Log saved successfully (mock mode)',
        ftime: Date.now(),
        sign: "mock-signature-log-123456789"
    },
    '/api/web/claim/v1/status': {
        status: true,
        data: {
            canClaim: true,
            nextClaim: Date.now() + 3600000,
            rewards: ['coins', 'points'],
            claimAmount: 10,
            dailyLimit: 50,
            totalClaimed: 25
        },
        ftime: Date.now(),
        sign: "mock-signature-claim-123456789"
    }
};

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'Tokpee Mock Server',
        status: 'running',
        message: 'This server processes real data from API cache requests',
        endpoints: Object.keys(mockResponses),
        usage: {
            cache_api: {
                description: 'Send data to /api/cache and receive it as processable response.body',
                method: 'POST',
                url: '/api/cache',
                example_request: {
                    platform: 'shopee',
                    type: 'SearchResult',
                    data: JSON.stringify({
                        items: [
                            {
                                item_basic: {
                                    itemid: 123456789,
                                    name: "Product Name",
                                    price: 10000000, // in cents
                                    stock: 100
                                }
                            }
                        ]
                    })
                },
                example_response: {
                    status: true,
                    response: {
                        body: "// Your data here as JSON object that can be processed with .map()"
                    }
                }
            },
            test_endpoint: {
                description: 'Test the cache functionality',
                method: 'POST',
                url: '/api/test-cache',
                example: 'Send testData in request body'
            }
        },
        note: 'Server now processes real data from requests instead of using dummy data'
    });
});

// Get current mock auth data
app.get('/get-auth', (req, res) => {
    res.json(mockAuthData);
});

// Set auth data (for compatibility)
app.post('/set-auth', (req, res) => {
    console.log('Auth data received (ignored in mock mode):', req.body);
    res.json({ success: true, message: 'Auth data set (mock mode)' });
});

// Import specific mock data
// const { searchResultMockData } = require('./search_result_tas_shop_mock.js');

// Simple mock data for search results
const searchResultMockData = {
    search_data: {
        keyword: "tas",
        total_products: 150,
        price_min: 15000,
        price_max: 750000,
        total_sold: 4500,
        total_revenue: 675000000,
        revenue_per_month: 225000000,
        sold_per_month: 1500,
        trend_sales: 20.5,
        trend_revenue: 25.3,
        products: []
    },
    stats: {
        review: { value: 4200 },
        sold: { value: 4500 },
        revenue: { value: 675000000 }
    },
    cached_at: Date.now(),
    platform: "shopee"
};

// Function to generate realistic search data for any keyword
function generateRealisticSearchData(keyword, page = 0) {
    const itemsPerPage = 20;
    const startIndex = page * itemsPerPage;
    
    // Define keyword-specific product variations
    const productVariations = {
        'celana': [
            'Celana Jeans Pria Slim Fit', 'Celana Chino Wanita Trendy', 'Celana Cargo Tactical', 
            'Celana Kulot Muslimah', 'Celana Pendek Santai', 'Celana Formal Kerja'
        ],
        'sepatu': [
            'Sepatu Sneakers Sport', 'Sepatu Formal Kulit', 'Sepatu Running Nike', 
            'Sepatu Heels Wanita', 'Sepatu Casual Pria', 'Sepatu Boots Adventure'
        ],
        'tas': [
            'Tas Ransel Laptop', 'Tas Selempang Kulit', 'Tas Tangan Wanita', 
            'Tas Travel Backpack', 'Tas Sekolah Anak', 'Tas Clutch Party'
        ],
        'baju': [
            'Baju Kemeja Pria', 'Baju Atasan Wanita', 'Baju Kaos Polos', 
            'Baju Dress Muslim', 'Baju Polo Shirt', 'Baju Blouse Kantor'
        ]
    };
    
    // Get variations for keyword or use generic ones
    const variations = productVariations[keyword.toLowerCase()] || 
        productVariations[Object.keys(productVariations).find(k => keyword.toLowerCase().includes(k))] ||
        [`${keyword} Premium`, `${keyword} Original`, `${keyword} Import`, `${keyword} Branded`, `${keyword} Murah`];
    
    const items = [];
    const totalProducts = 80 + Math.floor(Math.random() * 200); // 80-280 total products
    
    for (let i = 0; i < itemsPerPage; i++) {
        const productIndex = startIndex + i;
        if (productIndex >= totalProducts) break;
        
        const variation = variations[i % variations.length];
        const basePrice = 20000 + Math.floor(Math.random() * 300000); // 20K-320K
        const discountPercent = Math.random() < 0.7 ? Math.floor(Math.random() * 50) + 10 : 0; // 70% chance of discount
        const currentPrice = discountPercent > 0 ? Math.floor(basePrice * (100 - discountPercent) / 100) : basePrice;
        
        const item = {
            item_basic: {
                itemid: 100000000 + productIndex,
                shopid: 1000000 + Math.floor(Math.random() * 900000),
                name: `${variation} REAL QUALITY`,
                price: currentPrice * 100, // Convert to cents
                price_min: currentPrice * 100,
                price_max: currentPrice * 100,
                price_before_discount: discountPercent > 0 ? basePrice * 100 : null,
                currency: "IDR",
                stock: Math.floor(Math.random() * 500) + 50,
                sold: Math.floor(Math.random() * 2000) + 100,
                rating_star: 4.0 + Math.random() * 1.0,
                rating_count: [
                    Math.floor(Math.random() * 500) + 100, // 5 stars
                    Math.floor(Math.random() * 100) + 20,  // 4 stars  
                    Math.floor(Math.random() * 50) + 10,   // 3 stars
                    Math.floor(Math.random() * 20) + 5,    // 2 stars
                    Math.floor(Math.random() * 10) + 2     // 1 star
                ],
                discount: discountPercent > 0 ? `${discountPercent}%` : null,
                wholesale_tier_list: []
            },
            shop_location: ["Jakarta", "Surabaya", "Bandung", "Medan", "Semarang"][Math.floor(Math.random() * 5)],
            is_official_shop: Math.random() < 0.3, // 30% chance of official shop
            is_mart: Math.random() < 0.1, // 10% chance of mart
            is_preferred: Math.random() < 0.4, // 40% chance of preferred
            shop_rating: 4.0 + Math.random() * 1.0,
            ads_keyword: Math.random() < 0.2 ? keyword : null, // 20% chance of being ads
            is_adult: false,
            badgeIconList: [],
            shopInfo: {
                shop_rating: 4.0 + Math.random() * 1.0,
                follower_count: Math.floor(Math.random() * 10000) + 500
            }
        };
        
        items.push(item);
    }
    
    return {
        data: {
            items: items,
            total_count: totalProducts,
            nomore: startIndex + itemsPerPage >= totalProducts,
            sections: [],
            filters: [],
            sort_options: [],
            suggestion_algorithm: "default"
        },
        generation_info: {
            keyword: keyword,
            page: page,
            items_generated: items.length,
            total_available: totalProducts,
            generated_at: Date.now(),
            realistic_pricing: true,
            realistic_ratings: true,
            geographic_distribution: true
        }
    };
}

// Special endpoint for product detail analytics (transforms search data)
app.all('/api/product/detail', (req, res) => {
    console.log(`🔍 Product detail analytics request received`);
    const productId = req.query.productId || req.body?.productId;
    const keyword = req.query.keyword || req.body?.keyword || 'product';
    
    // Try to find related search data first
    const platform = 'shopee';
    const searchKeys = Array.from(cacheStorage.keys()).filter(key => 
        key.includes('SearchResult:keyword=') && 
        key.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (searchKeys.length > 0) {
        const cachedSearchData = cacheStorage.get(searchKeys[0]);
        if (cachedSearchData?.response?.body?.data?.items) {
            console.log(`✅ Found search data for product detail transformation`);
            
            // Find specific product or use first item
            let targetItem = cachedSearchData.response.body.data.items[0];
            if (productId) {
                const foundItem = cachedSearchData.response.body.data.items.find(
                    item => item.item_basic?.itemid?.toString() === productId.toString()
                );
                if (foundItem) targetItem = foundItem;
            }
            
            const productDetail = transformSearchToProductDetail(targetItem, keyword);
            
            return res.json({
                status: true,
                response: {
                    body: productDetail
                },
                source: 'transformed_search_to_detail',
                productId: productId,
                keyword: keyword,
                analytics: productDetail.analytics,
                ftime: Date.now(),
                sign: generateMockSignature(productDetail, Math.floor(Date.now() / 1000))
            });
        }
    }
    
    // Fallback: generate mock product detail
    console.log(`📝 Generating mock product detail for keyword: ${keyword}`);
    const mockItem = {
        item_basic: {
            itemid: productId || Math.floor(Math.random() * 1000000000),
            name: `${keyword} Product Detail`,
            price: (50000 + Math.random() * 200000) * 100, // 50K-250K in cents
            sold: Math.floor(Math.random() * 1000) + 100,
            rating_star: 4.0 + Math.random() * 1.0,
            stock: Math.floor(Math.random() * 200) + 50
        }
    };
    
    const productDetail = transformSearchToProductDetail(mockItem, keyword);
    
    return res.json({
        status: true,
        response: {
            body: productDetail
        },
        source: 'generated_product_detail',
        productId: productId,
        keyword: keyword,
        analytics: productDetail.analytics,
        ftime: Date.now(),
        sign: generateMockSignature(productDetail, Math.floor(Date.now() / 1000))
    });
});

// DEBUG endpoints for testing
app.get('/debug/cache', (req, res) => {
    const cacheEntries = Array.from(cacheStorage.entries()).map(([key, value]) => ({
        key,
        source: value.source,
        endpoint: value.endpoint,
        timestamp: value.timestamp,
        cached_at: value.cached_at,
        hasData: !!value.response?.body?.data,
        itemCount: value.response?.body?.data?.items?.length || 0
    }));
    
    res.json({
        status: true,
        total_entries: cacheStorage.size,
        entries: cacheEntries
    });
});

app.post('/debug/cache/clear', (req, res) => {
    const beforeCount = cacheStorage.size;
    cacheStorage.clear();
    console.log(`🧹 Cache cleared! Removed ${beforeCount} entries`);
    
    res.json({
        status: true,
        message: `Cache cleared. Removed ${beforeCount} entries.`,
        entries_before: beforeCount,
        entries_after: cacheStorage.size
    });
});

// Catch-all for remaining API routes with regex pattern to avoid path-to-regexp issues
app.use(/^\/api\/.*/, handleApiRequest);

// Generic handler function
function handleApiRequest(req, res) {
    const originalUrl = req.originalUrl;
    console.log(`📥 ${req.method} ${originalUrl}`);
    console.log(`📋 Request headers:`, req.headers);
    console.log(`📦 Request body:`, req.body);
      // Special handling for cache endpoint with different types
    if (originalUrl.includes('/api/cache')) {
        const rawPlatform = req.query.platform || req.body?.platform;
        const type = req.query.type || req.body?.type;
        const url = req.query.url || req.body?.url;
        const endpoint = req.body?.endpoint;
        
        // Normalize platform name for consistent cache keys
        const platform = rawPlatform ? rawPlatform.replace('.co.id', '').replace('.com', '') : rawPlatform;
        
        console.log(`🎯 Cache request - Raw Platform: ${rawPlatform}, Normalized Platform: ${platform}, Type: ${type}, URL: ${url}, Endpoint: ${endpoint}`);
        
        // HANDLE REAL API DATA FROM EXTENSION
        if (req.method === 'POST' && req.body && req.body.data) {
            console.log(`📝 Processing REAL API data from extension...`);
            console.log(`🔍 Data type: ${typeof req.body.data}`);
            console.log(`📏 Data length: ${req.body.data.length} characters`);
            
            let realResponseData;
            try {
                // Parse the real response data
                if (typeof req.body.data === 'string') {
                    realResponseData = JSON.parse(req.body.data);
                } else {
                    realResponseData = req.body.data;
                }
                
                console.log(`✅ Successfully parsed REAL API data!`);
                console.log(`🎯 Real data structure:`, {
                    hasData: !!realResponseData.data,
                    hasItems: !!(realResponseData.data && realResponseData.data.items),
                    itemsCount: realResponseData.data && realResponseData.data.items ? realResponseData.data.items.length : 0,
                    topLevelKeys: Object.keys(realResponseData),
                    dataKeys: realResponseData.data ? Object.keys(realResponseData.data) : null
                });                // Special handling for search results
                if (endpoint === '/api/v4/search/search_items' && realResponseData.data && realResponseData.data.items) {
                    console.log(`🔍 Processing REAL search results with ${realResponseData.data.items.length} items`);
                    console.log(`📊 Sample item:`, realResponseData.data.items[0]);
                    
                    // Store BOTH endpoint key AND SearchResult key for compatibility
                    const endpointKey = `${platform}:${endpoint}`;
                    const searchResultKey = `${platform}:${type}`;
                    
                    const cacheData = {
                        status: true,
                        response: {
                            body: realResponseData
                        },
                        source: 'real_api_data',
                        endpoint: endpoint,
                        timestamp: req.body.timestamp || Date.now(),
                        cached_at: Date.now()
                    };
                    
                    // Always store with endpoint key
                    cacheStorage.set(endpointKey, cacheData);
                    console.log(`💾 Stored real data with endpoint key: ${endpointKey}`);
                    
                    // Always store with SearchResult key (this is the key the extension requests)
                    cacheStorage.set(searchResultKey, cacheData);
                    console.log(`💾 Stored real data with SearchResult key: ${searchResultKey}`);
                    
                    // ALSO extract keyword and store additional patterns for robustness
                    if (url && url.includes('keyword=')) {
                        try {
                            const urlObj = new URL(url);
                            const keyword = urlObj.searchParams.get('keyword');
                            const newest = urlObj.searchParams.get('newest') || '0';
                            
                            if (keyword) {
                                const searchKey = `${platform}:SearchResult:keyword=${keyword}:${newest}`;
                                cacheStorage.set(searchKey, cacheData);
                                console.log(`💾 Stored real data with URL-based search key: ${searchKey}`);
                            }
                        } catch (urlError) {
                            console.log(`⚠️ Error parsing URL for additional keys: ${urlError.message}`);
                        }
                    }
                    
                    // ALSO extract from type parameter if it contains keyword info
                    if (type && type.includes('keyword=')) {
                        const keywordMatch = type.match(/keyword=([^:&]+):(\d+)/);
                        if (keywordMatch) {
                            const keyword = keywordMatch[1];
                            const page = keywordMatch[2];
                            const typeBasedKey = `${platform}:SearchResult:keyword=${keyword}:${page}`;
                            
                            // Only store if different from searchResultKey
                            if (typeBasedKey !== searchResultKey) {
                                cacheStorage.set(typeBasedKey, cacheData);
                                console.log(`💾 Stored real data with type-based search key: ${typeBasedKey}`);
                            }
                        }
                    }
                    
                    console.log(`📋 Total keys stored for this search: ${Array.from(cacheStorage.keys()).filter(k => k.includes('SearchResult')).length}`);
                    
                    // Return the COMPLETE real response as-is
                    return res.json({
                        status: true,
                        response: {
                            body: realResponseData  // Return FULL real data
                        },
                        ftime: Date.now(),
                        sign: generateMockSignature(realResponseData, Math.floor(Date.now() / 1000)),
                        source: 'real_api_data',
                        endpoint: endpoint,
                        timestamp: req.body.timestamp || Date.now()
                    });
                }
                
                // For other endpoints, also return real data
                console.log(`📤 Returning REAL API data for endpoint: ${endpoint}`);
                
                // Store in cache for later retrieval
                const cacheKey = `${platform}:${type}`;
                cacheStorage.set(cacheKey, {
                    status: true,
                    response: {
                        body: realResponseData
                    },
                    source: 'real_api_data',
                    endpoint: endpoint,
                    timestamp: req.body.timestamp || Date.now(),
                    cached_at: Date.now()
                });
                console.log(`💾 Stored real data in cache with key: ${cacheKey}`);
                
                return res.json({
                    status: true,
                    response: {
                        body: realResponseData  // Return FULL real data
                    },
                    ftime: Date.now(),
                    sign: generateMockSignature(realResponseData, Math.floor(Date.now() / 1000)),
                    source: 'real_api_data',
                    endpoint: endpoint,
                    timestamp: req.body.timestamp || Date.now()
                });
                
            } catch (error) {
                console.log(`❌ Error parsing REAL API data:`, error.message);
                console.log(`📄 Raw data preview:`, req.body.data.substring(0, 500) + '...');
                
                // Even if parsing fails, try to return the raw data
                return res.json({
                    status: true,
                    response: {
                        body: req.body.data  // Return raw data if parsing fails
                    },
                    ftime: Date.now(),
                    sign: "mock-signature-raw-data",
                    source: 'raw_api_data',
                    error: error.message
                });
            }        }        // Check if we have cached real data first - try SPECIFIC key patterns only
        const possibleKeys = [
            `${platform}:${type}`
        ];
        
        // For SearchResult requests, also try extracting keyword pattern for same keyword only
        if (type && type.includes('SearchResult:keyword=')) {
            const keywordMatch = type.match(/keyword=([^:&]+):(\d+)/);
            if (keywordMatch) {
                const keyword = keywordMatch[1];
                const page = keywordMatch[2];
                // Only add the exact key, not generic endpoint key
                possibleKeys.push(`${platform}:SearchResult:keyword=${keyword}:${page}`);
            }
        }
        
        console.log(`🔍 Checking cache with possible SPECIFIC keys:`, possibleKeys);
        console.log(`📦 Available cache keys:`, Array.from(cacheStorage.keys()));
        
        let cachedData = null;
        let foundKey = null;
          for (const key of possibleKeys) {
            if (cacheStorage.has(key)) {
                cachedData = cacheStorage.get(key);
                foundKey = key;
                break;
            }
        }
          if (cachedData && foundKey) {
            console.log(`✅ Found cached REAL data with key: ${foundKey}`);
            console.log(`📊 Cached data structure:`, {
                hasResponse: !!cachedData.response,
                hasBody: !!cachedData.response?.body,
                hasData: !!cachedData.response?.body?.data,
                hasItems: !!cachedData.response?.body?.data?.items,
                itemCount: cachedData.response?.body?.data?.items?.length || 0,
                source: cachedData.source,
                endpoint: cachedData.endpoint
            });
            
            // ENHANCEMENT: Transform search results to product detail format for analytics
            let responseData = cachedData;
            
            // Check if this is search data that needs transformation for product analysis
            if (cachedData.response?.body?.data?.items && 
                (url?.includes('product') || type?.includes('Product') || type?.includes('Analysis'))) {
                
                console.log(`🔄 Transforming search data to product detail format for analytics...`);
                
                // Extract keyword for transformation context
                const keywordMatch = type?.match(/keyword=([^:&]+)/) || foundKey.match(/keyword=([^:&]+)/);
                const keyword = keywordMatch ? decodeURIComponent(keywordMatch[1].replace(/\+/g, ' ')) : 'product';
                
                // Take the first item from search results and transform it
                const firstItem = cachedData.response.body.data.items[0];
                if (firstItem) {
                    const transformedData = transformSearchToProductDetail(firstItem, keyword);
                    
                    // Create enhanced response with both search and detail data
                    responseData = {
                        ...cachedData,
                        response: {
                            body: transformedData
                        },
                        transformation: {
                            source: 'search_to_detail',
                            original_items_count: cachedData.response.body.data.items.length,
                            transformed_keyword: keyword,
                            analytics_enhanced: true
                        }
                    };
                    
                    console.log(`✅ Transformed search data to product detail format