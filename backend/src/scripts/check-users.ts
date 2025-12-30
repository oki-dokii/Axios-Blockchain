import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
    const users = await prisma.user.findMany({
        include: { company: true }
    });
    console.log('Current Users:', JSON.stringify(users, null, 2));
}

listUsers()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
