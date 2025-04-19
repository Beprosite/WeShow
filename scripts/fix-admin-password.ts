import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function fixAdminPassword() {
  try {
    // Use the exact ID from the database
    const adminId = 'cm9o41cwo0000f1rod35wa8i';
    
    // Hash the current password
    const hashedPassword = await bcrypt.hash('Admin123', 10);

    // Update the admin record with the hashed password
    const updatedAdmin = await prisma.masterAdmin.update({
      where: {
        id: adminId
      },
      data: {
        password: hashedPassword
      }
    });

    console.log('Admin password updated successfully');
    console.log('You can now log in with:');
    console.log('Username: Admin');
    console.log('Password: Admin123');

  } catch (error) {
    console.error('Error updating admin password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminPassword(); 