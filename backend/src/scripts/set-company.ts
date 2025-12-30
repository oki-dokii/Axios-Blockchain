
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const address = process.argv[2];

if (!address) {
    console.error("❌ Please provide a wallet address.");
    console.error("Usage: npx tsx src/scripts/set-company.ts <WALLET_ADDRESS>");
    process.exit(1);
}

async function makeCompany() {
    console.log(`🔄 Updating role for ${address} to COMPANY...`);

    try {
        const user = await prisma.user.update({
            where: { walletAddress: address },
            data: {
                role: 'COMPANY',
            }
        });
        console.log(`✅ User role updated to: ${user.role}`);
    } catch (e) {
        console.error("❌ Failed to update user. user might not exist.");
        console.error(e);
    }
}

makeCompany()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
