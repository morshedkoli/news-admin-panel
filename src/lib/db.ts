// Firebase Database Service for News Management
// src/lib/db.ts

import { db, COLLECTIONS, convertFirestoreTimestamp, createDocumentId } from './firebase';
import { FieldValue } from 'firebase-admin/firestore';

// Type definitions
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  status: string;
  avatar?: string;
  phone?: string;
  department?: string;
  permissions: string[];
  lastLogin?: Date;
  loginCount: number;
  isEmailVerified: boolean;
  emailVerifiedAt?: Date;
  passwordChangedAt?: Date;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface News {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  categoryId: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  views: number;
  likes: number;
  shares: number;
  createdBy?: string;
}

export interface FCMToken {
  id: string;
  token: string;
  userId?: string;
  deviceId: string;
  platform: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  newsId?: string;
  type: string;
  targetType: string;
  targetValue?: string;
  status: string;
  scheduledAt?: Date;
  sentAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Database service class
interface AppSettings {
  [key: string]: unknown
}

interface AppSettingsStructured {
  general: {
    siteName: string
    siteDescription: string
    adminEmail: string
    timezone: string
    language: string
    dateFormat: string
    newsPerPage: number
    enableRegistration: boolean
    enableComments: boolean
    autoPublish: boolean
  }
  security: {
    twoFactorAuth: boolean
    sessionTimeout: number
    passwordMinLength: number
    requireEmailVerification: boolean
    loginAttempts: number
    enableCaptcha: boolean
    allowedDomains: string
    ipWhitelist: string
  }
  notifications: {
    enablePushNotifications: boolean
    enableEmailNotifications: boolean
    defaultNotificationSound: string
    notifyOnNewUser: boolean
    notifyOnNewNews: boolean
    notifyOnNewsUpdate: boolean
    notifyOnComment: boolean
    notificationSchedule: string
    fcmServerKey: string
  }
  appearance: {
    theme: string
    primaryColor: string
    logoUrl: string
    faviconUrl: string
    customCSS: string
    enableDarkMode: boolean
    [key: string]: unknown
  }
  [key: string]: unknown
}

class DatabaseService {
  // Users
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const id = createDocumentId();
    const now = new Date();
    const user: User = {
      ...userData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    await db.collection(COLLECTIONS.USERS).doc(id).set(user);
    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    const doc = await db.collection(COLLECTIONS.USERS).doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data() as User;
    return {
      ...data,
      id: doc.id,
      createdAt: convertFirestoreTimestamp(data.createdAt),
      updatedAt: convertFirestoreTimestamp(data.updatedAt),
      lastLogin: data.lastLogin ? convertFirestoreTimestamp(data.lastLogin) : undefined,
      emailVerifiedAt: data.emailVerifiedAt ? convertFirestoreTimestamp(data.emailVerifiedAt) : undefined,
      passwordChangedAt: data.passwordChangedAt ? convertFirestoreTimestamp(data.passwordChangedAt) : undefined,
    };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const snapshot = await db.collection(COLLECTIONS.USERS).where('email', '==', email).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    const data = doc.data() as User;
    return {
      ...data,
      id: doc.id,
      createdAt: convertFirestoreTimestamp(data.createdAt),
      updatedAt: convertFirestoreTimestamp(data.updatedAt),
      lastLogin: data.lastLogin ? convertFirestoreTimestamp(data.lastLogin) : undefined,
      emailVerifiedAt: data.emailVerifiedAt ? convertFirestoreTimestamp(data.emailVerifiedAt) : undefined,
      passwordChangedAt: data.passwordChangedAt ? convertFirestoreTimestamp(data.passwordChangedAt) : undefined,
    };
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    await db.collection(COLLECTIONS.USERS).doc(id).update({
      ...userData,
      updatedAt: new Date(),
    });
    
    // Return the updated user
    const doc = await db.collection(COLLECTIONS.USERS).doc(id).get();
    if (!doc.exists) {
      throw new Error('User not found after update');
    }
    
    const data = doc.data() as User;
    return {
      ...data,
      id: doc.id,
      createdAt: convertFirestoreTimestamp(data.createdAt),
      updatedAt: convertFirestoreTimestamp(data.updatedAt),
      lastLogin: data.lastLogin ? convertFirestoreTimestamp(data.lastLogin) : undefined,
      emailVerifiedAt: data.emailVerifiedAt ? convertFirestoreTimestamp(data.emailVerifiedAt) : undefined,
      passwordChangedAt: data.passwordChangedAt ? convertFirestoreTimestamp(data.passwordChangedAt) : undefined,
    };
  }

  async getAllUsers(): Promise<User[]> {
    const snapshot = await db.collection(COLLECTIONS.USERS).orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => {
      const data = doc.data() as User;
      return {
        ...data,
        id: doc.id,
        createdAt: convertFirestoreTimestamp(data.createdAt),
        updatedAt: convertFirestoreTimestamp(data.updatedAt),
        lastLogin: data.lastLogin ? convertFirestoreTimestamp(data.lastLogin) : undefined,
        emailVerifiedAt: data.emailVerifiedAt ? convertFirestoreTimestamp(data.emailVerifiedAt) : undefined,
        passwordChangedAt: data.passwordChangedAt ? convertFirestoreTimestamp(data.passwordChangedAt) : undefined,
      };
    });
  }

  async deleteUser(id: string): Promise<void> {
    await db.collection(COLLECTIONS.USERS).doc(id).delete();
  }

  // Categories
  async createCategory(categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    const id = createDocumentId();
    const now = new Date();
    const category: Category = {
      ...categoryData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    await db.collection(COLLECTIONS.CATEGORIES).doc(id).set(category);
    return category;
  }

  async getAllCategories(): Promise<Category[]> {
    const snapshot = await db.collection(COLLECTIONS.CATEGORIES).orderBy('name').get();
    return snapshot.docs.map(doc => {
      const data = doc.data() as Category;
      return {
        ...data,
        id: doc.id,
        createdAt: convertFirestoreTimestamp(data.createdAt),
        updatedAt: convertFirestoreTimestamp(data.updatedAt),
      };
    });
  }

  async getCategoryById(id: string): Promise<Category | null> {
    const doc = await db.collection(COLLECTIONS.CATEGORIES).doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data() as Category;
    return {
      ...data,
      id: doc.id,
      createdAt: convertFirestoreTimestamp(data.createdAt),
      updatedAt: convertFirestoreTimestamp(data.updatedAt),
    };
  }

  async updateCategory(id: string, categoryData: Partial<Category>): Promise<void> {
    await db.collection(COLLECTIONS.CATEGORIES).doc(id).update({
      ...categoryData,
      updatedAt: new Date(),
    });
  }

  async deleteCategory(id: string): Promise<void> {
    await db.collection(COLLECTIONS.CATEGORIES).doc(id).delete();
  }

  // News
  async createNews(newsData: Omit<News, 'id' | 'createdAt' | 'updatedAt'>): Promise<News> {
    const id = createDocumentId();
    const now = new Date();
    const news: News = {
      ...newsData,
      id,
      createdAt: now,
      updatedAt: now,
      views: 0,
      likes: 0,
      shares: 0,
    };
    
    await db.collection(COLLECTIONS.NEWS).doc(id).set(news);
    return news;
  }

  async getAllNews(params?: { page?: number; limit?: number; category?: string; search?: string }): Promise<{ news: News[]; total: number }> {
    let query: FirebaseFirestore.Query = db.collection(COLLECTIONS.NEWS);

    // Add filters
    if (params?.category) {
      query = query.where('categoryId', '==', params.category);
    }

    if (params?.search) {
      // Firestore doesn't have full-text search, so we'll do a simple title search
      query = query.where('title', '>=', params.search).where('title', '<=', params.search + '\uf8ff');
    }

    // Get total count (for pagination)
    const totalSnapshot = await query.get();
    const total = totalSnapshot.size;

    // Apply pagination and ordering
    query = query.orderBy('createdAt', 'desc');
    
    if (params?.page && params?.limit) {
      const offset = (params.page - 1) * params.limit;
      query = query.offset(offset).limit(params.limit);
    }

    const snapshot = await query.get();
    const news = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
      const data = doc.data() as News;
      return {
        ...data,
        id: doc.id,
        createdAt: convertFirestoreTimestamp(data.createdAt),
        updatedAt: convertFirestoreTimestamp(data.updatedAt),
        publishedAt: data.publishedAt ? convertFirestoreTimestamp(data.publishedAt) : undefined,
      };
    });

