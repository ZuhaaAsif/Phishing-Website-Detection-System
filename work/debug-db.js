const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
    try {
        const users = await prisma.users.findMany();
        console.log('Users in database:');
        console.log(JSON.stringify(users, null, 2));
        
        // Check password_hash format
        users.forEach(user => {
            console.log(`\nUser: ${user.email}`);
            console.log(`Password hash exists: ${!!user.password_hash}`);
            console.log(`Password hash length: ${user.password_hash?.length || 0}`);
            console.log(`Password hash preview: ${user.password_hash?.substring(0, 20)}...`);
        });
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabase();