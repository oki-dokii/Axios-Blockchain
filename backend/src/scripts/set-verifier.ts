
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const address = process.argv[2];

if (!address) {
    console.error("❌ Please provide a wallet address.");
    console.error("Usage: npx tsx src/scripts/set-verifier.ts <WALLET_ADDRESS>");
    process.exit(1);
}

async function makeVerifier() {
    console.log(`🔄 Updating role for ${address} to VERIFIER...`);

    try {
        const user = await prisma.user.update({
            where: { walletAddress: address },
            data: {
                role: 'VERIFIER',
            }
        });
        console.log(`✅ User role updated to: ${user.role}`);
    } catch (e) {
        console.error("❌ Failed to update user. user might not exist.");
        console.error(e);
    }
}

makeVerifier()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
