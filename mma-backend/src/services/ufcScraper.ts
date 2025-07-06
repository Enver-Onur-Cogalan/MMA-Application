import axios from "axios";
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';

interface UFCFighter {
    name: string;
    nickname?: string;
    weightClass: string;
    nationality?: string;
    height?: number; // in cm
    weight?: number; // in kg
    reach?: number; // in cm
    wins: number;
    losses: number;
    draws: number;
    isActive: boolean;
    ufcStatsUrl?: string;
    birthDate?: string;
    stance?: string;
}

class UFCScraper {
    private baseUrl = 'http://www.ufcstats.com';
    private fightersUrl = 'http://www.ufcstats.com/statistics/fighters';

    constructor() {
        // Add delay between requests to be respectful
        this.delay = this.delay.bind(this);
    }

    private async delay(ms: number = 1000): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private cleanUrl(url: string): string {
        // Fix double-domain issue
        if (url.startsWith('http')) {
            return url;
        }
        return this.baseUrl + url;
    }

    private convertHeightToCm(heightStr: string): number | undefined {
        // Convert "5' 9"
        const match = heightStr.match(/(\d+)'\s*(\d+)"/);
        if (match) {
            const feet = parseInt(match[1]);
            const inches = parseInt(match[2]);
            return Math.round((feet * 12 + inches) * 2.54);
        }
        return undefined;
    }

    private convertWeightToKg(weightStr: string): number | undefined {
        // Convert "155 lbs" to kg
        const match = weightStr.match(/(\d+)\s*lbs/);
        if (match) {
            const pounds = parseInt(match[1]);
            return Math.round(pounds * 0.453592);
        }
        return undefined;
    }

    private convertReachToCm(reachStr: string): number | undefined {
        // Convert "72\"" to cm
        const match = reachStr.match(/(\d+)"/);
        if (match) {
            const inches = parseInt(match[1]);
            return Math.round(inches * 2.54);
        }
        return undefined;
    }

    private determineWeightClass(weightKg: number | undefined): string {
        if (!weightKg) return 'WELTERWEIGHT';   //default

        if (weightKg <= 57) return 'FLYWEIGHT';
        if (weightKg <= 61) return 'BANTAMWEIGHT';
        if (weightKg <= 66) return 'FEATHERWEIGHT';
        if (weightKg <= 70) return 'LIGHTWEIGHT';
        if (weightKg <= 77) return 'WELTERWEIGHT';
        if (weightKg <= 84) return 'MIDDLEWEIGHT';
        if (weightKg <= 93) return 'LIGHT_HEAVYWEIGHT';
        return 'HEAVYWEIGHT';
    }

    public async scrapeFightersList(): Promise<UFCFighter[]> {
        console.log('🕷️  Starting UFC Stats scraping...');

        try {
            const response = await axios.get(this.fightersUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                }
            });

            const $ = cheerio.load(response.data);
            const fighters: UFCFighter[] = [];

            // Find the fighters table
            $('tr.b-statistics__table-row').each((index, element) => {
                try {
                    const $row = $(element);

                    // Skip header row
                    if ($row.find('th').length > 0) return;

                    const cells = $row.find('td');
                    if (cells.length < 10) return;

                    // Extract data from each cell - FIXED INDEXES
                    const nameCell = $(cells[0]);
                    const name = nameCell.find('a').text().trim();
                    const fighterUrl = nameCell.find('a').attr('href');

                    if (!name) return;

                    // Log all cells to see the structure
                    console.log(`🔍 All cells for ${name}:`);
                    for (let i = 0; i < Math.min(cells.length, 12); i++) {
                        console.log(`   Cell ${i}: "${$(cells[i]).text().trim()}"`);
                    }

                    // Let's try different indexes based on what we see
                    const lastNameStr = $(cells[1]).text().trim();
                    const nicknameStr = $(cells[2]).text().trim();
                    const heightStr = $(cells[3]).text().trim();
                    const weightStr = $(cells[4]).text().trim();
                    const reachStr = $(cells[5]).text().trim();
                    const stance = $(cells[6]).text().trim();
                    const wins = $(cells[7]).text().trim();
                    const losses = $(cells[8]).text().trim();
                    const draws = $(cells[9]).text().trim();

                    // Build full name
                    const fullName = `${name} ${lastNameStr}`.trim();

                    // DEBUG: Log what we're actually getting
                    console.log(`🔍 DEBUG ${fullName}:`);
                    console.log(`   Height: "${heightStr}"`);
                    console.log(`   Weight: "${weightStr}"`);
                    console.log(`   Reach: "${reachStr}"`);
                    console.log(`   Stance: "${stance}"`);
                    console.log(`   W-L-D: "${wins}-${losses}-${draws}"`);
                    console.log(`   Total cells: ${cells.length}`);

                    // Parse the data
                    const height = this.convertHeightToCm(heightStr);
                    const weight = this.convertWeightToKg(weightStr);
                    const reach = this.convertReachToCm(reachStr);
                    const winsNum = parseInt(wins) || 0;
                    const lossesNum = parseInt(losses) || 0;
                    const drawsNum = parseInt(draws) || 0;
                    const weightClass = this.determineWeightClass(weight);

                    const fighter: UFCFighter = {
                        name: fullName,
                        nickname: nicknameStr || undefined,
                        weightClass: weightClass,
                        height: height,
                        weight: weight,
                        reach: reach,
                        wins: winsNum,
                        losses: lossesNum,
                        draws: drawsNum,
                        isActive: true, // We'll assume active for now
                        stance: stance || undefined,
                        ufcStatsUrl: fighterUrl ? this.cleanUrl(fighterUrl) : undefined
                    };

                    fighters.push(fighter);
                    console.log(`✅ Scraped: ${fighter.name} (${fighter.weightClass}) - ${fighter.wins}-${fighter.losses}-${fighter.draws}`);

                } catch (error) {
                    console.error(`❌ Error parsing fighter row:`, error);
                }
            });

            console.log(`🎉 Successfully scraped ${fighters.length} fighters!`);
            return fighters;

        } catch (error) {
            console.error('❌ Error scraping UFC Stats:', error);
            throw error;
        }
    }

    public async scrapeFighterDetails(fighter: UFCFighter): Promise<UFCFighter> {
        if (!fighter.ufcStatsUrl) return fighter;

        try {
            console.log(`🔍 Fetching details for: ${fighter.name}`);

            await this.delay(500); // Be respectful to the server

            const response = await axios.get(fighter.ufcStatsUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                }
            });

            const $ = cheerio.load(response.data);

            // Extract additional details
            const nickname = $('.b-content__title-highlight').text().trim().replace(/"/g, '');
            const birthDateStr = $('.b-list__box-list-item').filter((i, el) => {
                return $(el).text().includes('DOB:');
            }).text().replace('DOB:', '').trim();

            // Update fighter with additional details
            return {
                ...fighter,
                nickname: nickname || undefined,
                birthDate: birthDateStr || undefined
            };

        } catch (error) {
            console.error(`❌ Error fetching details for ${fighter.name}:`, error);
            return fighter;
        }
    }

    public async scrapeAndSave(limit: number = 50): Promise<void> {
        try {
            console.log(`🚀 Starting UFC scraper (limit: ${limit})`);

            // Get basic fighter list
            const fighters = await this.scrapeFightersList();

            // Limit the number for testing
            const limitedFighters = fighters.slice(0, limit);

            // Get detailed info for each fighter (with delay)
            const detailedFighters: UFCFighter[] = [];

            for (let i = 0; i < limitedFighters.length; i++) {
                const fighter = limitedFighters[i];
                const detailed = await this.scrapeFighterDetails(fighter);
                detailedFighters.push(detailed);

                console.log(`📊 Progress: ${i + 1}/${limitedFighters.length}`);
            }

            // Save to JSON file
            const filePath = path.join(process.cwd(), 'data', 'fighters.json');

            // Create data directory if it doesn't exist
            await fs.mkdir(path.dirname(filePath), { recursive: true });

            await fs.writeFile(filePath, JSON.stringify(detailedFighters, null, 2));

            console.log(`💾 Saved ${detailedFighters.length} fighters to ${filePath}`);
            console.log('🎉 Scraping completed successfully!');

        } catch (error) {
            console.error('❌ Scraping failed:', error);
            throw error;
        }
    }
}

export default UFCScraper;