import React, { useContext, useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StatusBar, Keyboard } from 'react-native';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../theme/useTheme';

// Screens
import HomeScreen from '../screens/HomeScreen';
import WalletScreen from '../screens/WalletScreen';
import TradingScreen from '../screens/TradingScreen';
import PoolScreen from '../screens/PoolScreen';
import HistoryScreen from '../screens/HistoryScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    const { isDarkMode } = useContext(AuthContext);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const theme = useTheme();

    useEffect(() => {
        const keyboardShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            () => setKeyboardVisible(true)
        );
        const keyboardHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => setKeyboardVisible(false)
        );

        return () => {
            keyboardShowListener.remove();
            keyboardHideListener.remove();
        };
    }, []);

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
                        display: isKeyboardVisible ? 'none' : 'flex'
                    },
                    tabBarShowLabel: true,
                    tabBarActiveTintColor: '#4A9EFF',
                    tabBarInactiveTintColor: theme.iconColor,
                    tabBarLabelStyle: { fontSize: 10, fontWeight: '500' }
                }}
            >
                <Tab.Screen
                    name="Dashboard"
                    component={HomeScreen}
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
                    name="Wallet"
                    component={WalletScreen}
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? "2.5" : "2"}>
                                <Rect x="2" y="5" width="20" height="14" rx="2" />
                                <Path d="M22 12h-4" />
                            </Svg>
                        )
                    }}
                />
                <Tab.Screen
                    name="Trading"
                    component={TradingScreen}
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? "2.5" : "2"}>
                                <Polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                            </Svg>
                        )
                    }}
                />
                <Tab.Screen
                    name="Pool"
                    component={PoolScreen}
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? "2.5" : "2"}>
                                <Circle cx="12" cy="12" r="10" />
                                <Path d="M12 8v8M8 12h8" />
                            </Svg>
                        )
                    }}
                />
                <Tab.Screen
                    name="History"
                    component={HistoryScreen}
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? "2.5" : "2"}>
                                <Path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                                <Path d="M14 3v5h5" />
                                <Path d="M16 13H8M16 17H8M10 9H8" />
                            </Svg>
                        )
                    }}
                />
            </Tab.Navigator>
        </>
    );
};

export default BottomTabNavigator;
