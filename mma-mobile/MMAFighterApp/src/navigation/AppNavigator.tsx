import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TabNavigator } from './TabNavigator';
import { FighterDetailScreen } from "../screens/FighterDetailScreen";
import { CreateFighterScreen } from "../screens/CreateFighterScreen";
import { RootStackParamList } from "../types/navigation";

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Main"
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="Main" component={TabNavigator} />
                <Stack.Screen name="FighterDetail" component={FighterDetailScreen} />
                <Stack.Screen name="CreateFighter" component={CreateFighterScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};