import axios from "axios";
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';

interface EnhancedFighterData {
    // UFC Stats News
    name: string;
    nickname?: string;
    weightClass: string;
    height?: number;
    weight?: number;
    reach?: number;
    wins: number;
    losses: number;
    draws: number;
    stance?: string;
    ufcStatsUrl?: string;

    // Automatically pulled from Wikipedia
    photoUrl?: string;
    biography?: string;
    birthPlace?: string;
    birthDate?: string;

    // Meta information
    dataQuality: {
        ufcStats: boolean;
        wikipedia: boolean;
        lastUpdated: Date;
    };
}

class AutoEnhancedScraper {
    private baseUrl = 'http://www.ufcstats.com';
    private fightersUrl = 'http://www.ufcstats.com/statistics/fighters';

    constructor() {
        this.delay = this.delay.bind(this);
    }

    /**
     * Main scraping function - automatically for each fighter
     * pulls data from both UFC Stats and Wikipedia
     */
    public async scrapeAndEnhanceAll(limit: number = 50): Promise<void> {
        try {
            console.log(`🚀 Starting auto-enhanced scraping (limit: ${limit})`);

            // 1. Pull the basic fighter list from UFC Stats
            const basicFighters = await this.scrapeBasicFightersList();
            const limitedFighters = basicFighters.slice(0, limit);

            console.log(`📊 Found ${limitedFighters.length} fighters, starting enhancement...`);

            const enhancedFighters: EnhancedFighterData[] = [];

            // 2. Automatic enhancement for each fighter
            for (let i = 0; i < limitedFighters.length; i++) {
                const basicFighter = limitedFighters[i];

                console.log(`\n🔄 Processing ${i + 1}/${limitedFighters.length}: ${basicFighter.name}`);

                // Automatically enhance
                const enhancedFighter = await this.autoEnhanceFighter(basicFighter);
                enhancedFighters.push(enhancedFighter);

                // Show progress
                this.showProgress(i + 1, limitedFighters.length, enhancedFighter);

                // Rate limiting
                await this.delay(1500);
            }

            // 3. Save results
            await this.saveEnhancedData(enhancedFighters);
            this.printSummary(enhancedFighters);

        } catch (error) {
            console.error('❌ Auto-enhanced scraping failed:', error);
            throw error;
        }
    }

    /**
     * Automatically enhances a single fighter
     */
    private async autoEnhanceFighter(basicFighter: any): Promise<EnhancedFighterData> {
        const enhanced: EnhancedFighterData = {
            ...basicFighter,
            dataQuality: {
                ufcStats: true, // Basic data exists
                wikipedia: false,
                lastUpdated: new Date()
            }
        };

        try {
            // Automatic Wikipedia enhancement
            const wikipediaData = await this.enhanceWithWikipedia(basicFighter.name, basicFighter.ufcStatsUrl);

            if (wikipediaData) {
                // Add Wikipedia data
                enhanced.photoUrl = wikipediaData.photoUrl;
                enhanced.biography = wikipediaData.biography;
                enhanced.birthPlace = wikipediaData.birthPlace;
                enhanced.birthDate = wikipediaData.birthDate;
                enhanced.dataQuality.wikipedia = true;

                console.log(`  ✅ Wikipedia data found`);
            } else {
                console.log(`  ⚠️  No Wikipedia data found`);
            }

        } catch (error) {
            console.log(`  ❌ Wikipedia enhancement failed: ${error}`);
        }

        return enhanced;
    }

