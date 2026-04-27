const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function resetDatabase() {
    try {
        console.log('🔄 Resetting database...');
        
        // Delete all users first (cascade will handle reviews)
        await prisma.reviews.deleteMany({});
        await prisma.users.deleteMany({});
        await prisma.websites.deleteMany({});
        
        console.log('✅ Deleted existing data');
        
        // Create new users with proper password_hash
        const users = [
            {
                username: 'john_doe',
                email: 'john@example.com',
                password: 'john123'
            },
            {
                username: 'testuser',
                email: 'test@example.com',
                password: 'test123'
            }
        ];
        
        for (const userData of users) {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            
            const user = await prisma.users.create({
                data: {
                    username: userData.username,
                    email: userData.email,
                    password_hash: hashedPassword,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            });
            
            console.log(`✅ Created user: ${user.username} (${user.email})`);
        }
        
        // Verify the users
        const allUsers = await prisma.users.findMany();
        console.log('\n📊 Current users in database:');
        allUsers.forEach(user => {
            console.log(`- ${user.username} (${user.email}): hash exists = ${!!user.password_hash}`);
        });
        
        // Test authentication
        console.log('\n🔐 Testing authentication...');
        const testUser = await prisma.users.findUnique({
            where: { email: 'test@example.com' }
        });
        
        if (testUser && testUser.password_hash) {
            const isValid = await bcrypt.compare('test123', testUser.password_hash);
            console.log(`Test user authentication: ${isValid ? '✅ PASSED' : '❌ FAILED'}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetDatabase();