export interface Fighter {
    id: number;
    name: string;
    nickname?: string;
    weightClass: WeightClass;
    nationality?: string;
    age?: number;
    height?: number;
    weight?: number;
    reach?: number;
    wins: number;
    losses: number;
    draws: number;
    isActive: boolean;
    birthDate?: string;
    stance?: string;
    photoUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export type WeightClass =
    | 'FLYWEIGHT'
    | 'BANTAMWEIGHT'
    | 'FEATHERWEIGHT'
    | 'LIGHTWEIGHT'
    | 'WELTERWEIGHT'
    | 'MIDDLEWEIGHT'
    | 'LIGHT_HEAVYWEIGHT'
    | 'HEAVYWEIGHT';

export interface FighterFilters {
    weightClass?: WeightClass;
    isActive?: boolean;
    search?: string;
}

export interface PaginationData {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}