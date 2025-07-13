import { makeAutoObservable, runInAction } from 'mobx';
import { Fighter, FighterFilters, PaginationData } from '../types/fighter';
import { fighterApi } from '../services/api/fighterApi';

export class FighterStore {
    fighters: Fighter[] = [];
    selectedFighter: Fighter | null = null;
    filters: FighterFilters = {};
    pagination: PaginationData = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    };

    isLoading = false;
    isLoadingMore = false;
    isRefreshing = false;
    isCreating = false;
    isUpdating = false;
    isDeleting = false;

    error: string | null = null;

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    get activeFighters() {
        return this.fighters.filter(fighter => fighter.isActive);
    }

    get inactiveFighters() {
        return this.fighters.filter(fighter => !fighter.isActive);
    }

    get fightersByWeightClass() {
        const grouped: Record<string, Fighter[]> = {};
        this.fighters.forEach(fighter => {
            if (!grouped[fighter.weightClass]) {
                grouped[fighter.weightClass] = [];
            }
            grouped[fighter.weightClass].push(fighter);
        });
        return grouped;
    }

    async loadFighters(refresh = false) {
        if (refresh) {
            this.isRefreshing = true;
            this.pagination.page = 1;
        } else {
            this.isLoading = true;
        }

        this.error = null;

        try {
            const response = await fighterApi.getFighters({
                page: this.pagination.page,
                limit: this.pagination.limit,
                ...this.fighters
            });

            runInAction(() => {
                if (refresh || this.pagination.page === 1) {
                    this.fighters = response.data;
                } else {
                    this.fighters.push(...response.data);
                }

                this.pagination = response.pagination;
            });
        } catch (error) {
            runInAction(() => {
                this.error = error instanceof Error ? error.message : 'Failed to load fighters';
            });
        } finally {
            runInAction(() => {
                this.isLoading = false;
                this.isRefreshing = false;
                this.isLoadingMore = false;
            });
        }
    }

    async loadMoreFighters() {
        if (this.isLoadingMore || this.pagination.page >= this.pagination.totalPages) {
            return;
        }

        this.isLoadingMore = true;
        this.pagination.page += 1;
        await this.loadFighters();
    }

    setFilters(filters: Partial<FighterFilters>) {
        this.filters = { ...this.filters, ...filters };
        this.pagination.page = 1;
        this.loadFighters(true);
    }

    clearFilters() {
        this.filters = {};
        this.pagination.page = 1;
        this.loadFighters(true);
    }

    setSearch(search: string) {
        this.setFilters({ search: search || undefined });
    }

    selectFighter(fighter: Fighter) {
        this.selectedFighter = fighter;
    }

    clearSelection() {
        this.selectedFighter = null;
    }

    cleanError() {
        this.error = null;
    }
}