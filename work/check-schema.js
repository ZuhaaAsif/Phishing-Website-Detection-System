const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSchema() {
    try {
        // Get the model fields by trying to find a user
        const users = await prisma.users.findMany({ take: 1 });
        
        console.log('📊 Users model fields:');
        if (users.length > 0) {
            console.log(Object.keys(users[0]));
        } else {
            console.log('No users found, checking schema definition...');
            // Try to create a dummy user to see error
            try {
                await prisma.users.create({
                    data: {
                        username: 'temp',
                        email: 'temp@temp.com',
                        password: 'temp'
                    }
                });
            } catch (error) {
                const match = error.message.match(/Unknown argument `(.*?)`/);
                if (match) {
                    console.log(`Field '${match[1]}' is not in schema`);
                }
                console.log('Available fields would be shown in error message');
            }
        }
    } catch (error) {
        console.log('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkSchema();