// Firebase Database Service Export
// This file provides compatibility for files that previously used Prisma
import { dbService } from './db'

// Export the Firebase database service as 'prisma' for compatibility
export const prisma = dbService