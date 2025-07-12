// scripts/checkDataQuality.ts
import fs from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface DataQualityReport {
    totalFighters: number;
    dataCompleteness: {
        withPhotos: number;
        withBiography: number;
        withBirthDate: number;
        withHeight: number;
        withWeight: number;
        withReach: number;
        withNationality: number;
    };
    dataQualityScore: number;
    missingDataFighters: Array<{
        name: string;
        missing: string[];
    }>;
    duplicates: Array<{
        name: string;
        count: number;
    }>;
    recommendations: string[];
}

async function checkDataQuality(): Promise<void> {
    console.log('🔍 UFC Fighter Data Quality Check');
    console.log('==================================\n');

    try {
        // Database'den tüm fighter'ları çek
        const fighters = await prisma.fighter.findMany();

        if (fighters.length === 0) {
            console.log('❌ No fighters found in database!');
            console.log('💡 Run: npm run quick-setup');
            return;
        }

        const report = analyzeDataQuality(fighters);
        displayQualityReport(report);

        // JSON dosyasına da kaydet
        await saveQualityReport(report);

    } catch (error) {
        console.error('❌ Data quality check failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

function analyzeDataQuality(fighters: any[]): DataQualityReport {
    const total = fighters.length;

    // Data completeness analysis
    const completeness = {
        withPhotos: fighters.filter(f => f.photoUrl).length,
        withBiography: fighters.filter(f => f.biography).length,
        withBirthDate: fighters.filter(f => f.birthDate).length,
        withHeight: fighters.filter(f => f.height).length,
        withWeight: fighters.filter(f => f.weight).length,
        withReach: fighters.filter(f => f.reach).length,
        withNationality: fighters.filter(f => f.nationality).length,
    };

    // Calculate quality score (0-100)
    const maxPossiblePoints = total * 7; // 7 key fields
    const actualPoints = Object.values(completeness).reduce((sum, count) => sum + count, 0);
    const qualityScore = Math.round((actualPoints / maxPossiblePoints) * 100);

    // Find fighters with missing critical data
    const missingDataFighters = fighters
        .map(fighter => {
            const missing: string[] = [];
            if (!fighter.photoUrl) missing.push('photo');
            if (!fighter.biography) missing.push('biography');
            if (!fighter.height) missing.push('height');
            if (!fighter.weight) missing.push('weight');
            if (!fighter.nationality) missing.push('nationality');

            return missing.length > 0 ? {
                name: fighter.name,
                missing
            } : null;
        })
        .filter(Boolean) as Array<{ name: string, missing: string[] }>;

    // Check for duplicates
    const nameCount: Record<string, number> = {};
    fighters.forEach(fighter => {
        nameCount[fighter.name] = (nameCount[fighter.name] || 0) + 1;
    });

    const duplicates = Object.entries(nameCount)
        .filter(([name, count]) => count > 1)
        .map(([name, count]) => ({ name, count }));

    // Generate recommendations
    const recommendations = generateRecommendations(completeness, total, duplicates.length);

    return {
        totalFighters: total,
        dataCompleteness: completeness,
        dataQualityScore: qualityScore,
        missingDataFighters: missingDataFighters.slice(0, 10), // Top 10 only
        duplicates,
        recommendations
    };
}

function generateRecommendations(
    completeness: any,
    total: number,
    duplicateCount: number
): string[] {
    const recommendations: string[] = [];

    // Photo recommendations
    const photoPercentage = (completeness.withPhotos / total) * 100;
    if (photoPercentage < 50) {
        recommendations.push(`📸 Photo coverage is low (${photoPercentage.toFixed(1)}%). Consider running enhanced scraping.`);
    }

    // Biography recommendations  
    const bioPercentage = (completeness.withBiography / total) * 100;
    if (bioPercentage < 30) {
        recommendations.push(`📝 Biography coverage is low (${bioPercentage.toFixed(1)}%). Wikipedia integration needs improvement.`);
    }

    // Physical stats recommendations
    const physicalStatsPercentage = ((completeness.withHeight + completeness.withWeight + completeness.withReach) / (total * 3)) * 100;
    if (physicalStatsPercentage < 70) {
        recommendations.push(`📏 Physical stats coverage is low (${physicalStatsPercentage.toFixed(1)}%). UFC Stats scraping may need fixing.`);
    }

    // Duplicate recommendations
    if (duplicateCount > 0) {
        recommendations.push(`🔄 Found ${duplicateCount} duplicate fighter(s). Consider running deduplication.`);
    }

    // Overall recommendations
    if (completeness.withPhotos + completeness.withBiography < total * 0.5) {
        recommendations.push(`🚀 Run 'npm run mass-enhance-large' to improve data quality significantly.`);
    }

    if (recommendations.length === 0) {
        recommendations.push(`✨ Data quality looks good! Consider running full enhancement for even better coverage.`);
    }

    return recommendations;
}

function displayQualityReport(report: DataQualityReport): void {
    console.log(`👥 TOTAL FIGHTERS: ${report.totalFighters}`);
    console.log(`📊 OVERALL QUALITY SCORE: ${report.dataQualityScore}/100`);

    // Quality score color coding
    let scoreIcon = '🔴';
    if (report.dataQualityScore >= 80) scoreIcon = '🟢';
    else if (report.dataQualityScore >= 60) scoreIcon = '🟡';
    else if (report.dataQualityScore >= 40) scoreIcon = '🟠';

    console.log(`${scoreIcon} Quality Level: ${getQualityLevel(report.dataQualityScore)}\n`);

    // Data completeness breakdown
    console.log('📋 DATA COMPLETENESS:');
    console.log('====================');

    const completenessEntries = [
        ['Photos', report.dataCompleteness.withPhotos],
        ['Biography', report.dataCompleteness.withBiography],
        ['Birth Date', report.dataCompleteness.withBirthDate],
        ['Height', report.dataCompleteness.withHeight],
        ['Weight', report.dataCompleteness.withWeight],
        ['Reach', report.dataCompleteness.withReach],
        ['Nationality', report.dataCompleteness.withNationality],
    ];

    completenessEntries.forEach(([field, count]) => {
        const percentage = ((count as number) / report.totalFighters * 100).toFixed(1);
        const bar = generateProgressBar(count as number, report.totalFighters);
        const fieldStr = String(field).padEnd(12);
        console.log(`${fieldStr} ${bar} ${count}/${report.totalFighters} (${percentage}%)`);
    });

    // Missing data summary
    if (report.missingDataFighters.length > 0) {
        console.log(`\n⚠️  FIGHTERS WITH MISSING DATA (Top 10):`);
        console.log('=======================================');
        report.missingDataFighters.forEach((fighter, index) => {
            console.log(`${(index + 1).toString().padStart(2)}. ${fighter.name.padEnd(25)} Missing: ${fighter.missing.join(', ')}`);
        });
    }

    // Duplicates
    if (report.duplicates.length > 0) {
        console.log(`\n🔄 DUPLICATE FIGHTERS:`);
        console.log('=====================');
        report.duplicates.forEach(duplicate => {
            console.log(`${duplicate.name} (appears ${duplicate.count} times)`);
        });
    }

    // Recommendations
    console.log(`\n💡 RECOMMENDATIONS:`);
    console.log('==================');
    report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
    });

    console.log(`\n📈 NEXT STEPS:`);
    if (report.dataQualityScore < 60) {
        console.log('   npm run mass-enhance-large  # Improve data significantly');
        console.log('   npm run seed-enhanced       # Update database');
    } else if (report.dataQualityScore < 80) {
        console.log('   npm run mass-enhance-full   # Get remaining data');
        console.log('   npm run seed-enhanced       # Update database');
    } else {
        console.log('   npm run dev                 # Start the API server!');
        console.log('   Data quality is excellent! 🎉');
    }
}

function getQualityLevel(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Poor';
    return 'Very Poor';
}

function generateProgressBar(current: number, total: number, length: number = 20): string {
    const percentage = current / total;
    const filled = Math.round(percentage * length);
    const empty = length - filled;

    return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
}

async function saveQualityReport(report: DataQualityReport): Promise<void> {
    try {
        const timestamp = new Date().toISOString().split('T')[0];
        const filePath = path.join(process.cwd(), 'data', `quality-report-${timestamp}.json`);

        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, JSON.stringify(report, null, 2));

        console.log(`\n💾 Quality report saved to: ${filePath}`);
    } catch (error) {
        console.error('Failed to save quality report:', error);
    }
}

checkDataQuality();