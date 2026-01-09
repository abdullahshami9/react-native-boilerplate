import React, { useContext, useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Platform, StatusBar, Keyboard } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { AuthContext } from '../context/AuthContext';

// Screens
import DiscoverScreen from '../screens/DiscoverScreen';
import ConnectionsScreen from '../screens/ConnectionsScreen';
import ShopScreen from '../screens/ShopScreen'; // Or Inventory for Business? User might want to see Shop
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    const { isDarkMode } = useContext(AuthContext);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const keyboardShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
            }
        );
        const keyboardHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
            }
        );

        return () => {
            keyboardShowListener.remove();
            keyboardHideListener.remove();
        };
    }, []);

    const theme = {
        bg: isDarkMode ? '#1A202C' : '#F7FAFC',
        tabBg: isDarkMode ? '#2D3748' : '#fff',
        activeTint: isDarkMode ? '#F7FAFC' : '#2D3748',
        inactiveTint: isDarkMode ? '#A0AEC0' : '#A0AEC0',
    };

    return (
        <>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.bg} />
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: theme.tabBg,
                        height: Platform.OS === 'ios' ? 85 : 65,
                        paddingBottom: Platform.OS === 'ios' ? 30 : 10,
                        paddingTop: 10,
                        borderTopLeftRadius: 30,
                        borderTopRightRadius: 30,
                        borderTopWidth: 0,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 10,
                        elevation: 10,
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        display: isKeyboardVisible ? 'none' : 'flex'
                    },
                    tabBarShowLabel: false,
                    tabBarActiveTintColor: theme.activeTint,
                    tabBarInactiveTintColor: theme.inactiveTint,
                }}
            >
                <Tab.Screen
                    name="Discover"
                    component={DiscoverScreen}
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? "2.5" : "2"}>
                                <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <Path d="M9 22V12h6v10" />
                            </Svg>
                        )
                    }}
                />
                <Tab.Screen
                    name="Connections"
                    component={ConnectionsScreen}
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? "2.5" : "2"}>
                                <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <Circle cx="9" cy="7" r="4" />
                                <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </Svg>
                        )
                    }}
                />
                <Tab.Screen
                    name="Shop"
                    component={ShopScreen}
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? "2.5" : "2"}>
                                <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                <Path d="M3 6h18" />
                                <Path d="M16 10a4 4 0 0 1-8 0" />
                            </Svg>
                        )
                    }}
                />
                <Tab.Screen
                    name="ProfileTab"
                    component={ProfileScreen}
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? "2.5" : "2"}>
                                <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <Circle cx="12" cy="7" r="4" />
                            </Svg>
                        )
                    }}
                />
            </Tab.Navigator>
        </>
    );
};

export default BottomTabNavigator;
