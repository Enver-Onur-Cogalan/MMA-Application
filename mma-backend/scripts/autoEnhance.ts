import AutoEnhancedScraper from '../src/services/autoEnhancedScraper';

async function main() {
    const scraper = new AutoEnhancedScraper();

    try {
        const args = process.argv.slice(2);
        const limit = parseInt(args[0]) || 30; // Varsayılan 30 fighter

        console.log('🤖 Starting AUTOMATIC enhancement process...');
        console.log(`📊 Processing ${limit} fighters with auto Wikipedia enhancement`);
        console.log('⏱️  This will take approximately ' + Math.ceil(limit * 1.5 / 60) + ' minutes\n');

        // Tek komut ile her şeyi otomatik yap
        await scraper.scrapeAndEnhanceAll(limit);

        console.log('\n✨ All done! Check data/enhanced-fighters.json');
        console.log('🎯 Next step: Run "npm run seed-enhanced" to populate database');

    } catch (error) {
        console.error('❌ Auto-enhancement failed:', error);
        process.exit(1);
    }
}

main();