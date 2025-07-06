import UFCScraper from '../src/services/ufcScraper';

async function main() {
    const scraper = new UFCScraper();

    try {
        // Scrape 30 fighters for testing (you can increase this later)
        await scraper.scrapeAndSave(30);

        console.log('✅ UFC scraping completed!');
        console.log('📁 Check data/fighters.json for the results');
        console.log('🎯 Next step: Run "npm run seed" to populate database');

    } catch (error) {
        console.error('❌ Scraping failed:', error);
        process.exit(1);
    }
}

main();