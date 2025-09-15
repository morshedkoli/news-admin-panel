# Push Notification Setup Guide

This guide explains how to configure push notifications for the News Admin Panel.

## Prerequisites

1. Firebase project with FCM (Firebase Cloud Messaging) enabled
2. Firebase Admin SDK service account key
3. Client app configured to receive push notifications

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

### Getting Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > Service Accounts
4. Click "Generate new private key"
5. Download the JSON file
6. Extract the required values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the \n characters)
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

## Features Configured

### ✅ Automatic Notifications
- **New News Articles**: When you publish a new article, users automatically receive push notifications
- **Draft to Published**: When you update a draft article to published status, notifications are sent
- **Settings Control**: Notifications can be enabled/disabled via admin settings

### ✅ Manual Notifications
- **Custom Messages**: Send custom notifications to all users or specific categories
- **Rich Content**: Include images, links, and custom data
- **Scheduling**: Schedule notifications for future delivery

### ✅ Testing & Analytics
- **Test Notifications**: Send test notifications to verify configuration
- **Delivery Stats**: Track delivery rates, click-through rates, and engagement
- **Token Management**: Automatic cleanup of invalid device tokens

## API Endpoints

### Send Test Notification
```
POST /api/notifications/test
```

### Create Custom Notification
```
POST /api/notifications
```

### Send Notification
```
POST /api/notifications/send
```

### Register FCM Token (for client apps)
```
POST /api/notifications/tokens
```

## Client App Integration

Your mobile app needs to:

1. **Register FCM tokens** with the admin panel:
```javascript
// Example for React Native/Expo
const registerToken = async (token, deviceId, platform, userId) => {
  await fetch('/api/notifications/tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, deviceId, platform, userId })
  })
}
```

2. **Handle notification data** when received:
```javascript
// Example notification data structure
{
  newsId: "article-id",
  category: "Technology",
  type: "news_article",
  action: "open_article"
}
```

## Notification Types

### News Notifications
- **Title**: "📰 New [Category] Article"
- **Body**: Article title
- **Data**: `{ newsId, category, type: "news_article", action: "open_article" }`

### Custom Notifications
- **Title**: Custom title
- **Body**: Custom message
- **Data**: Custom data fields

## Settings Configuration

Push notifications can be controlled via the admin settings:

```javascript
notifications: {
  enablePushNotifications: true,
  notifyOnNewNews: true,
  notifyOnNewsUpdate: false,
  // ... other settings
}
```

## Testing

1. Go to **Dashboard > Notifications > Test** tab
2. Click "Send Test Notification"
3. Check the delivery statistics
4. Verify notifications appear on registered devices

## Troubleshooting

### No tokens found
- Ensure your client app is registering FCM tokens
- Check the `/api/notifications/tokens` endpoint

### Notifications not delivering
- Verify Firebase credentials are correct
- Check Firebase Console for any quota limits
- Ensure FCM is enabled in your Firebase project

### Invalid tokens
- The system automatically marks invalid tokens as inactive
- Tokens may become invalid if the app is uninstalled

## Security Notes

- Keep your Firebase private key secure
- Never commit credentials to version control
- Use environment variables for all sensitive data
- Regularly rotate service account keys

## Performance

- Notifications are sent in batches for better performance
- Failed tokens are automatically cleaned up
- Delivery statistics are tracked for monitoring

## Support

For issues with push notifications:
1. Check the admin panel logs
2. Verify Firebase Console for delivery status
3. Test with the built-in test notification feature
