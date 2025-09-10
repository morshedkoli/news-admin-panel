# News App Admin Dashboard

A comprehensive admin dashboard for managing news articles with automatic push notifications. Built with Next.js, TypeScript, MongoDB, Prisma, and Firebase.

## Features

- **Authentication**: Secure admin authentication using NextAuth.js
- **News Management**: Create, edit, delete, and publish/unpublish news articles
- **Rich Text Editor**: Create engaging content with a rich text editor
- **Image Upload**: Upload and manage featured images via Cloudinary
- **Category Management**: Organize news articles into categories
- **Push Notifications**: Automatic Firebase push notifications when articles are published
- **Dashboard Analytics**: Overview of total articles, published articles, drafts, and categories
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Image Storage**: Cloudinary
- **UI Components**: Radix UI primitives

## Prerequisites

Before running this application, make sure you have:

- Node.js 18+ installed
- MongoDB database (local or cloud)
- Firebase project with FCM enabled
- Cloudinary account for image uploads

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Database URL
DATABASE_URL="mongodb+srv://username:password@cluster0.mongodb.net/news_app_db?retryWrites=true&w=majority"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-here"

# Firebase Admin Configuration
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_PRIVATE_KEY="your-firebase-private-key"
FIREBASE_CLIENT_EMAIL="your-firebase-client-email"

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd news-app-admin
```

2. Install dependencies:
```bash
npm install
```

3. Generate Prisma client:
```bash
npx prisma generate
```

4. Run database migrations (if using a fresh database):
```bash
npx prisma db push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Quick Setup - Default Admin User

For quick setup, default admin credentials are provided in the `.env` file:

```env
# Default Admin Dashboard Credentials
ADMIN_EMAIL="admin@newsapp.com"
ADMIN_PASSWORD="NewsAdmin123!"
ADMIN_NAME="News Administrator"
```

### Option 1: Automatic Setup (Recommended)
1. Visit `http://localhost:3000/setup` after starting the server
2. Click "Create Admin User" to automatically create the admin account
3. Use the displayed credentials to sign in

### Option 2: Manual Setup via API
```bash
# Create admin user via API call
curl -X POST http://localhost:3000/api/setup/admin

# Or using npm script
npm run seed:admin
```

### Option 3: Manual Database Entry
```javascript
// Connect to your MongoDB and run this script
const bcrypt = require('bcryptjs');

const hashedPassword = await bcrypt.hash('NewsAdmin123!', 12);
await db.users.insertOne({
  email: 'admin@newsapp.com',
  password: hashedPassword,
  name: 'News Administrator',
  role: 'ADMIN',
  createdAt: new Date(),
  updatedAt: new Date()
});
```

⚠️ **Important**: Change the default password after first login for security!

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Schema

The application uses the following data models:

### User
- Admin user authentication and management

### News
- Title, content, featured image, category
- Published status and timestamps
- Relations to categories

### Category
- News article categorization
- Unique names and slugs

### FCMToken
- Device tokens for push notifications
- Platform identification (Android/iOS)

## API Endpoints

### News Management
- `GET /api/news` - Retrieve all news articles with filtering
- `POST /api/news` - Create a new news article
- `GET /api/news/[id]` - Get single news article
- `PUT /api/news/[id]` - Update news article
- `DELETE /api/news/[id]` - Delete news article

### Category Management
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category

### Push Notifications
- `POST /api/fcm-token` - Store/update FCM device token
- `DELETE /api/fcm-token` - Remove FCM token

### File Upload
- `POST /api/upload` - Upload images to Cloudinary

## Usage

### Initial Setup

1. Create an admin user in your MongoDB database:
```javascript
// Connect to your MongoDB and run this script
const bcrypt = require('bcryptjs');

const hashedPassword = await bcrypt.hash('your-password', 12);
await db.users.insertOne({
  email: 'admin@example.com',
  password: hashedPassword,
  name: 'Admin User',
  role: 'admin',
  createdAt: new Date(),
  updatedAt: new Date()
});
```

2. Access the dashboard at `http://localhost:3000`
3. Sign in with your admin credentials
4. Start creating categories and news articles

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
