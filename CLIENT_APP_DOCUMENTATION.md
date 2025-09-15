# News Client App - API Integration Documentation

## Overview

This documentation provides comprehensive guidance for developing a client application (mobile/web) that integrates with the News Admin Dashboard API. The admin server provides a RESTful API for news content management, user authentication, push notifications, and analytics.

---

## Table of Contents

1. [API Base Configuration](#api-base-configuration)
2. [Authentication](#authentication)
3. [News API Endpoints](#news-api-endpoints)
4. [Categories API](#categories-api)
5. [Push Notifications](#push-notifications)
6. [File Upload](#file-upload)
7. [Analytics & Settings](#analytics--settings)
8. [Error Handling](#error-handling)
9. [Client Implementation Examples](#client-implementation-examples)
10. [Environment Configuration](#environment-configuration)

---

## API Base Configuration

### Production Server
```
Base URL: https://your-admin-dashboard.vercel.app/api
```

### Local Development
```
Base URL: http://localhost:3000/api
```

### Headers
```javascript
{
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}
```

---

## Authentication

### Admin Authentication (NextAuth.js)
The admin dashboard uses NextAuth.js for admin authentication. For client apps, you may implement separate user authentication or use the admin API for content access.

#### Admin Credentials (Default)
```
Email: admin@newsapp.com
Password: NewsAdmin123!
```

**Note:** Change these credentials after first login for security.

---

## News API Endpoints

### 1. Get All News Articles

**Endpoint:** `GET /api/news`

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of articles per page (default: 10)
- `category` (optional): Filter by category ID or slug
- `search` (optional): Search term for title/content
- `published` (optional): Filter published articles (true/false)
- `featured` (optional): Filter featured articles (true/false)

**Example Request:**
```javascript
const response = await fetch('/api/news?page=1&limit=20&published=true&category=technology');
const data = await response.json();
```

**Response Format:**
```json
{
  "success": true,
  "news": [
    {
      "id": "article_id",
      "title": "Article Title",
      "content": "<p>Rich HTML content...</p>",
      "excerpt": "Brief description...",
      "featuredImage": "https://cloudinary.com/image.jpg",
      "category": {
        "id": "category_id",
        "name": "Technology",
        "slug": "technology"
      },
      "author": {
        "id": "author_id",
        "name": "Author Name",
        "email": "author@example.com"
      },
      "isPublished": true,
      "isFeatured": false,
      "publishedAt": "2025-09-14T10:30:00Z",
      "createdAt": "2025-09-14T10:00:00Z",
      "updatedAt": "2025-09-14T10:30:00Z",
      "readTime": 5,
      "viewCount": 150,
      "tags": ["technology", "innovation"]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 200,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 2. Get Single News Article

**Endpoint:** `GET /api/news/[id]`

**Example Request:**
```javascript
const response = await fetch('/api/news/article_id_here');
const data = await response.json();
```

**Response Format:**
```json
{
  "success": true,
  "article": {
    "id": "article_id",
    "title": "Article Title",
    "content": "<p>Full HTML content...</p>",
    "excerpt": "Brief description...",
    "featuredImage": "https://cloudinary.com/image.jpg",
    "category": {
      "id": "category_id",
      "name": "Technology",
      "slug": "technology"
    },
    "author": {
      "id": "author_id",
      "name": "Author Name",
      "email": "author@example.com"
    },
    "isPublished": true,
    "isFeatured": false,
    "publishedAt": "2025-09-14T10:30:00Z",
    "createdAt": "2025-09-14T10:00:00Z",
    "updatedAt": "2025-09-14T10:30:00Z",
    "readTime": 5,
    "viewCount": 150,
    "tags": ["technology", "innovation"],
    "relatedArticles": [
      {
        "id": "related_id",
        "title": "Related Article",
        "featuredImage": "image_url",
        "publishedAt": "date"
      }
    ]
  }
}
```

### 3. Search News Articles

**Endpoint:** `GET /api/news?search=query`

**Example Request:**
```javascript
const searchQuery = "artificial intelligence";
const response = await fetch(`/api/news?search=${encodeURIComponent(searchQuery)}&published=true`);
const data = await response.json();
```

---

## Categories API

### 1. Get All Categories

**Endpoint:** `GET /api/categories`

**Example Request:**
```javascript
const response = await fetch('/api/categories');
const data = await response.json();
```

**Response Format:**
```json
{
  "success": true,
  "categories": [
    {
      "id": "category_id",
      "name": "Technology",
      "slug": "technology",
      "description": "Latest technology news and trends",
      "color": "#3B82F6",
      "icon": "💻",
      "articleCount": 45,
      "isActive": true,
      "createdAt": "2025-09-14T10:00:00Z",
      "updatedAt": "2025-09-14T10:00:00Z"
    }
  ]
}
```

### 2. Get Category with Articles

**Endpoint:** `GET /api/categories/[id]`

**Query Parameters:**
- `includeArticles` (optional): Include articles in response (true/false)
- `limit` (optional): Number of articles to include

**Example Request:**
```javascript
const response = await fetch('/api/categories/category_id?includeArticles=true&limit=10');
const data = await response.json();
```

---

## Push Notifications

### 1. Register FCM Token

**Endpoint:** `POST /api/fcm-token`

**Request Body:**
```json
{
  "token": "fcm_device_token_here",
  "platform": "android", // or "ios"
  "userId": "user_id_optional",
  "deviceInfo": {
    "model": "Samsung Galaxy S21",
    "osVersion": "Android 12",
    "appVersion": "1.0.0"
  }
}
```

**Example Request:**
```javascript
const response = await fetch('/api/fcm-token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    token: fcmToken,
    platform: 'android',
    userId: currentUserId // optional
  })
});
```

**Response Format:**
```json
{
  "success": true,
  "message": "FCM token registered successfully",
  "tokenId": "token_record_id"
}
```

### 2. Get Notification History

**Endpoint:** `GET /api/notifications`

**Query Parameters:**
- `userId` (optional): Filter by user ID
- `page` (optional): Page number
- `limit` (optional): Number per page

---

## File Upload

### Upload Images

**Endpoint:** `POST /api/upload`

**Request Type:** `multipart/form-data`

**Example Request:**
```javascript
const formData = new FormData();
formData.append('file', imageFile);
formData.append('folder', 'news'); // optional folder name

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});

const data = await response.json();
```

**Response Format:**
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/news/image.jpg",
  "publicId": "news/image",
  "width": 1920,
  "height": 1080
}
```

---

## Analytics & Settings

### 1. Get App Settings

**Endpoint:** `GET /api/settings`

**Response Format:**
```json
{
  "success": true,
  "settings": {
    "appName": "News App",
    "appVersion": "1.0.0",
    "maintenanceMode": false,
    "featuredCategoryId": "category_id",
    "maxArticlesPerPage": 20,
    "pushNotificationsEnabled": true,
    "themeSettings": {
      "primaryColor": "#3B82F6",
      "secondaryColor": "#10B981"
    }
  }
}
```

### 2. Track Analytics

**Endpoint:** `POST /api/analytics`

**Request Body:**
```json
{
  "eventType": "article_view", // article_view, category_view, search, share
  "articleId": "article_id", // optional
  "categoryId": "category_id", // optional
  "userId": "user_id", // optional
  "metadata": {
    "platform": "android",
    "source": "home_feed",
    "duration": 45 // seconds spent reading
  }
}
```

---

## Error Handling

### Error Response Format

All API endpoints return errors in a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ARTICLE_NOT_FOUND",
    "message": "Article not found",
    "details": "No article found with the provided ID"
  }
}
```

### Common Error Codes

- `ARTICLE_NOT_FOUND` (404): Article doesn't exist
- `CATEGORY_NOT_FOUND` (404): Category doesn't exist
- `VALIDATION_ERROR` (400): Invalid request data
- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): Access denied
- `RATE_LIMITED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

### Error Handling Example

```javascript
async function fetchNews() {
  try {
    const response = await fetch('/api/news');
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error.message);
    }
    
    return data.news;
  } catch (error) {
    console.error('Failed to fetch news:', error.message);
    // Handle error appropriately
    return [];
  }
}
```

---

## Client Implementation Examples

### React/React Native Example

```javascript
// API service
class NewsAPIService {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async fetchNews(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/news?${queryString}`);
    return this.handleResponse(response);
  }

  async fetchArticle(id) {
    const response = await fetch(`${this.baseURL}/news/${id}`);
    return this.handleResponse(response);
  }

  async fetchCategories() {
    const response = await fetch(`${this.baseURL}/categories`);
    return this.handleResponse(response);
  }

  async registerFCMToken(token, platform) {
    const response = await fetch(`${this.baseURL}/fcm-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, platform })
    });
    return this.handleResponse(response);
  }

  async handleResponse(response) {
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.error?.message || 'API request failed');
    }
    
    return data;
  }
}

// Usage
const api = new NewsAPIService('https://your-admin-dashboard.vercel.app/api');

// Fetch latest news
const newsData = await api.fetchNews({ 
  published: true, 
  limit: 20, 
  page: 1 
});

// Fetch single article
const article = await api.fetchArticle('article-id');

// Fetch categories
const categories = await api.fetchCategories();
```

### React Hook Example

```javascript
import { useState, useEffect } from 'react';

export function useNews(params = {}) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        const api = new NewsAPIService(process.env.REACT_APP_API_URL);
        const data = await api.fetchNews(params);
        setNews(data.news);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, [JSON.stringify(params)]);

  return { news, loading, error };
}

// Usage in component
function NewsComponent() {
  const { news, loading, error } = useNews({ 
    published: true, 
    limit: 10 
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {news.map(article => (
        <div key={article.id}>
          <h3>{article.title}</h3>
          <p>{article.excerpt}</p>
        </div>
      ))}
    </div>
  );
}
```

### Flutter/Dart Example

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class NewsAPIService {
  final String baseURL;

  NewsAPIService(this.baseURL);

  Future<Map<String, dynamic>> fetchNews({
    int page = 1,
    int limit = 10,
    String? category,
    bool? published,
  }) async {
    final params = <String, String>{
      'page': page.toString(),
      'limit': limit.toString(),
      if (category != null) 'category': category,
      if (published != null) 'published': published.toString(),
    };

    final uri = Uri.parse('$baseURL/news').replace(queryParameters: params);
    final response = await http.get(uri);

    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> fetchArticle(String id) async {
    final response = await http.get(Uri.parse('$baseURL/news/$id'));
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> registerFCMToken(String token, String platform) async {
    final response = await http.post(
      Uri.parse('$baseURL/fcm-token'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': token,
        'platform': platform,
      }),
    );

    return _handleResponse(response);
  }

  Map<String, dynamic> _handleResponse(http.Response response) {
    final data = jsonDecode(response.body);
    
    if (response.statusCode != 200 || data['success'] != true) {
      throw Exception(data['error']?['message'] ?? 'API request failed');
    }
    
    return data;
  }
}

// Usage
final api = NewsAPIService('https://your-admin-dashboard.vercel.app/api');

try {
  final newsData = await api.fetchNews(published: true, limit: 20);
  final articles = newsData['news'] as List;
} catch (e) {
  print('Error fetching news: $e');
}
```

---

## Environment Configuration

### Client App Environment Variables

Create environment configuration for different deployment stages:

**Development (.env.development)**
```
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_FCM_VAPID_KEY=your_fcm_vapid_key
REACT_APP_APP_VERSION=1.0.0-dev
```

**Production (.env.production)**
```
REACT_APP_API_URL=https://your-admin-dashboard.vercel.app/api
REACT_APP_FCM_VAPID_KEY=your_fcm_vapid_key
REACT_APP_APP_VERSION=1.0.0
```

### Firebase Configuration for Client

```javascript
// firebase-config.js
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "newsapp-26580.firebaseapp.com",
  projectId: "newsapp-26580",
  storageBucket: "newsapp-26580.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

export default firebaseConfig;
```

---

## Best Practices

### 1. Caching Strategy
- Cache news articles for offline reading
- Cache categories and settings
- Implement cache expiration (e.g., 30 minutes for news)

### 2. Performance Optimization
- Implement pagination for news lists
- Lazy load images
- Use image compression for uploads
- Implement request debouncing for search

### 3. Error Handling
- Implement retry logic for failed requests
- Show user-friendly error messages
- Log errors for debugging

### 4. Security
- Validate all user inputs
- Sanitize HTML content before display
- Use HTTPS for all API calls
- Implement rate limiting on client side

### 5. Analytics
- Track user interactions
- Monitor API response times
- Track app crashes and errors

---

## Firebase Credentials

### Your Firebase Project Configuration
```
Project ID: newsapp-26580
Service Account: firebase-adminsdk-fbsvc@newsapp-26580.iam.gserviceaccount.com
```

### Push Notification Setup
1. Add your app to Firebase Console
2. Download `google-services.json` (Android) or `GoogleService-Info.plist` (iOS)
3. Configure FCM in your client app
4. Register device tokens using the `/api/fcm-token` endpoint

---

## Support

For questions or issues with the API integration:

1. Check the error response format and codes
2. Verify your request format matches the documentation
3. Ensure your environment variables are properly set
4. Test endpoints with a tool like Postman or Insomnia

## API Testing

You can test the API endpoints using curl commands:

```bash
# Get all news
curl "https://your-admin-dashboard.vercel.app/api/news?published=true&limit=5"

# Get single article
curl "https://your-admin-dashboard.vercel.app/api/news/article_id"

# Get categories
curl "https://your-admin-dashboard.vercel.app/api/categories"

# Register FCM token
curl -X POST "https://your-admin-dashboard.vercel.app/api/fcm-token" \
  -H "Content-Type: application/json" \
  -d '{"token":"your_fcm_token","platform":"android"}'
```

---

This documentation provides everything you need to build a client application that integrates seamlessly with your News Admin Dashboard API.