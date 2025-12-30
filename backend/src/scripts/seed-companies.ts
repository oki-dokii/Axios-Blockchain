
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Companies...');

    const companies = [
        {
            email: "contact@ecotech.example.com",
            passwordHash: "hashed_password_123", // Using passwordHash based on schema
            role: "COMPANY",
            walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
            company: {
                create: {
                    name: "EcoTech Solutions",
                    industry: "Technology",
                    verified: true,
                    walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                }
            }
        },
        {
            email: "info@greenenergy.example.com",
            passwordHash: "hashed_password_123",
            role: "COMPANY",
            walletAddress: "0x892d35Cc6634C0532925a3b844Bc454e4438f45f",
            company: {
                create: {
                    name: "GreenEnergy Corp",
                    industry: "Energy",
                    verified: true,
                    walletAddress: "0x892d35Cc6634C0532925a3b844Bc454e4438f45f"
                }
            }
        },
        {
            email: "hello@sustextiles.example.com",
            passwordHash: "hashed_password_123",
            role: "COMPANY",
            walletAddress: "0x982d35Cc6634C0532925a3b844Bc454e4438f46g",
            company: {
                create: {
                    name: "Sustainable Textiles",
                    industry: "Manufacturing",
                    verified: false,
                    walletAddress: "0x982d35Cc6634C0532925a3b844Bc454e4438f46g"
                }
            }
        },
        {
            email: "save@ocean.example.com",
            passwordHash: "hashed_password_123",
            role: "COMPANY",
            walletAddress: "0xa12d35Cc6634C0532925a3b844Bc454e4438f47h",
            company: {
                create: {
                    name: "Ocean Cleanup Org",
                    industry: "Non-Profit",
                    verified: true,
                    walletAddress: "0xa12d35Cc6634C0532925a3b844Bc454e4438f47h"
                }
            }
        }
    ];

    for (const c of companies) {
        // cast c.role to any or allow prisma to infer
        const data: any = { ...c };

        const existing = await prisma.user.findFirst({
            where: { email: c.email }
        });

        if (!existing) {
            await prisma.user.create({
                data: data
            });
            console.log(`✅ Created Company User: ${c.email}`);
        } else {
            console.log(`ℹ️ Company User ${c.email} already exists.`);
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
