import React, { useContext, useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Platform, StatusBar, Keyboard } from 'react-native';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../theme/useTheme';

// Screens
import DiscoverScreen from '../screens/DiscoverScreen';
import ConnectionsScreen from '../screens/ConnectionsScreen';
import ShopScreen from '../screens/ShopScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Business Screens
import StatsScreen from '../screens/business/StatsScreen';
import BusinessOrdersScreen from '../screens/business/BusinessOrdersScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    const { isDarkMode, userInfo } = useContext(AuthContext);
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
    const isBusiness = userInfo?.user_type === 'Business' || userInfo?.user_type === 'business';

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
                {isBusiness ? (
                    // BUSINESS TABS
                    <>
                        <Tab.Screen
                            name="ProfileTab"
                            component={ProfileScreen}
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
                            name="Stats"
                            component={StatsScreen}
                            options={{
                                tabBarIcon: ({ color, focused }) => (
                                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? "2.5" : "2"}>
                                        <Line x1="18" y1="20" x2="18" y2="10" />
                                        <Line x1="12" y1="20" x2="12" y2="4" />
                                        <Line x1="6" y1="20" x2="6" y2="14" />
                                    </Svg>
                                )
                            }}
                        />
                        <Tab.Screen
                            name="Orders"
                            component={BusinessOrdersScreen}
                            options={{
                                tabBarIcon: ({ color, focused }) => (
                                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? "2.5" : "2"}>
                                        <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                        <Line x1="3" y1="6" x2="21" y2="6" />
                                        <Path d="M16 10a4 4 0 0 1-8 0" />
                                    </Svg>
                                )
                            }}
                        />
                        <Tab.Screen
                            name="Notifications"
                            component={NotificationsScreen}
                            options={{
                                tabBarIcon: ({ color, focused }) => (
                                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? "2.5" : "2"}>
                                        <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                        <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                    </Svg>
                                )
                            }}
                        />
                    </>
                ) : (
                    // CUSTOMER TABS (Original)
                    <>
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
                    </>
                )}
            </Tab.Navigator>
        </>
    );
};

export default BottomTabNavigator;
