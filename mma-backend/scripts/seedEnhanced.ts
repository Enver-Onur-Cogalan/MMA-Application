// scripts/seedEnhanced.ts
import { PrismaClient } from "@prisma/client";
import fs from 'fs/promises';
import path from "path";

const prisma = new PrismaClient();

interface EnhancedFighterData {
    name: string;
    nickname?: string;
    weightClass: string;
    nationality?: string;
    age?: number;
    height?: number;
    weight?: number;
    reach?: number;
    wins: number;
    losses: number;
    draws: number;
    isActive: boolean;
    stance?: string;
    ufcStatsUrl?: string;

    // Enhanced fields from Wikipedia
    photoUrl?: string;
    biography?: string;
    birthPlace?: string;
    birthDate?: string;

    dataQuality: {
        ufcStats: boolean;
        wikipedia: boolean;
        lastUpdated: string;
    };
}

async function loadEnhancedFighters(): Promise<EnhancedFighterData[]> {
    try {
        const filePath = path.join(process.cwd(), 'data', 'enhanced-fighters.json');
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error('❌ Enhanced fighters file not found!');
        console.log('💡 First run: npm run auto-enhance-small');
        throw new Error('Enhanced fighters data not found. Please run auto-enhance first.');
    }
}

async function main() {
    console.log('🌱 Starting enhanced database seeding...');

    try {
        // Clear existing fighters (optional - can be commented out)
        console.log('🗑️  Clearing existing fighters...');
        await prisma.fighter.deleteMany({});

        // Load enhanced fighters data
        console.log('📁 Loading enhanced fighters data...');
        const fighters = await loadEnhancedFighters();

        console.log(`👥 Found ${fighters.length} enhanced fighters to seed`);

        let successCount = 0;
        let errorCount = 0;
        let withPhotosCount = 0;
        let withBiographyCount = 0;

        // Process each fighter
        for (const fighter of fighters) {
            try {
                // Parse birth date if available
                let birthDate: Date | undefined;
                if (fighter.birthDate) {
                    try {
                        birthDate = new Date(fighter.birthDate);
                        if (isNaN(birthDate.getTime())) {
                            birthDate = undefined;
                        }
                    } catch {
                        birthDate = undefined;
                    }
                }

                // Prepare data for database
                const fighterData = {
                    name: fighter.name,
                    nickname: fighter.nickname || null,
                    weightClass: fighter.weightClass,
                    nationality: fighter.nationality || null,
                    age: fighter.age || null,
                    height: fighter.height || null,
                    weight: fighter.weight || null,
                    reach: fighter.reach || null,
                    wins: fighter.wins,
                    losses: fighter.losses,
                    draws: fighter.draws,
                    isActive: fighter.isActive,
                    stance: fighter.stance || null,
                    birthDate: birthDate || null,

                    // Enhanced fields
                    photoUrl: fighter.photoUrl || null,
                    biography: fighter.biography || null,
                    birthPlace: fighter.birthPlace || null,
                };

                // Create fighter in database
                await prisma.fighter.create({
                    data: fighterData
                });

                successCount++;

                // Track enhancement stats
                if (fighter.photoUrl) withPhotosCount++;
                if (fighter.biography) withBiographyCount++;

                // Progress indicator
                const hasEnhancements = fighter.dataQuality.wikipedia;
                const enhancementIcon = hasEnhancements ? '✨' : '📊';
                const photoIcon = fighter.photoUrl ? '📸' : '⭕';
                const bioIcon = fighter.biography ? '📝' : '⭕';

                console.log(`${enhancementIcon} ${successCount}. ${fighter.name} ${photoIcon}${bioIcon} (${fighter.weightClass})`);

            } catch (error) {
                errorCount++;
                console.error(`❌ Error seeding ${fighter.name}:`, error);
            }
        }

        // Final statistics
        console.log('\n🎉 Enhanced database seeding completed!');
        console.log(`✅ Successfully seeded: ${successCount} fighters`);
        console.log(`❌ Errors: ${errorCount} fighters`);
        console.log(`📸 With photos: ${withPhotosCount} fighters (${(withPhotosCount / successCount * 100).toFixed(1)}%)`);
        console.log(`📝 With biography: ${withBiographyCount} fighters (${(withBiographyCount / successCount * 100).toFixed(1)}%)`);

        // Database statistics
        const totalFighters = await prisma.fighter.count();
        const fightersWithPhotos = await prisma.fighter.count({
            where: { photoUrl: { not: null } }
        });
        const fightersWithBio = await prisma.fighter.count({
            where: { biography: { not: null } }
        });

        // Weight class distribution
        const weightClassStats = await prisma.fighter.groupBy({
            by: ['weightClass'],
            _count: {
                weightClass: true
            },
            orderBy: {
                _count: {
                    weightClass: 'desc'
                }
            }
        });

        console.log(`\n📊 Final Database Statistics:`);
        console.log(`👥 Total fighters: ${totalFighters}`);
        console.log(`📸 Fighters with photos: ${fightersWithPhotos}`);
        console.log(`📝 Fighters with biography: ${fightersWithBio}`);
        console.log(`🏷️  Weight class distribution:`);

        weightClassStats.forEach(stat => {
            const percentage = (stat._count.weightClass / totalFighters * 100).toFixed(1);
            console.log(`   ${stat.weightClass}: ${stat._count.weightClass} fighters (${percentage}%)`);
        });

        // Enhancement quality report
        const enhancementQuality = {
            dataOnly: successCount - withPhotosCount - withBiographyCount,
            withPhotosOnly: withPhotosCount - withBiographyCount,
            withBioOnly: withBiographyCount - withPhotosCount,
            fullyEnhanced: Math.min(withPhotosCount, withBiographyCount)
        };

        console.log(`\n📈 Enhancement Quality Report:`);
        console.log(`📊 Basic data only: ${enhancementQuality.dataOnly} fighters`);
        console.log(`📸 With photos: ${withPhotosCount} fighters`);
        console.log(`📝 With biography: ${withBiographyCount} fighters`);
        console.log(`✨ Fully enhanced: ${enhancementQuality.fullyEnhanced} fighters`);

        console.log(`\n🚀 Ready to use! Try:`);
        console.log(`   npm run dev`);
        console.log(`   Then visit: http://localhost:3000/api/fighters`);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Helper function to show seeding progress
function showProgress(current: number, total: number) {
    const percentage = ((current / total) * 100).toFixed(1);
    const bar = '█'.repeat(Math.floor(current / total * 20));
    const empty = '░'.repeat(20 - Math.floor(current / total * 20));
    process.stdout.write(`\r🌱 Progress: [${bar}${empty}] ${percentage}% (${current}/${total})`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });