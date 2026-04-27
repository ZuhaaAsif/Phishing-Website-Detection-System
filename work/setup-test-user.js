const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function setupTestUser() {
    try {
        console.log('🗑️  Clearing existing users...');
        
        // Delete all reviews first (due to foreign key constraint)
        await prisma.reviews.deleteMany({});
        // Then delete all users
        await prisma.users.deleteMany({});
        // Also clear websites
        await prisma.websites.deleteMany({});
        
        console.log('✅ Database cleared');
        
        // Hash password
        const hashedPassword = await bcrypt.hash('test123', 10);
        
        // Create test user
        console.log('\n👤 Creating test user...');
        const user = await prisma.users.create({
            data: {
                username: 'testuser',
                email: 'test@example.com',
                password: hashedPassword
            }
        });
        
        console.log('✅ Test user created successfully!');
        console.log('\n📊 User details:');
        console.log(`   ID: ${user.user_id}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Password hash: ${user.password.substring(0, 20)}...`);
        
        // Verify password works
        const isValid = await bcrypt.compare('test123', user.password);
        console.log(`\n🔐 Password verification: ${isValid ? '✅ SUCCESS' : '❌ FAILED'}`);
        
        if (isValid) {
            console.log('\n🎉 SUCCESS! You can now login with:');
            console.log('   Email: test@example.com');
            console.log('   Password: test123');
        }
        
        // Show all users
        const allUsers = await prisma.users.findMany();
        console.log('\n📋 All users in database:');
        allUsers.forEach(u => {
            console.log(`   - ${u.username} (${u.email})`);
        });
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

setupTestUser();