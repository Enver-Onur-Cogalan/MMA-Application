import AutoEnhancedScraper from '../src/services/autoEnhancedScraper';

async function main() {
    const scraper = new AutoEnhancedScraper();

    try {
        const args = process.argv.slice(2);
        const mode = args[0] || 'medium';

        console.log('🚀 MASS ENHANCEMENT - UFC Fighter Database Builder');
        console.log('================================================\n');


        let limit: number;
        let description: string;

        switch (mode) {
            case 'small':
                limit = 50;
                description = 'Small batch - Quick test';
                break;
            case 'medium':
                limit = 200;
                description = 'Medium batch - Good balance';
                break;
            case 'large':
                limit = 500;
                description = 'Large batch - Comprehensive data';
                break;
            case 'full':
                limit = 0 // No limit
                description = 'FULL DATABASE - All UFC fighters (may take hours!)';
                break;
            default:
                console.log('❌ Unknown mode. Available modes:');
                console.log('  - small: 50 fighters (~2 minutes)');
                console.log('  - medium: 200 fighters (~8 minutes)');
                console.log('  - large: 500 fighters (~20 minutes)');
                console.log('  - full: ALL fighters (hours!)');
                process.exit(1);
        }

        console.log(`📊 Mode: ${mode}`);
        console.log(`📝 Description: ${description}`);
        console.log(`👥 Target: ${limit === 0 ? 'ALL fighters' : `${limit} fighters`}`);

        if (limit > 100) {
            console.log('⏱️  Estimated time: ' + Math.ceil(limit * 1.5 / 60) + ' minutes');
            console.log('💡 Tip: You can stop anytime with Ctrl+C and still get partial data\n');

            // Request confirmation
            await new Promise(resolve => {
                process.stdout.write('Continue? (y/N):  ');
                process.stdin.once('data', (data) => {
                    const answer = data.toString().trim().toLowerCase();
                    if (answer === 'y' || answer === 'yes') {
                        resolve(true);
                    } else {
                        console.log('Cancelled by user');
                        process.exit(0);
                    }
                });
            });
        }

        console.log('🎬 Starting mass enhancement...\n');

        // Main process
        if (limit === 0) {
            await scraper.scrapeAndEnhanceAll(); // No limit
        } else {
            await scraper.scrapeAndEnhanceAll(limit);
        }

        console.log('\n✨ Mass enhancement completed!');
        console.log('📁 Data saved to: data/enhanced-fighters.json');
        console.log('🎯 Next steps:');
        console.log('   1. npm run seed-enhanced (populate database)');
        console.log('   2. npm run dev (start API server)');
        console.log('   3. Visit: http://localhost:3000/api/fighters');

    } catch (error) {
        console.error('\n❌ Mass enhancement failed:', error);
        console.log('\n💡 Don\'t worry! Any partial data is still saved.');
        console.log('📁 Check data/enhanced-fighters.json for partial results');
        process.exit(1);
    }
}

// Graceful shutdown handling
process.on('SIGINT', () => {
    console.log('\n⏹️  Mass enhancement stopped by user');
    console.log('💾 Partial data should still be saved');
    console.log('🔄 You can resume anytime with npm run mass-enhance');
    process.exit(0);
});

main();