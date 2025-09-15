# News Admin Dashboard - Complete API Reference

## Base URL
```
Production: https://your-admin-dashboard.vercel.app/api
Local: http://localhost:3000/api
```

---

## 📰 News API Endpoints

### Get All News Articles
```
GET /api/news
```
**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `category` - Filter by category ID/slug
- `search` - Search in title/content
- `published` - Filter published articles (true/false)
- `featured` - Filter featured articles (true/false)

**Example:**
```
GET /api/news?page=1&limit=20&published=true&category=technology
```

### Get Single News Article
```
GET /api/news/[id]
```
**Example:**
```
GET /api/news/cm123abc456def
```

### Create News Article (Admin Only)
```
POST /api/news
```

### Update News Article (Admin Only)
```
PUT /api/news/[id]
```

### Delete News Article (Admin Only)
```
DELETE /api/news/[id]
```

---

## 📂 Categories API Endpoints

### Get All Categories
```
GET /api/categories
```

### Get Single Category
```
GET /api/categories/[id]
```
**Query Parameters:**
- `includeArticles` - Include articles in response (true/false)
- `limit` - Number of articles to include

**Example:**
```
GET /api/categories/tech-category-id?includeArticles=true&limit=10
```

### Create Category (Admin Only)
```
POST /api/categories
```

### Update Category (Admin Only)
```
PUT /api/categories/[id]
```

### Delete Category (Admin Only)
```
DELETE /api/categories/[id]
```

---

## 🔔 Push Notifications API Endpoints

### Register FCM Token
```
POST /api/fcm-token
```
**Body:**
```json
{
  "token": "fcm_device_token",
  "platform": "android|ios",
  "userId": "user_id_optional"
}
```

### Get Notifications
```
GET /api/notifications
```
**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `userId` - Filter by user ID

### Send Notification (Admin Only)
```
POST /api/notifications/send
```

### Get Notification Analytics (Admin Only)
```
GET /api/notifications/analytics
```

### Get FCM Tokens (Admin Only)
```
GET /api/notifications/tokens
```

---

## 📊 Analytics API Endpoints

### Get Analytics Overview (Admin Only)
```
GET /api/analytics/overview
```

### Get Analytics Charts (Admin Only)
```
GET /api/analytics/charts
```

### Get Performance Analytics (Admin Only)
```
GET /api/analytics/performance
```

### Track Event (Client App)
```
POST /api/analytics/track
```
**Body:**
```json
{
  "eventType": "article_view|category_view|search|share",
  "articleId": "article_id_optional",
  "categoryId": "category_id_optional",
  "userId": "user_id_optional",
  "metadata": {
    "platform": "android|ios|web",
    "source": "home_feed|search|category",
    "duration": 45
  }
}
```

---

## 👥 Users API Endpoints

### Get User Statistics (Admin Only)
```
GET /api/users/stats
```

### Get User Details (Admin Only)
```
GET /api/users/[id]
```

### Update User (Admin Only)
```
PUT /api/users/[id]
```

### Get User Activities (Admin Only)
```
GET /api/users/[id]/activities
```

### Get User Sessions (Admin Only)
```
GET /api/users/[id]/sessions
```

---

## 🔐 Authentication API Endpoints

### NextAuth.js Endpoints
```
GET /api/auth/signin
POST /api/auth/signin
GET /api/auth/signout
POST /api/auth/signout
GET /api/auth/session
GET /api/auth/csrf
GET /api/auth/providers
GET /api/auth/callback/[provider]
```

---

## ⚙️ Settings API Endpoints

### Get App Settings
```
GET /api/settings
```
**Response includes:**
- App configuration
- Theme settings
- Feature flags
- Maintenance mode status

### Update Settings (Admin Only)
```
PUT /api/settings
```

---

## 🔧 Setup API Endpoints

### Setup Admin Account
```
POST /api/setup/admin
```
**Body:**
```json
{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "secure_password"
}
```

---

## 📁 File Upload API Endpoints

### Upload Image/File
```
POST /api/upload
```
**Content-Type:** `multipart/form-data`
**Body:**
- `file` - File to upload
- `folder` - Optional folder name

