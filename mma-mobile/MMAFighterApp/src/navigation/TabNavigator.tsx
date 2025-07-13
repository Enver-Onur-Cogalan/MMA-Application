import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, View } from 'react-native';
import { FighterListScreen } from '../screens/FighterListScreen';
import { CreateFighterScreen } from '../screens/CreateFighterScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TabParamList } from '../types/navigation';
import { colors, spacing } from '../utils/theme';
import { AnimatedTabIcon } from '../components/AnimatedTabIcon';
import { scale } from '../utils/dimensions';

const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator: React.FC = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route, navigation }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color }) => {
                    let iconName: string;

                    switch (route.name) {
                        case 'Fighters':
                            iconName = 'sports-mma';
                            break;
                        case 'Create':
                            iconName = 'add-circle-outline';
                            break;
                        case 'Settings':
                            iconName = 'settings';
                            break;
                        default:
                            iconName = 'help-outline';
                            break;
                    }

                    return (
                        <AnimatedTabIcon
                            name={iconName}
                            focused={focused}
                            color={color}
                            size={scale(16)}
                            onPress={() => {
                                // Trigger navigation on every click (even on the same tab)
                                navigation.navigate(route.name as any);
                            }}
                        />
                    );
                },
                tabBarStyle: {
                    backgroundColor: colors.dark.surface,
                    borderTopColor: colors.dark.border,
                    borderTopWidth: 1,
                    height: Platform.OS === 'ios' ? scale(90) : scale(70),
                    paddingBottom: Platform.OS === 'ios' ? spacing.md : spacing.sm,
                    paddingTop: spacing.sm,
                    paddingHorizontal: spacing.sm,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.dark.textSecondary,
                tabBarLabelStyle: {
                    fontSize: scale(12),
                    fontWeight: '500',
                    marginTop: spacing.xs / 2,
                },
                tabBarButton: (props) => {
                    return <View {...props} />;
                },
            })}
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