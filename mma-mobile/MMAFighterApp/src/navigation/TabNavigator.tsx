import React from "react";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FighterListScreen } from "../screens/FighterListScreen";
import { CreateFighterScreen } from "../screens/CreateFighterScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { TabParamList } from "../types/navigation";
import { colors } from "../utils/theme";


const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator: React.FC = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.dark.surface,
                    borderTopColor: colors.dark.border,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.dark.textSecondary,
            }}
        >
            <Tab.Screen
                name="Fighters"
                component={FighterListScreen}
                options={{
                    tabBarLabel: 'Fighters',
                }}
            />
            <Tab.Screen
                name="Create"
                component={CreateFighterScreen}
                options={{
                    tabBarLabel: 'Add Fighter',
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarLabel: 'Settings',
                }}
            />
        </Tab.Navigator>
    );
};