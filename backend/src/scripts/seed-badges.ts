
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Badges with Images...');

    // 1. Get the first Company
    const company = await prisma.company.findFirst();

    if (!company) {
        console.error('❌ No company found. Please run the app and login as a company first.');
        return;
    }

    console.log(`👤 Found Company: ${company.name} (${company.walletAddress})`);

    // 2. Create Badge Definitions with Unsplash Images
    // Using nature/tech themed images suitable for "EcoCred"
    const badges = [
        {
            name: 'Eco Pioneer',
            description: 'One of the first companies to join the EcoCred platform.',
            tier: 'BRONZE',
            creditsRequired: 0,
            // Green leaf sprout
            imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=400',
            criteria: 'Join the platform',
            displayOrder: 1,
            active: true
        },
        {
            name: 'Carbon Neutral',
            description: 'Offset 100 tons of CO2.',
            tier: 'SILVER',
            creditsRequired: 100,
            // Forest view
            imageUrl: 'https://images.unsplash.com/photo-1448375240586-dfd8f3793371?auto=format&fit=crop&q=80&w=400',
            criteria: 'Offset 100 Credits',
            displayOrder: 2,
            active: true
        },
        {
            name: 'Sustainability Leader',
            description: 'Offset 1000 tons of CO2.',
            tier: 'GOLD',
            creditsRequired: 1000,
            // Planet earth or futuristic green city
            imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400',
            criteria: 'Offset 1000 Credits',
            displayOrder: 3,
            active: true
        }
    ];

    for (const b of badges) {
        const existing = await prisma.badgeDefinition.findFirst({ where: { name: b.name } });
        if (!existing) {
            await prisma.badgeDefinition.create({ data: b });
            console.log(`✅ Created Badge Definition: ${b.name}`);
        } else {
            // Update existing badges with the new image URLs
            await prisma.badgeDefinition.update({
                where: { id: existing.id },
                data: { imageUrl: b.imageUrl }
            });
            console.log(`🔄 Updated Image for Badge: ${b.name}`);
        }
    }

    // 3. Award 'Eco Pioneer' to the company if they don't have it
    const pioneerBadge = await prisma.badgeDefinition.findFirst({ where: { name: 'Eco Pioneer' } });
    if (pioneerBadge) {
        const earned = await prisma.earnedBadge.findUnique({
            where: {
                badgeId_companyId: {
                    badgeId: pioneerBadge.id,
                    companyId: company.id
                }
            }
        });

        if (!earned) {
            await prisma.earnedBadge.create({
                data: {
                    badgeId: pioneerBadge.id,
                    companyId: company.id,
                    tokenId: 1, // Mock Token ID
                    txHash: '0xmockhash1234567890'
                }
            });
            console.log(`🎉 Awarded 'Eco Pioneer' badge to ${company.name}!`);
        } else {
            console.log(`ℹ️ ${company.name} already has 'Eco Pioneer' badge.`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
