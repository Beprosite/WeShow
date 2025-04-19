import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const prisma = new PrismaClient();

async function checkMasterAdmin() {
  try {
    console.log('Connecting to database...');
    console.log('Database URL:', process.env.DATABASE_URL?.substring(0, 20) + '...');
    
    // Test database connection
    await prisma.$connect();
    console.log('Successfully connected to database');

    // First, let's see all master admins
    const allAdmins = await prisma.masterAdmin.findMany();
    console.log('\nTotal master admins found:', allAdmins.length);
    
    if (allAdmins.length > 0) {
      console.log('\nAll admin usernames:');
      allAdmins.forEach(admin => {
        console.log('- Username:', admin.username);
      });
    }

    // Now look for our specific admin
    console.log('\nLooking for admin with username "Admin"...');
    const admin = await prisma.masterAdmin.findUnique({
      where: {
        username: 'Admin'
      }
    });

    if (!admin) {
      console.log('No master admin found with username "Admin"');
      return;
    }

    console.log('\nFound master admin:');
    console.log('ID:', admin.id);
    console.log('Username:', admin.username);
    console.log('Password length:', admin.password.length);
    console.log('Is password bcrypt hashed:', admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$'));
    console.log('First 20 chars of password:', admin.password.substring(0, 20) + '...');
    console.log('Created at:', admin.createdAt);
    console.log('Updated at:', admin.updatedAt);

  } catch (error) {
    console.error('Error checking master admin:', error);
  } finally {
    console.log('\nDisconnecting from database...');
    await prisma.$disconnect();
  }
}

checkMasterAdmin(); 