# API Testing Examples

## Prerequisites

1. Navigate to `/dashboard/api` in your admin panel
2. **For unlimited access**: Click "Generate Unlimited Key" button (blue button) - this creates a key with no rate limits for your internal app
3. **For limited access**: Click "Generate New Key" and configure permissions and rate limits
4. Copy the generated API key

## Unlimited Access for Internal App

The system now supports **unlimited API access** specifically designed for your official mobile application:

### Quick Setup for Internal App
1. Click the **"Generate Unlimited Key"** button in the API management page
2. This automatically creates a key with:
   - Name: "Internal App - Unlimited Access"
   - Permissions: `internal:unlimited` (bypasses all permission checks)
   - Rate Limit: Unlimited (no restrictions)
   - Expiration: Never expires

### Features of Unlimited Keys
- ✅ **No rate limiting** - Make as many requests as needed
- ✅ **All permissions** - Access to all API endpoints automatically
- ✅ **Never expires** - Permanent access for your app
- ✅ **Bypasses restrictions** - No throttling or usage limits

## Example API Calls

### 1. Get News Articles (Unlimited)

```bash
curl -H "Authorization: Bearer YOUR_UNLIMITED_API_KEY" \
  "http://localhost:3000/api/v1/news?page=1&limit=100"
```

### 2. Get Specific News Article (Unlimited)

```bash
curl -H "Authorization: Bearer YOUR_UNLIMITED_API_KEY" \
  "http://localhost:3000/api/v1/news/NEWS_ARTICLE_ID"
```

### 3. Get Categories (Unlimited)

```bash
curl -H "Authorization: Bearer YOUR_UNLIMITED_API_KEY" \
  "http://localhost:3000/api/v1/categories"
```

### 4. Register Device for Notifications (Unlimited)

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_UNLIMITED_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "FCM_DEVICE_TOKEN",
    "platform": "android",
    "deviceId": "unique_device_id"
  }' \
  "http://localhost:3000/api/v1/notifications/register"
```

## JavaScript/TypeScript Examples for Mobile App

```javascript
const API_BASE_URL = 'http://localhost:3000/api/v1';
const UNLIMITED_API_KEY = 'YOUR_UNLIMITED_API_KEY'; // Generated from admin panel

class NewsAPI {
  constructor() {
    this.headers = {
      'Authorization': `Bearer ${UNLIMITED_API_KEY}`,
      'Content-Type': 'application/json'
    };
  }

  // Fetch news with unlimited access
  async fetchNews(page = 1, limit = 50, category = null, search = null) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(category && { category }),
      ...(search && { search })
    });

    const response = await fetch(`${API_BASE_URL}/news?${params}`, {
      headers: this.headers
    });
    return response.json();
  }

  // Get specific article with view tracking
  async getArticle(id) {
    const response = await fetch(`${API_BASE_URL}/news/${id}`, {
      headers: this.headers
    });
    return response.json();
  }

  // Get all categories
  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      headers: this.headers
    });
    return response.json();
  }

  // Register device for push notifications
  async registerDevice(fcmToken, platform, deviceId) {
    const response = await fetch(`${API_BASE_URL}/notifications/register`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        token: fcmToken,
        platform, // 'android' or 'ios'
        deviceId
      })
    });
    return response.json();
  }

  // Batch operations (unlimited keys can handle high volume)
  async batchFetchArticles(articleIds) {
    const promises = articleIds.map(id => this.getArticle(id));
    return Promise.all(promises);
  }

  // Real-time news feed (no rate limit concerns)
  async getLatestNews(lastFetchTime = null) {
    const params = new URLSearchParams({
      page: '1',
      limit: '20',
      ...(lastFetchTime && { since: lastFetchTime })
    });

    return this.fetchNews(1, 20);
  }
}

// Usage example
const newsAPI = new NewsAPI();

// App initialization
async function initializeApp() {
  try {
    // Register device for notifications
    await newsAPI.registerDevice(
      'fcm_device_token_here',
      'android', // or 'ios'
      'unique_device_identifier'
    );

    // Load initial content
    const [news, categories] = await Promise.all([
      newsAPI.fetchNews(1, 20),
      newsAPI.getCategories()
    ]);

    console.log('App initialized with unlimited API access');
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
}
```

## Rate Limiting Comparison

### Limited Keys (Third-party developers)
- 100-10,000 requests per hour
- Specific permission requirements
- Rate limit errors when exceeded

### Unlimited Keys (Your internal app)
- ♾️ **No rate limits**
- 🔓 **All permissions included**
- ⚡ **Optimized for high-frequency usage**
- 🛡️ **Designed for production mobile apps**

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Missing or invalid authorization header"
}
```

### 403 Forbidden (Only for limited keys)
```json
{
  "error": "Insufficient permissions"
}
```

### 429 Rate Limited (Only for limited keys)
```json
{
  "error": "Rate limit exceeded"
}
```

### 404 Not Found
```json
{
  "error": "Article not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Production Deployment Notes

When deploying to production:

1. **Update API_BASE_URL** to your production domain
2. **Generate new unlimited key** in production admin panel
3. **Store API key securely** in your mobile app environment
4. **Monitor usage** through the analytics dashboard
5. **Set up monitoring** for API endpoint health

The unlimited API key is perfect for your official mobile application where you need reliable, unrestricted access to your news content and services.