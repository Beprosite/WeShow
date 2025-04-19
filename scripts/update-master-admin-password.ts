import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const prisma = new PrismaClient();

async function updateMasterAdminPassword() {
  try {
    console.log('Connecting to database...');
    console.log('Database URL:', process.env.DATABASE_URL?.substring(0, 20) + '...');
    
    // Test database connection
    await prisma.$connect();
    console.log('Successfully connected to database');

    // Find the existing master admin with specific username
    console.log('\nLooking for admin with username "Admin"...');
    const existingAdmin = await prisma.masterAdmin.findUnique({
      where: {
        username: 'Admin'
      }
    });

    if (!existingAdmin) {
      console.error('No master admin found with username "Admin"');
      return;
    }

    console.log('Found admin:', existingAdmin.username);

    // Use the specific password
    const newPassword = 'Admin123';
    
    // Hash the new password
    console.log('\nHashing password...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('Password hashed successfully');

    // Update the master admin's password
    console.log('\nUpdating admin password...');
    const updatedAdmin = await prisma.masterAdmin.update({
      where: {
        id: existingAdmin.id
      },
      data: {
        password: hashedPassword
      }
    });

    console.log('\nMaster Admin password updated successfully');
    console.log('You can now log in with:');
    console.log('Username:', existingAdmin.username);
    console.log('Password:', newPassword);
    console.log('\nPassword hash details:');
    console.log('Length:', hashedPassword.length);
    console.log('Starts with:', hashedPassword.substring(0, 7));

  } catch (error) {
    console.error('Error updating master admin password:', error);
  } finally {
    console.log('\nDisconnecting from database...');
    await prisma.$disconnect();
  }
}

updateMasterAdminPassword(); 