**Response:**
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/dj5uicjuc/image/upload/v1234567890/news/image.jpg",
  "publicId": "news/image",
  "width": 1920,
  "height": 1080
}
```

---

## 🎯 Quick API Testing Links

### News Endpoints
```bash
# Get latest published news
curl "https://your-admin-dashboard.vercel.app/api/news?published=true&limit=5"

# Get single article
curl "https://your-admin-dashboard.vercel.app/api/news/ARTICLE_ID"

# Search articles
curl "https://your-admin-dashboard.vercel.app/api/news?search=technology&published=true"
```

### Categories Endpoints
```bash
# Get all categories
curl "https://your-admin-dashboard.vercel.app/api/categories"

# Get category with articles
curl "https://your-admin-dashboard.vercel.app/api/categories/CATEGORY_ID?includeArticles=true"
```

### FCM Token Registration
```bash
# Register device for push notifications
curl -X POST "https://your-admin-dashboard.vercel.app/api/fcm-token" \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_FCM_TOKEN","platform":"android"}'
```

### File Upload
```bash
# Upload image
curl -X POST "https://your-admin-dashboard.vercel.app/api/upload" \
  -F "file=@image.jpg" \
  -F "folder=news"
```

---

## 📱 Client App Integration Examples

### JavaScript/React Example
```javascript
const API_BASE = 'https://your-admin-dashboard.vercel.app/api';

// Get news articles
const response = await fetch(`${API_BASE}/news?published=true&limit=20`);
const data = await response.json();

// Get categories
const categoriesResponse = await fetch(`${API_BASE}/categories`);
const categories = await categoriesResponse.json();

// Register FCM token
await fetch(`${API_BASE}/fcm-token`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: 'your_fcm_token',
    platform: 'android'
  })
});
```

### React Native Example
```javascript
import { useState, useEffect } from 'react';

const useNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://your-admin-dashboard.vercel.app/api/news?published=true')
      .then(res => res.json())
      .then(data => {
        setNews(data.news);
        setLoading(false);
      });
  }, []);

  return { news, loading };
};
```

### Flutter/Dart Example
```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class NewsApi {
  static const String baseUrl = 'https://your-admin-dashboard.vercel.app/api';

  static Future<List<dynamic>> getNews() async {
    final response = await http.get(
      Uri.parse('$baseUrl/news?published=true'),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['news'];
    }
    throw Exception('Failed to load news');
  }

  static Future<void> registerFCMToken(String token) async {
    await http.post(
      Uri.parse('$baseUrl/fcm-token'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': token,
        'platform': 'android',
      }),
    );
  }
}
```

---

## 🔑 Authentication & Security

### Admin Authentication
- **Login URL:** `https://your-admin-dashboard.vercel.app/auth/signin`
- **Default Credentials:**
  - Email: `admin@newsapp.com`
  - Password: `NewsAdmin123!`

### API Security
- All admin endpoints require authentication
- Public endpoints: `/api/news`, `/api/categories`, `/api/fcm-token`
- Rate limiting may apply
- CORS enabled for cross-origin requests

---

## 📋 Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "pagination": { /* pagination info if applicable */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": "Additional error details"
  }
}
```

---

## 🌐 Environment-Specific URLs

### Development
```
Base URL: http://localhost:3000/api
Admin Panel: http://localhost:3000
```

### Production
```
Base URL: https://your-admin-dashboard.vercel.app/api
Admin Panel: https://your-admin-dashboard.vercel.app
```

---

## 📚 Additional Resources

### Firebase Configuration
- **Project ID:** `newsapp-26580`
- **Service Account:** `firebase-adminsdk-fbsvc@newsapp-26580.iam.gserviceaccount.com`

### Cloudinary Configuration
- **Cloud Name:** `dj5uicjuc`
- **Upload Endpoint:** `/api/upload`

### Rate Limits
- **General API:** 100 requests per minute
- **Upload API:** 10 uploads per minute
- **FCM Registration:** 50 registrations per minute

---

This comprehensive API reference provides all the endpoints available in your News Admin Dashboard for client app integration. Use these endpoints to build mobile apps, web clients, or any other application that needs to consume your news content.