    /**
     * Automatic data extraction from Wikipedia
     */
    private async enhanceWithWikipedia(fighterName: string, ufcStatsUrl?: string): Promise<any> {
        try {
            // Wikipedia API - automatic search
            const searchResponse = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(fighterName)}`, {
                headers: {
                    'User-Agent': 'MMA-App/1.0 (educational-use)'
                }
            });

            const data = searchResponse.data;

            // Check if you are interested in MMA
            if (!this.isMMARelated(data.extract || '')) {
                return null;
            }

            // Try multiple sources for the photo
            let photoUrl = data.thumbnail?.source;

            // If there is no photo on Wikipedia, check out UFC Stats
            if (!photoUrl && ufcStatsUrl) {
                try {
                    photoUrl = await this.getPhotoFromUFCStats(ufcStatsUrl);
                } catch (error) {
                    // If UFC Stats can't pull it off, move on
                }
            }

            return {
                photoUrl: photoUrl,
                biography: data.extract,
                birthPlace: this.extractBirthPlace(data.extract || ''),
                birthDate: this.extractBirthDate(data.extract || '')
            };

        } catch (error) {
            // If Wikipedia fails, just try UFC Stats Tan photo
            if (ufcStatsUrl) {
                try {
                    const photoUrl = await this.getPhotoFromUFCStats(ufcStatsUrl);
                    if (photoUrl) {
                        return { photoUrl };
                    }
                } catch (error) {
                    // Everything fails
                }
            }
            return null;
        }
    }

    /**
     * UFC Stats basic fighter list
     */
    private async scrapeBasicFightersList(): Promise<any[]> {
        const response = await axios.get(this.fightersUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const fighters: any[] = [];

        $('tr.b-statistics__table-row').each((index, element) => {
            try {
                const $row = $(element);
                if ($row.find('th').length > 0) return;

                const cells = $row.find('td');
                if (cells.length < 10) return;

                const nameCell = $(cells[0]);
                const name = nameCell.find('a').text().trim();
                const fighterUrl = nameCell.find('a').attr('href');

                if (!name) return;

                const lastNameStr = $(cells[1]).text().trim();
                const nicknameStr = $(cells[2]).text().trim();
                const heightStr = $(cells[3]).text().trim();
                const weightStr = $(cells[4]).text().trim();
                const reachStr = $(cells[5]).text().trim();
                const stance = $(cells[6]).text().trim();
                const wins = $(cells[7]).text().trim();
                const losses = $(cells[8]).text().trim();
                const draws = $(cells[9]).text().trim();

                const fullName = `${name} ${lastNameStr}`.trim();
                const height = this.convertHeightToCm(heightStr);
                const weight = this.convertWeightToKg(weightStr);
                const reach = this.convertReachToCm(reachStr);
                const winsNum = parseInt(wins) || 0;
                const lossesNum = parseInt(losses) || 0;
                const drawsNum = parseInt(draws) || 0;
                const weightClass = this.determineWeightClass(weight);

                fighters.push({
                    name: fullName,
                    nickname: nicknameStr || undefined,
                    weightClass: weightClass,
                    height: height,
                    weight: weight,
                    reach: reach,
                    wins: winsNum,
                    losses: lossesNum,
                    draws: drawsNum,
                    isActive: true,
                    stance: stance || undefined,
                    ufcStatsUrl: fighterUrl ? this.cleanUrl(fighterUrl) : undefined
                });

            } catch (error) {
                // Pass quietly
            }
        });

        return fighters;
    }

    /**
     * Checks if it is related to MMA
     */
    private isMMARelated(text: string): boolean {
        const mmaKeywords = [
            'mixed martial arts', 'mma', 'ufc', 'fighter', 'fighting', 'combat',
            'martial arts', 'cage', 'octagon', 'bellator', 'wrestling', 'boxing',
            'jiu-jitsu', 'muay thai', 'kickboxing'
        ];

        const lowerText = text.toLowerCase();
        return mmaKeywords.some(keyword => lowerText.includes(keyword));
    }

    /**
     * Removes birthplace
     */
    private extractBirthPlace(text: string): string | undefined {
        const patterns = [
            /born in ([^,]+)/i,
            /from ([^,]+)/i,
            /native of ([^,]+)/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) return match[1].trim();
        }

        return undefined;
    }

    /**
     * Removes date of birth
     */
    private extractBirthDate(text: string): string | undefined {
        const datePattern = /born[^,]*(\w+ \d{1,2}, \d{4})/i;
        const match = text.match(datePattern);
        return match ? match[1].trim() : undefined;
    }

    /**
     * Shows progress
     */
    private showProgress(current: number, total: number, fighter: EnhancedFighterData): void {
        const percentage = ((current / total) * 100).toFixed(1);
        const ufcIcon = fighter.dataQuality.ufcStats ? '✅' : '❌';
        const wikiIcon = fighter.dataQuality.wikipedia ? '✅' : '⚠️';

        console.log(`  📊 ${percentage}% | UFC: ${ufcIcon} Wiki: ${wikiIcon} | ${fighter.name}`);
    }

    /**
     * Saves Enhanced data
     */
    private async saveEnhancedData(fighters: EnhancedFighterData[]): Promise<void> {
        const filePath = path.join(process.cwd(), 'data', 'enhanced-fighters.json');
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, JSON.stringify(fighters, null, 2));
        console.log(`\n💾 Saved ${fighters.length} enhanced fighters to ${filePath}`);
    }

    /**
     * Prints a summary report
     */
    private printSummary(fighters: EnhancedFighterData[]): void {
        const total = fighters.length;
        const withWikipedia = fighters.filter(f => f.dataQuality.wikipedia).length;
        const withPhotos = fighters.filter(f => f.photoUrl).length;
        const withBiography = fighters.filter(f => f.biography).length;

        console.log(`\n📊 Enhancement Summary:`);
        console.log(`👥 Total Fighters: ${total}`);
        console.log(`📖 With Wikipedia Data: ${withWikipedia} (${(withWikipedia / total * 100).toFixed(1)}%)`);
        console.log(`📸 With Photos: ${withPhotos} (${(withPhotos / total * 100).toFixed(1)}%)`);
        console.log(`📝 With Biography: ${withBiography} (${(withBiography / total * 100).toFixed(1)}%)`);
        console.log(`🎉 Auto-enhancement completed!`);
    }

    // Utility functions
    private convertHeightToCm(heightStr: string): number | undefined {
        const match = heightStr.match(/(\d+)'\s*(\d+)"/);
        if (match) {
            const feet = parseInt(match[1]);
            const inches = parseInt(match[2]);
            return Math.round((feet * 12 + inches) * 2.54);
        }
        return undefined;
    }

    private convertWeightToKg(weightStr: string): number | undefined {
        const match = weightStr.match(/(\d+)\s*lbs/);
        if (match) {
            const pounds = parseInt(match[1]);
            return Math.round(pounds * 0.453592);
        }
        return undefined;
    }

    private convertReachToCm(reachStr: string): number | undefined {
        const match = reachStr.match(/(\d+)"/);
        if (match) {
            const inches = parseInt(match[1]);
            return Math.round(inches * 2.54);
        }
        return undefined;
    }

    private determineWeightClass(weightKg: number | undefined): string {
        if (!weightKg) return 'WELTERWEIGHT';
        if (weightKg <= 57) return 'FLYWEIGHT';
        if (weightKg <= 61) return 'BANTAMWEIGHT';
        if (weightKg <= 66) return 'FEATHERWEIGHT';
        if (weightKg <= 70) return 'LIGHTWEIGHT';
        if (weightKg <= 77) return 'WELTERWEIGHT';
        if (weightKg <= 84) return 'MIDDLEWEIGHT';
        if (weightKg <= 93) return 'LIGHT_HEAVYWEIGHT';
        return 'HEAVYWEIGHT';
    }

    private cleanUrl(url: string): string {
        return url.startsWith('http') ? url : this.baseUrl + url;
    }

    private async delay(ms: number = 1000): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * UFC Stats fighter detail sayfasından fotoğraf çek
     */
    private async getPhotoFromUFCStats(ufcStatsUrl: string): Promise<string | undefined> {
        try {
            const response = await axios.get(ufcStatsUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                },
                timeout: 5000
            });

            const $ = cheerio.load(response.data);

            // UFC Stats'taki fighter fotoğrafını ara
            const photoSelectors = [
                '.b-fighter-details__person-img img',
                '.b-content__main-photo img',
                '.fighter-photo img',
                'img[alt*="fighter"]',
                'img[src*="fighter"]'
            ];

            for (const selector of photoSelectors) {
                const img = $(selector).first();
                if (img.length) {
                    const src = img.attr('src');
                    if (src && src.includes('http')) {
                        return src;
                    }
                }
            }

            return undefined;
        } catch (error) {
            return undefined;
        }
    }
}

export default AutoEnhancedScraper;