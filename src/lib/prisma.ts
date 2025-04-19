'use server';

import { PrismaClient } from '@prisma/client'

// Log to help debug initialization
console.log('Initializing Prisma Client');

declare global {
  var prisma: PrismaClient | undefined
}

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

// Initialize prisma as null by default
let prisma: PrismaClient | null = null

// Only create Prisma client when explicitly requested
export async function getPrismaClient() {
  try {
    if (isBrowser) {
      console.error('Attempted to use PrismaClient in browser environment');
      throw new Error('PrismaClient cannot be used in the browser')
    }

    if (!prisma) {
      console.log('Creating new PrismaClient instance...');
      if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL is not defined in environment variables');
        throw new Error('DATABASE_URL is not defined')
      }

      prisma = new PrismaClient({
        log: ['error', 'warn', 'query'],
        datasources: {
          db: {
            url: process.env.DATABASE_URL
          }
        }
      })

      if (process.env.NODE_ENV !== 'production') {
        global.prisma = prisma
      }

      // Test the connection
      try {
        await prisma.$connect()
        console.log('Successfully connected to database');
      } catch (connectError) {
        console.error('Failed to connect to database:', connectError);
        throw connectError
      }
    }

    return prisma
  } catch (error) {
    console.error('Error in getPrismaClient:', error);
    throw error
  }
}

// Remove the direct prisma export
// export { prisma }

export async function withPrisma<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T> {
  try {
    if (isBrowser) {
      console.error('Attempted to use withPrisma in browser environment');
      throw new Error('PrismaClient cannot be used in the browser')
    }
    
    const client = await getPrismaClient()
    
    console.log('Executing Prisma operation...');
    const result = await fn(client)
    console.log('Prisma operation completed successfully');
    return result
  } catch (error) {
    console.error('Error in withPrisma:', error);
    throw error
  }
}

// Function to test database connection
export async function testConnection(): Promise<boolean> {
  try {
    if (isBrowser) {
      console.error('Attempted to test connection in browser environment');
      throw new Error('PrismaClient cannot be used in the browser')
    }

    const client = await getPrismaClient()

    console.log('Testing database connection...');
    await client.$connect()
    await client.$queryRaw`SELECT 1`
    console.log('Successfully connected to database')
    return true
  } catch (error) {
    console.error('Database connection error:', error)
    return false
  }
} 