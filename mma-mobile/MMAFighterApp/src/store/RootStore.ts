import { createContext, useContext } from "react";
import { FighterStore } from "./FighterStore";
import { AppStore } from "./AppStore";

export class RootStore {
    fighterStore: FighterStore;
    appStore: AppStore;

    constructor() {
        this.fighterStore = new FighterStore();
        this.appStore = new AppStore;
    }
}

export const rootStore = new RootStore();
export const RootStoreContext = createContext(rootStore);

export const useStores = () => {
    const context = useContext(RootStoreContext);
    if (!context) {
        throw new Error('useStores must ve used within RootStoreProvider');
    }
    return context;
};

export const useFighterStore = () => useStores().fighterStore;
export const useAppStore = () => useStores().appStore;