// src/services/improvedPhotoScraper.ts
import axios from 'axios';
import * as cheerio from 'cheerio';

class ImprovedPhotoScraper {

    /**
     * Search photos from multiple sources
     */
    async findFighterPhoto(fighterName: string, ufcStatsUrl?: string): Promise<string | undefined> {
        // Try different sources in order
        const strategies = [
            () => this.getPhotoFromUFCStats(ufcStatsUrl),
            () => this.getPhotoFromWikipedia(fighterName),
            () => this.getPhotoFromWikipediaAlternative(fighterName),
            () => this.getPhotoFromGoogle(fighterName) // Use with caution!
        ];

        for (const strategy of strategies) {
            try {
                const photoUrl = await strategy();
                if (photoUrl && this.isValidImageUrl(photoUrl)) {
                    console.log(`  📸 Photo found via strategy`);
                    return photoUrl;
                }
            } catch (error) {
                // Silently try the next strategy
            }
        }

        return undefined;
    }

    /**
     * Take a photo from UFC Stats Tan fighter detail page
     */
    private async getPhotoFromUFCStats(ufcStatsUrl?: string): Promise<string | undefined> {
        if (!ufcStatsUrl) return undefined;

        const response = await axios.get(ufcStatsUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            },
            timeout: 5000
        });

        const $ = cheerio.load(response.data);

        // Search for fighter photos on UFC Stars
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
    }

    /**
     * Advanced photo search from Wikipedia
     */
    private async getPhotoFromWikipedia(fighterName: string): Promise<string | undefined> {
        try {
            // Main Wikipedia API
            const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(fighterName)}`;

            const response = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': 'MMA-App/1.0 (educational-use)'
                },
                timeout: 5000
            });

            const data = response.data;

            // MMA control
            if (!this.isMMARelated(data.extract || '')) {
                return undefined;
            }

            // Photo URLs
            if (data.thumbnail?.source) {
                return data.thumbnail.source;
            }

            if (data.originalimage?.source) {
                return data.originalimage.source;
            }

            return undefined;

        } catch (error) {
            return undefined;
        }
    }

    /**
     * Alternative Wikipedia search (fuzzy matching)
     */
    private async getPhotoFromWikipediaAlternative(fighterName: string): Promise<string | undefined> {
        try {
            // Try alternative name formats
            const nameVariations = this.generateNameVariations(fighterName);

            for (const name of nameVariations) {
                try {
                    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(name)}&prop=pageimages&pithumbsize=300`;

                    const response = await axios.get(searchUrl, {
                        headers: {
                            'User-Agent': 'MMA-App/1.0'
                        },
                        timeout: 3000
                    });

                    const pages = response.data.query?.pages;
                    if (pages) {
                        const page = Object.values(pages)[0] as any;
                        if (page.thumbnail?.source) {
                            return page.thumbnail.source;
                        }
                    }
                } catch {
                    // Continue to next variation
                }
            }

            return undefined;

        } catch (error) {
            return undefined;
        }
    }

    /**
     * Last resort: Google Images
     */
    private async getPhotoFromGoogle(fighterName: string): Promise<string | undefined> {
        // Do not use this method in production!
        // For development only, rate limiting is required
        return undefined;
    }

    /**
     * Generate name variations
     */
    private generateNameVariations(fullName: string): string[] {
        const variations = [fullName];

        const parts = fullName.split(' ');
        if (parts.length >= 2) {
            // "Jon Jones" -> ["Jon Jones", "Jonathan Jones", "Jones"]
            variations.push(parts[parts.length - 1]); // Only my last name

            // Common name changes
            const nameMap: Record<string, string[]> = {
                'Jon': ['Jonathan', 'John'],
                'Alex': ['Alexander', 'Aleksandar'],
                'Chris': ['Christopher', 'Christian'],
                'Mike': ['Michael'],
                'Dan': ['Daniel'],
                'Matt': ['Matthew'],
                'Tony': ['Anthony'],
                'Nick': ['Nicholas'],
                'Joe': ['Joseph']
            };

            const firstName = parts[0];
            if (nameMap[firstName]) {
                nameMap[firstName].forEach(alt => {
                    const altName = [alt, ...parts.slice(1)].join(' ');
                    variations.push(altName);
                });
            }
        }

        return [...new Set(variations)]; // Remove duplicates
    }

    /**
     * Check if image URL is valid
     */
    private isValidImageUrl(url: string): boolean {
        if (!url || !url.startsWith('http')) return false;

        const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        const lowerUrl = url.toLowerCase();

        return imageExtensions.some(ext => lowerUrl.includes(ext)) ||
            lowerUrl.includes('upload.wikimedia.org') ||
            lowerUrl.includes('ufcstats.com');
    }

    /**
     * Check if it's MMA related
     */
    private isMMARelated(text: string): boolean {
        const mmaKeywords = [
            'mixed martial arts', 'mma', 'ufc', 'fighter', 'fighting', 'combat',
            'martial arts', 'cage', 'octagon', 'bellator', 'wrestling', 'boxing',
            'jiu-jitsu', 'muay thai', 'kickboxing', 'submission', 'knockout'
        ];

        const lowerText = text.toLowerCase();
        return mmaKeywords.some(keyword => lowerText.includes(keyword));
    }
}

export default ImprovedPhotoScraper;