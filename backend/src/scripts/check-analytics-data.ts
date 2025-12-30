
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAnalyticsData() {
    console.log('--- Checking Database For Analytics Data ---');

    // 1. Check Total Actions
    const totalActions = await prisma.action.count();
    console.log(`Total Actions: ${totalActions}`);

    // 2. Check Verified Actions
    const verifiedActions = await prisma.action.count({
        where: { status: 'VERIFIED' }
    });
    console.log(`Verified Actions: ${verifiedActions}`);

    // 3. Check Total Credits Awarded
    const credits = await prisma.action.aggregate({
        where: { status: 'VERIFIED' },
        _sum: { creditsAwarded: true }
    });
    console.log(`Total Credits Awarded: ${credits._sum.creditsAwarded || 0}`);

    // 4. Check Leaderboard Calculation manual check
    const leaderboard = await prisma.action.groupBy({
        by: ['companyId'],
        where: { status: 'VERIFIED' },
        _sum: { creditsAwarded: true },
        orderBy: {
            _sum: { creditsAwarded: 'desc' }
        },
        take: 10
    });

    console.log('--- Leaderboard Calculation (Manual) ---');
    console.log(JSON.stringify(leaderboard, null, 2));

    // 5. Check if Company names exist for these IDs
    if (leaderboard.length > 0) {
        const companyIds = leaderboard.map(l => l.companyId);
        const companies = await prisma.company.findMany({
            where: { id: { in: companyIds } },
            select: { id: true, name: true }
        });
        console.log('--- Companies in Leaderboard ---');
        console.log(JSON.stringify(companies, null, 2));
    }
}

checkAnalyticsData()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