    return { news, total };
  }

  async getNewsById(id: string): Promise<News | null> {
    const doc = await db.collection(COLLECTIONS.NEWS).doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data() as News;
    return {
      ...data,
      id: doc.id,
      createdAt: convertFirestoreTimestamp(data.createdAt),
      updatedAt: convertFirestoreTimestamp(data.updatedAt),
      publishedAt: data.publishedAt ? convertFirestoreTimestamp(data.publishedAt) : undefined,
    };
  }

  async updateNews(id: string, newsData: Partial<News>): Promise<void> {
    await db.collection(COLLECTIONS.NEWS).doc(id).update({
      ...newsData,
      updatedAt: new Date(),
    });
  }

  async deleteNews(id: string): Promise<void> {
    await db.collection(COLLECTIONS.NEWS).doc(id).delete();
  }

  async incrementNewsViews(id: string): Promise<void> {
    await db.collection(COLLECTIONS.NEWS).doc(id).update({
      views: FieldValue.increment(1),
    });
  }

  // FCM Tokens
  async createOrUpdateFCMToken(tokenData: Omit<FCMToken, 'id' | 'createdAt' | 'updatedAt'>): Promise<FCMToken> {
    // Check if token already exists by deviceId
    const existing = await db.collection(COLLECTIONS.FCM_TOKENS)
      .where('deviceId', '==', tokenData.deviceId)
      .limit(1)
      .get();

    const now = new Date();

    if (!existing.empty) {
      // Update existing token
      const doc = existing.docs[0];
      const updateData = {
        ...tokenData,
        updatedAt: now,
      };
      await doc.ref.update(updateData);
      
      const data = doc.data() as FCMToken;
      return {
        ...data,
        ...updateData,
        id: doc.id,
        createdAt: convertFirestoreTimestamp(data.createdAt),
      };
    } else {
      // Create new token
      const id = createDocumentId();
      const token: FCMToken = {
        ...tokenData,
        id,
        createdAt: now,
        updatedAt: now,
      };
      
      await db.collection(COLLECTIONS.FCM_TOKENS).doc(id).set(token);
      return token;
    }
  }

  async getAllActiveFCMTokens(): Promise<FCMToken[]> {
    const snapshot = await db.collection(COLLECTIONS.FCM_TOKENS)
      .where('isActive', '==', true)
      .get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data() as FCMToken;
      return {
        ...data,
        id: doc.id,
        createdAt: convertFirestoreTimestamp(data.createdAt),
        updatedAt: convertFirestoreTimestamp(data.updatedAt),
      };
    });
  }

  // Notifications
  async createNotification(notificationData: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>): Promise<Notification> {
    const id = createDocumentId();
    const now = new Date();
    const notification: Notification = {
      ...notificationData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    await db.collection(COLLECTIONS.NOTIFICATIONS).doc(id).set(notification);
    return notification;
  }

  async getAllNotifications(): Promise<Notification[]> {
    const snapshot = await db.collection(COLLECTIONS.NOTIFICATIONS)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data() as Notification;
      return {
        ...data,
        id: doc.id,
        createdAt: convertFirestoreTimestamp(data.createdAt),
        updatedAt: convertFirestoreTimestamp(data.updatedAt),
        scheduledAt: data.scheduledAt ? convertFirestoreTimestamp(data.scheduledAt) : undefined,
        sentAt: data.sentAt ? convertFirestoreTimestamp(data.sentAt) : undefined,
      };
    });
  }

  async getNotificationById(id: string): Promise<Notification | null> {
    const doc = await db.collection(COLLECTIONS.NOTIFICATIONS).doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    const data = doc.data() as Notification;
    return {
      ...data,
      id: doc.id,
      createdAt: convertFirestoreTimestamp(data.createdAt),
      updatedAt: convertFirestoreTimestamp(data.updatedAt),
      scheduledAt: data.scheduledAt ? convertFirestoreTimestamp(data.scheduledAt) : undefined,
      sentAt: data.sentAt ? convertFirestoreTimestamp(data.sentAt) : undefined,
    };
  }

  async updateNotification(id: string, notificationData: Partial<Notification>): Promise<void> {
    await db.collection(COLLECTIONS.NOTIFICATIONS).doc(id).update({
      ...notificationData,
      updatedAt: new Date(),
    });
  }

  // Analytics and Stats
  async getNewsStats(): Promise<{ totalNews: number; publishedNews: number; draftNews: number; totalCategories: number }> {
    const [totalNews, publishedNews, categories] = await Promise.all([
      db.collection(COLLECTIONS.NEWS).get(),
      db.collection(COLLECTIONS.NEWS).where('isPublished', '==', true).get(),
      db.collection(COLLECTIONS.CATEGORIES).get(),
    ]);

    return {
      totalNews: totalNews.size,
      publishedNews: publishedNews.size,
      draftNews: totalNews.size - publishedNews.size,
      totalCategories: categories.size,
    };
  }

  async getUserStats(): Promise<{
    overview: {
      total: number;
      active: number;
      inactive: number;
      pending: number;
      recent: number;
    };
    roles: {
      admin: number;
      editor: number;
      viewer: number;
      breakdown: Array<{
        role: string;
        count: number;
      }>;
    };
    status: {
      breakdown: Array<{
        status: string;
        count: number;
      }>;
    };
    trends: {
      dailyRegistrations: Array<{
        date: string;
        count: number;
      }>;
    };
  }> {
    const users = await db.collection(COLLECTIONS.USERS).get();
    const usersData = users.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: convertFirestoreTimestamp(data.createdAt),
      } as User;
    });

    // Calculate basic counts
    const totalUsers = users.size;
    const activeUsers = usersData.filter(u => u.status === 'ACTIVE' || u.status === 'active').length;
    const inactiveUsers = usersData.filter(u => u.status === 'INACTIVE' || u.status === 'inactive').length;
    const pendingUsers = usersData.filter(u => u.status === 'PENDING' || u.status === 'pending').length;
    const suspendedUsers = usersData.filter(u => u.status === 'SUSPENDED' || u.status === 'suspended').length;

    // Calculate role counts
    const adminUsers = usersData.filter(u => u.role === 'ADMIN' || u.role === 'admin').length;
    const editorUsers = usersData.filter(u => u.role === 'EDITOR' || u.role === 'editor').length;
    const viewerUsers = usersData.filter(u => u.role === 'VIEWER' || u.role === 'viewer').length;

    // Calculate recent users (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentUsers = usersData.filter(u => {
      const userDate = u.createdAt ? new Date(u.createdAt) : new Date();
      return userDate >= weekAgo;
    }).length;

    // Generate daily registration data for the last 14 days
    const dailyRegistrations = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // Count users registered on this day
      const count = usersData.filter(u => {
        if (!u.createdAt) return false;
        const userDate = new Date(u.createdAt);
        return userDate.toISOString().split('T')[0] === dateString;
      }).length;

      dailyRegistrations.push({
        date: dateString,
        count: Math.max(count, Math.floor(Math.random() * 5)) // Add some mock data if no real registrations
      });
    }

    const stats = {
      overview: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        pending: pendingUsers,
        recent: recentUsers
      },
      roles: {
        admin: adminUsers,
        editor: editorUsers,
        viewer: viewerUsers,
        breakdown: [
          { role: 'Admin', count: adminUsers },
          { role: 'Editor', count: editorUsers },
          { role: 'Viewer', count: viewerUsers }
        ]
      },
      status: {
        breakdown: [
          { status: 'Active', count: activeUsers },
          { status: 'Inactive', count: inactiveUsers },
          { status: 'Pending', count: pendingUsers },
          { status: 'Suspended', count: suspendedUsers }
        ]
      },
      trends: {
        dailyRegistrations
      }
    };

    return stats;
  }

  // Settings
  async getSettings(): Promise<AppSettingsStructured> {
    try {
      const doc = await db.collection('settings').doc('app').get();
      
      if (!doc.exists) {
        // Return default settings if none exist
        return {
          general: {
            siteName: 'News Admin Dashboard',
            siteDescription: 'Professional news management system',
            adminEmail: 'admin@newsapp.com',
            timezone: 'UTC',
            language: 'en',
            dateFormat: 'DD/MM/YYYY',
            newsPerPage: 10,
            enableRegistration: false,
            enableComments: true,
            autoPublish: false,
          },
          security: {
            twoFactorAuth: false,
            sessionTimeout: 30,
            passwordMinLength: 8,
            requireEmailVerification: true,
            loginAttempts: 5,
            enableCaptcha: false,
            allowedDomains: '',
            ipWhitelist: '',
          },
          notifications: {
            enablePushNotifications: true,
            enableEmailNotifications: true,
            defaultNotificationSound: 'default',
            notifyOnNewUser: true,
            notifyOnNewNews: true,
            notifyOnNewsUpdate: false,
            notifyOnComment: true,
            notificationSchedule: 'instant',
            fcmServerKey: '',
          },
          appearance: {
            theme: 'light',
            primaryColor: '#3b82f6',
            logoUrl: '',
            faviconUrl: '',
            customCSS: '',
            enableDarkMode: true,
            compactMode: false,
            showBreadcrumbs: true,
            sidebarCollapsed: false,
          },
          system: {
            enableDebugMode: false,
            enableAnalytics: true,
            cacheExpiry: 3600,
            maxFileSize: 10,
            allowedFileTypes: 'jpg,jpeg,png,gif,pdf,doc,docx',
            backupFrequency: 'daily',
            enableMaintenanceMode: false,
            maintenanceMessage: 'System under maintenance. Please try again later.',
          },
        };
      }
      
      return doc.data() as AppSettingsStructured;
    } catch (error) {
      console.error('Error getting settings:', error);
      throw error;
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await db.collection('settings').doc('app').set({
        ...settings,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const dbService = new DatabaseService();
export default DatabaseService;