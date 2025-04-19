const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixAdminPassword() {
  try {
    // First find the admin by username
    const admin = await prisma.masterAdmin.findUnique({
      where: {
        username: 'Admin'
      }
    });

    if (!admin) {
      console.error('Admin user not found');
      return;
    }

    console.log('Found admin user:', admin.username);
    
    // Hash the current password
    const hashedPassword = await bcrypt.hash('Admin123', 10);

    // Update the admin record with the hashed password
    const updatedAdmin = await prisma.masterAdmin.update({
      where: {
        id: admin.id // Use the ID we found
      },
      data: {
        password: hashedPassword
      }
    });

    console.log('Admin password updated successfully');
    console.log('You can now log in with:');
    console.log('Username: Admin');
    console.log('Password: Admin123');
    console.log('New password hash:', hashedPassword);

  } catch (error) {
    console.error('Error updating admin password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminPassword(); 