import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const actionTypes = [
    {
        type: 'tree_planting',
        label: 'Tree Planting',
        description: 'Planting native trees in verified reforestation projects',
        unit: 'trees',
        defaultCreditsPerUnit: 10,
        minCreditsPerUnit: 1,
        maxCreditsPerUnit: 100
    },
    {
        type: 'solar_installation',
        label: 'Solar Installation',
        description: 'Installation of solar photovoltaic systems',
        unit: 'kW',
        defaultCreditsPerUnit: 50,
        minCreditsPerUnit: 10,
        maxCreditsPerUnit: 500
    },
    {
        type: 'recycling',
        label: 'Waste Recycling',
        description: 'Recycling of industrial or commercial waste materials',
        unit: 'kg',
        defaultCreditsPerUnit: 2,
        minCreditsPerUnit: 1,
        maxCreditsPerUnit: 10
    },
    {
        type: 'renewable_energy',
        label: 'Renewable Energy Generation',
        description: 'Generation of clean energy from renewable sources',
        unit: 'kWh',
        defaultCreditsPerUnit: 1,
        minCreditsPerUnit: 0,
        maxCreditsPerUnit: 5
    },
    {
        type: 'carbon_capture',
        label: 'Carbon Capture',
        description: 'Direct capture and sequestration of CO2',
        unit: 'tons',
        defaultCreditsPerUnit: 100,
        minCreditsPerUnit: 50,
        maxCreditsPerUnit: 1000
    },
    {
        type: 'ocean_cleanup',
        label: 'Ocean Cleanup',
        description: 'Removal of plastic and debris from marine environments',
        unit: 'kg',
        defaultCreditsPerUnit: 5,
        minCreditsPerUnit: 1,
        maxCreditsPerUnit: 20
    },
    {
        type: 'energy_efficiency',
        label: 'Energy Efficiency',
        description: 'Implementation of energy-saving technologies',
        unit: 'kWh saved',
        defaultCreditsPerUnit: 3,
        minCreditsPerUnit: 1,
        maxCreditsPerUnit: 10
    },
    {
        type: 'composting',
        label: 'Composting',
        description: 'Composting of organic waste materials',
        unit: 'kg',
        defaultCreditsPerUnit: 1,
        minCreditsPerUnit: 0,
        maxCreditsPerUnit: 5
    }
];

async function seedActionTypes() {
    console.log('🌱 Seeding action types...\n');

    try {
        for (const type of actionTypes) {
            await prisma.actionType.upsert({
                where: { type: type.type },
                update: type,
                create: {
                    ...type,
                    active: true
                }
            });
            console.log(`   ✓ ${type.label}`);
        }
        console.log(`\n✅ Seeded ${actionTypes.length} action types\n`);
    } catch (error) {
        console.error('❌ Error seeding action types:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedActionTypes()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
