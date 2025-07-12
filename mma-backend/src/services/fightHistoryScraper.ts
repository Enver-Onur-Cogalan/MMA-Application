import axios from "axios";
import * as cheerio from 'cheerio';

interface FightRecord {
    opponent: string;
    result: 'WIN' | 'LOSS' | 'DRAW' | 'NC';
    method: string;
    round?: number;
    time?: string;
    date: string;
    event: string;
    eventUrl?: string;
    isTitle?: boolean;
}

class FightHistoryScraper {

    /**
     * Get your fighter's entire fight history from UFC Stats
     */

    async scrapeFightHistory(ufcStatsUrl: string): Promise<FightRecord[]> {
        try {
            console.log(`🥊 Scraping fight history from: ${ufcStatsUrl}`);

            const response = await axios.get(ufcStatsUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                },
                timeout: 10000
            });

            const $ = cheerio.load(response.data);
            const fights: FightRecord[] = [];

            // Find the Fight history table
            $('.b-fight-details__table-row').each((index, element) => {
                try {
                    const $row = $(element);

                    // Skip header row
                    if ($row.find('th').length > 0) return;

                    const cells = $row.find('.b-fight-details__table-col');
                    if (cells.length < 7) return;

                    // Parse cells
                    const resultCell = $(cells[0]);
                    const opponentCell = $(cells[1]);
                    const eventCell = $(cells[6]);

                    // Result
                    const resultText = resultCell.text().trim().toLowerCase();
                    let result: 'WIN' | 'LOSS' | 'DRAW' | 'NC' = 'NC';

                    if (resultText.includes('win')) result = 'WIN';
                    else if (resultText.includes('loss')) result = 'LOSS';
                    else if (resultText.includes('draw')) result = 'DRAW';

                    // Opponent
                    const opponentLink = opponentCell.find('a');
                    const opponent = opponentLink.text().trim();
                    if (!opponent) return;

                    // Event
                    const eventLink = eventCell.find('a');
                    const event = eventLink.text().trim();
                    const eventUrl = eventLink.attr('href');

                    // Date (at the bottom of the event cell)
                    const dateText = eventCell.find('.b-fight-details__table-text').text().trim();

                    // Method, Round, Time (from other cells)
                    const method = $(cells[7]).text().trim();
                    const roundText = $(cells[8]).text().trim();
                    const timeText = $(cells[9]).text().trim();

                    // Title fight control
                    const isTitle = method.toLowerCase().includes('title') ||
                        event.toLowerCase().includes('title') ||
                        resultCell.find('.b-flag_style_green').length > 0;

                    const fight: FightRecord = {
                        opponent,
                        result,
                        method: method || 'Unknown',
                        round: parseInt(roundText) || undefined,
                        time: timeText || undefined,
                        date: this.parseDate(dateText),
                        event: event || 'Unknown Event',
                        eventUrl: eventUrl ? this.cleanUrl(eventUrl) : undefined,
                        isTitle
                    };

                    fights.push(fight);
                } catch (error) {
                    console.error('Error parsing fight row:', error);
                }
            });

            console.log(`  ✅ Found ${fights.length} fights`);
            return fights;
        } catch (error) {
            console.error('Error scraping fight history:', error);
            return [];
        }
    }

    /**
     * Batch processing for multiple fighters
     */
    async scrapeBatchFightHistory(fighters: Array<{ name: string, ufcStatsUrl: string }>): Promise<Record<string, FightRecord[]>> {
        console.log(`🥊 Starting batch fight history scraping for ${fighters.length} fighters...`);

        const results: Record<string, FightRecord[]> = {};

        for (let i = 0; i < fighters.length; i++) {
            const fighter = fighters[i];

            try {
                console.log(`\n${i + 1}/${fighters.length}: ${fighter.name}`);
                const fightHistory = await this.scrapeFightHistory(fighter.ufcStatsUrl);
                results[fighter.name] = fightHistory;

                // Rate limiting
                await this.delay(2000);

            } catch (error) {
                console.error(`❌ Failed to scrape ${fighter.name}:`, error);
                results[fighter.name] = [];
            }
        }

        console.log(`\n✅ Batch fight history scraping completed!`);
        return results;
    }

    /**
     * Analyze Fight History
     */
    analyzeFightHistory(fights: FightRecord[]): {
        totalFights: number;
        wins: number;
        losses: number;
        draws: number;
        winRate: number;
        finishRate: number;
        titleFights: number;
        commonOpponents: string[];
        methodBreakdown: Record<string, number>;
        recentForm: string; // Results of the last 5 matches
    } {
        const total = fights.length;
        if (total === 0) {
            return {
                totalFights: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                winRate: 0,
                finishRate: 0,
                titleFights: 0,
                commonOpponents: [],
                methodBreakdown: {},
                recentForm: ''
            };
        }

        const wins = fights.filter(f => f.result === 'WIN').length;
        const losses = fights.filter(f => f.result === 'LOSS').length;
        const draws = fights.filter(f => f.result === 'DRAW').length;
        const titleFights = fights.filter(f => f.isTitle).length;

        // Finish rate (KO/TKO/SUB)
        const finishes = fights.filter(f => {
            const method = f.method.toLowerCase();
            return method.includes('ko') || method.includes('tko') ||
                method.includes('submission') || method.includes('sub');
        }).length;

        // Method breakdown
        const methodBreakdown: Record<string, number> = {};
        fights.forEach(fight => {
            const method = this.normalizeMethod(fight.method);
            methodBreakdown[method] = (methodBreakdown[method] || 0) + 1;
        });

        // Recent form (last 5 matches)
        const recentFigths = fights.slice(0, 5); // Assumes fights are sorted by date (newest first)
        const recentForm = recentFigths.map(f => f.result.charAt(0)).join('');

        return {
            totalFights: total,
            wins,
            losses,
            draws,
            winRate: Math.round((wins / total) * 100),
            finishRate: Math.round((finishes / total) * 100),
            titleFights,
            commonOpponents: [],
            methodBreakdown,
            recentForm
        };
    }

    private normalizeMethod(method: string): string {
        const lowerMethod = method.toLowerCase();

        if (lowerMethod.includes('ko') || lowerMethod.includes('knockout')) return 'KO/TKO';
        if (lowerMethod.includes('tko')) return 'KO/TKO';
        if (lowerMethod.includes('submission') || lowerMethod.includes('sub')) return 'Submission';
        if (lowerMethod.includes('decision') || lowerMethod.includes('dec')) return 'Decision';
        if (lowerMethod.includes('unanimous')) return 'Unanimous Decision';
        if (lowerMethod.includes('majority')) return 'Majority Decision';
        if (lowerMethod.includes('split')) return 'Split Decision';
        if (lowerMethod.includes('dq') || lowerMethod.includes('disqualification')) return 'DQ';
        if (lowerMethod.includes('no contest') || lowerMethod.includes('nc')) return 'No Contest';

        return method || 'Unknown';
    }

    private parseDate(dataText: string): string {
        // Date formatting
        if (!dataText) return '';

        try {
            // parse the "Dec. 12, 2020" format
            const cleanDate = dataText.replace(/[^\w\s,]/g, '').trim();
            const date = new Date(cleanDate);

            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0]; // YYYY-MM-DD format
            }
        } catch (error) {
            // Parsing failed, return as is
        }
        return dataText;
    }

    private cleanUrl(url: string): string {
        return url.startsWith('http') ? url : 'http://www.ufcstats.com' + url;
    }

    private async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default FightHistoryScraper;