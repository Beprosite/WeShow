import { PrismaClient } from '@prisma/client'

// Log to help debug initialization
console.log('Initializing Prisma Client');

// In development, use a global variable to prevent multiple instances
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Function to create a new Prisma client
const createPrismaClient = () => {
  try {
    // Create a new Prisma client with explicit database URL
    const client = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });

    // Test connection immediately
    client.$connect().catch(e => {
      console.error('Failed to connect to database:', e);
    });

    return client;
  } catch (error) {
    console.error('Failed to create Prisma client:', error);
    throw error;
  }
};

// Create or reuse the Prisma client
export const prisma = globalForPrisma.prisma ?? (() => {
  try {
    const client = createPrismaClient();
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = client;
    }
    return client;
  } catch (error) {
    console.error('Error initializing Prisma client:', error);
    throw error;
  }
})();

// Function to test database connection
export async function testConnection() {
  try {
    await prisma.$connect();
    console.log('Successfully connected to database');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
} 