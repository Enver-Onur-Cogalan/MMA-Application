import { Fighter } from "./fighter";

export type RootStackParamList = {
    Main: undefined;
    FighterDetail: { fighter: Fighter };
    CreateFighter: undefined;
    EditFighter: { fighter: Fighter };
};

export type TabParamList = {
    Fighters: undefined;
    Create: undefined;
    Settings: undefined;
};