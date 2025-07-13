import { makeAutoObservable } from "mobx";

export type ThemeMode = 'light' | 'dark';

export class AppStore {
    theme: ThemeMode = 'dark';
    isOnline = true;
    lastSyncTime: Date | null = null;
    isInitialized = false;
    isFirstLaunch = true;
    currentRoute = '';

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    setTheme(theme: ThemeMode) {
        this.theme = theme;
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
    }

    setOnlineStatus(isOnline: boolean) {
        this.isOnline = isOnline;
    }

    setInitialized(isInitialized: boolean) {
        this.isInitialized = isInitialized;
    }

    setCurrentRoute(route: string) {
        this.currentRoute = route;
    }
}