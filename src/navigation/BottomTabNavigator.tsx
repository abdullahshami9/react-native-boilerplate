import React, { useContext, useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Platform, StatusBar, Keyboard } from 'react-native';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../theme/useTheme';

// Screens
import DiscoverScreen from '../features/social/screens/DiscoverScreen';
import ShopScreen from '../features/market/screens/ShopScreen';
import VirtualTryOnHistoryScreen from '../features/market/screens/VirtualTryOnHistoryScreen';
import ProfileScreen from '../features/social/screens/ProfileScreen';

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

    const theme = useTheme();

    return (
        <>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.bg} />
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: Platform.OS === 'web' ? {
                        backgroundColor: theme.navBg,
                        height: 70,
                        paddingBottom: 10,
                        paddingTop: 10,
                        borderTopWidth: 1,
                        borderTopColor: theme.inputBorder || '#E2E8F0',
                        elevation: 0,
                        position: 'relative', // Standard web flow
                        width: '100%',
                    } : {
                        backgroundColor: theme.navBg,
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
                    tabBarActiveTintColor: theme.primary,
                    tabBarInactiveTintColor: theme.iconColor,
                }}
            >
                <Tab.Screen
                    name="Home"
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
                    name="TryOn"
                    component={VirtualTryOnHistoryScreen}
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
                                <Path d="M20.33 6.64l-3.5-4.64H7.17L3.67 6.64M12 2v20M2 6.64h20" />
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
