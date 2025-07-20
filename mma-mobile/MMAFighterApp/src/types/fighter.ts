export interface Fighter {
    id: number;  // Backend'de number
    name: string;
    nickname?: string;
    nationality?: string;
    age?: number;
    weightClass: string;
    wins: number;
    losses: number;
    draws: number;
    isActive: boolean;

    // Backend Prisma fields
    height?: number;
    weight?: number;
    reach?: number;
    photoUrl?: string;
    stance?: string;
    birthDate?: string;
    biography?: string;
    birthPlace?: string;
    fightingStyle?: string;
    team?: string;
    coach?: string;
    createdAt?: string;
    updatedAt?: string;

    // Legacy fields (deprecated - use backend fields instead)
    record?: string;
    image?: string;
    profileImage?: string;
    description?: string;
    achievements?: string[];
    upcomingFights?: UpcomingFight[];
    recentFights?: Fight[];
    socialMedia?: SocialMedia;
    ranking?: {
        position: number;
        division: string;
        organization: string;
    };
    stats?: FighterStats;
}

export interface Fight {
    id: string;
    opponent: string;
    result: 'Win' | 'Loss' | 'Draw' | 'No Contest';
    method: string;
    round?: number;
    time?: string;
    date: string;
    event: string;
    location: string;
}

export interface UpcomingFight {
    id: string;
    opponent: string;
    date: string;
    event: string;
    location: string;
    weightClass: string;
    isTitle?: boolean;
}

export interface SocialMedia {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
}

export interface FighterStats {
    strikeAccuracy?: number;
    takedownAccuracy?: number;
    submissionAttempts?: number;
    knockouts?: number;
    submissions?: number;
    decisions?: number;
    averageFightTime?: string;
    finishRate?: number;
}

export interface WeightClass {
    id: string;
    name: string;
    weightLimit: number;
    unit: 'lbs' | 'kg';
    organization: string;
}

export interface FighterFilters {
    weightClass?: string;
    nationality?: string;
    ageRange?: {
        min: number;
        max: number;
    };
    recordFilter?: {
        minWins?: number;
        maxLosses?: number;
    };
    ranking?: {
        topOnly: boolean;
        maxPosition?: number;
    };
    search?: string;
}

export type FighterSortBy = 'name' | 'ranking' | 'wins' | 'age' | 'lastFight';
export type SortOrder = 'asc' | 'desc';