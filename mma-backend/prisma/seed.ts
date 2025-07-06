import { PrismaClient } from "@prisma/client";
import fs from 'fs/promises';
import path from "path";

const prisma = new PrismaClient();

interface UFCFighter {
    name: string;
    nickname?: string;
    weightClass: string;
    nationality?: string;
    height?: number;
    weight?: number;
    reach?: number;
    wins: number;
    losses: number;
    draws: number;
    isActive: boolean;
    ufcStatsUrl?: string;
    birthDate?: string;
    stance?: string;
}

async function loadFightersFromJSON(): Promise<UFCFighter[]> {
    try {
        const filePath = path.join(process.cwd(), 'data', 'fighters.json');
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.log('⚠️  No fighters.json found, using default seed data');
        return getDefaultFighters();
    }
}

function getDefaultFighters(): UFCFighter[] {
    return [
        {
            name: "Jon Jones",
            nickname: "Bones",
            weightClass: "LIGHT_HEAVYWEIGHT",
            nationality: "USA",
            height: 193,
            weight: 93,
            reach: 215,
            wins: 26,
            losses: 1,
            draws: 0,
            isActive: true,
            stance: "Orthodox"
        },
        {
            name: "Khabib Nurmagomedov",
            nickname: "The Eagle",
            weightClass: "LIGHTWEIGHT",
            nationality: "Russia",
            height: 178,
            weight: 70,
            reach: 178,
            wins: 29,
            losses: 0,
            draws: 0,
            isActive: false,
            stance: "Orthodox"
        },
        {
            name: "Anderson Silva",
            nickname: "The Spider",
            weightClass: "MIDDLEWEIGHT",
            nationality: "Brazil",
            height: 188,
            weight: 84,
            reach: 197,
            wins: 34,
            losses: 11,
            draws: 0,
            isActive: false,
            stance: "Southpaw"
        },
        {
            name: "Conor McGregor",
            nickname: "Notorious",
            weightClass: "LIGHTWEIGHT",
            nationality: "Ireland",
            height: 175,
            weight: 70,
            reach: 188,
            wins: 22,
            losses: 6,
            draws: 0,
            isActive: true,
            stance: "Southpaw"
        },
        {
            name: "Israel Adesanya",
            nickname: "The Last Stylebender",
            weightClass: "MIDDLEWEIGHT",
            nationality: "New Zealand",
            height: 193,
            weight: 84,
            reach: 203,
            wins: 24,
            losses: 2,
            draws: 0,
            isActive: true,
            stance: "Switch"
        }
    ];
}

async function main() {
    console.log('🌱 Starting database seeding...');

    try {
        // Clear existing data
        console.log('🗑️  Clearing existing fighters...');
        await prisma.fighter.deleteMany({});

        // Load fighters data
        console.log('📁 Loading fighters data...');
        const fighters = await loadFightersFromJSON();

        console.log(`👥 Found ${fighters.length} fighters to seed`);

        // Create fighters
        let successCount = 0;
        let errorCount = 0;

        for (const fighter of fighters) {
            try {
                // Parse birth date if available
                let birthDate: Date | undefined;
                if (fighter.birthDate) {
                    try {
                        birthDate = new Date(fighter.birthDate);
                        // Check if date is valid
                        if (isNaN(birthDate.getTime())) {
                            birthDate = undefined;
                        }
                    } catch {
                        birthDate = undefined;
                    }
                }

                await prisma.fighter.create({
                    data: {
                        name: fighter.name,
                        nickname: fighter.nickname || null,
                        weightClass: fighter.weightClass,
                        nationality: fighter.nationality || null,
                        height: fighter.height || null,
                        weight: fighter.weight || null,
                        reach: fighter.reach || null,
                        wins: fighter.wins,
                        losses: fighter.losses,
                        draws: fighter.draws,
                        isActive: fighter.isActive,
                        birthDate: birthDate || null,
                        stance: fighter.stance || null
                    }
                });

                successCount++;
                console.log(`✅ ${successCount}. ${fighter.name} (${fighter.weightClass})`);

            } catch (error) {
                errorCount++;
                console.error(`❌ Error seeding ${fighter.name}:`, error);
            }
        }

        console.log('\n🎉 Database seeding completed!');
        console.log(`✅ Successfully seeded: ${successCount} fighters`);
        console.log(`❌ Errors: ${errorCount} fighters`);

        // Show some stats
        const totalFighters = await prisma.fighter.count();
        const weightClassStats = await prisma.fighter.groupBy({
            by: ['weightClass'],
            _count: {
                weightClass: true
            }
        });

        console.log(`\n📊 Database Statistics:`);
        console.log(`📦 Total fighters: ${totalFighters}`);
        console.log(`🏷️  Weight class distribution:`);

        weightClassStats.forEach(stat => {
            console.log(`   ${stat.weightClass}: ${stat._count.weightClass} fighters`)
        });

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });