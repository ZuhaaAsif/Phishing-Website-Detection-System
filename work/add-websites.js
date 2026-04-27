const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addWebsites() {
    try {
        console.log('📝 Adding websites to database...\n');
        
        const websites = [
            { website_name: 'Google', url: 'https://google.com', domain: 'google.com' },
            { website_name: 'GitHub', url: 'https://github.com', domain: 'github.com' },
            { website_name: 'PayPal', url: 'https://paypal.com', domain: 'paypal.com' },
            { website_name: 'Amazon', url: 'https://amazon.com', domain: 'amazon.com' },
            { website_name: 'Facebook', url: 'https://facebook.com', domain: 'facebook.com' },
            { website_name: 'Twitter', url: 'https://twitter.com', domain: 'twitter.com' },
            { website_name: 'LinkedIn', url: 'https://linkedin.com', domain: 'linkedin.com' },
            { website_name: 'Netflix', url: 'https://netflix.com', domain: 'netflix.com' },
            { website_name: 'Microsoft', url: 'https://microsoft.com', domain: 'microsoft.com' },
            { website_name: 'Apple', url: 'https://apple.com', domain: 'apple.com' }
        ];
        
        let created = 0;
        let skipped = 0;
        
        for (const website of websites) {
            try {
                // Check if website already exists
                const existing = await prisma.websites.findFirst({
                    where: {
                        OR: [
                            { url: website.url },
                            { domain: website.domain }
                        ]
                    }
                });
                
                if (!existing) {
                    await prisma.websites.create({
                        data: website
                    });
                    console.log(`✅ Created: ${website.website_name} (${website.domain})`);
                    created++;
                } else {
                    console.log(`⚠️ Already exists: ${website.website_name} (ID: ${existing.website_id})`);
                    skipped++;
                }
            } catch (error) {
                console.error(`❌ Failed to create ${website.website_name}:`, error.message);
            }
        }
        
        console.log(`\n📊 Summary: ${created} created, ${skipped} skipped`);
        
        // List all websites
        const allWebsites = await prisma.websites.findMany({
            orderBy: { website_id: 'asc' }
        });
        
        console.log('\n📋 All websites in database:');
        console.log('━'.repeat(50));
        allWebsites.forEach(w => {
            console.log(`ID: ${w.website_id} | ${w.website_name} | ${w.domain}`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addWebsites();