import bcrypt from 'bcryptjs';

const password = 'BeProAdmin2024!@#'; // You can change this to your desired password
const saltRounds = 10;

bcrypt.hash(password, saltRounds).then(hashedPassword => {
  console.log('Use this hashed password in Prisma Studio:');
  console.log(hashedPassword);
}); 