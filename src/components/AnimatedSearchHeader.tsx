import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Keyboard, Dimensions, Platform } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../theme/useTheme';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 60; // Approx header height

interface AnimatedSearchHeaderProps {
    title: string;
    onBack: () => void;
    onSearch: (text: string) => void;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    initialValue?: string;
}

const AnimatedSearchHeader: React.FC<AnimatedSearchHeaderProps> = ({ title, onBack, onSearch, onChangeText, placeholder = "Search...", initialValue = "" }) => {
    const theme = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [searchText, setSearchText] = useState(initialValue);

    // Animations
    const animValue = useRef(new Animated.Value(0)).current; // 0 = Default, 1 = Focused
    const inputRef = useRef<TextInput>(null);

    const handleChangeText = (text: string) => {
        setSearchText(text);
        if (onChangeText) onChangeText(text);
    };

    useEffect(() => {
        // Handle keyboard hide to reset if needed?
        // User said: "jb search krlo ya keyboard band kro tou wapis apni jaga pr ajaye"
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
             // Optional: Auto collapse when keyboard hides?
             // Maybe better to let user manually close or collapse on submit.
             // But user requirement implies auto-return.
             if (isFocused) {
                 handleCancel();
             }
        });
        return () => {
            keyboardDidHideListener.remove();
        };
    }, [isFocused]);

    const handleFocus = () => {
        setIsFocused(true);
        Animated.spring(animValue, {
            toValue: 1,
            useNativeDriver: false, // Layout changes need false
            friction: 8,
        }).start();
    };

    const handleCancel = () => {
        Keyboard.dismiss();
        setIsFocused(false);
        Animated.spring(animValue, {
            toValue: 0,
            useNativeDriver: false,
            friction: 8,
        }).start();
    };

    const handleSubmit = () => {
        onSearch(searchText);
        handleCancel();
    };

    // Interpolations
    const headerOpacity = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0]
    });

    const searchBarTranslateY = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -HEADER_HEIGHT + 10] // Move up by header height approx
    });

    const searchBarWidth = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [width - 40, width - 20] // Expand slightly
    });

    // To mimic "search bar moves up", we assume the search bar is rendered BELOW the header normally.
    // If we want it to move UP, we need to shift it negatively.
    // But we also need to hide the header.

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            {/* Standard Header */}
            <Animated.View style={[styles.header, { opacity: headerOpacity, height: isFocused ? 0 : HEADER_HEIGHT }]}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2">
                        <Path d="M19 12H5M12 19l-7-7 7-7" />
                    </Svg>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>{title}</Text>
                <View style={{ width: 24 }} />
            </Animated.View>

            {/* Search Bar Area */}
            <Animated.View style={[
                styles.searchWrapper,
                {
                    transform: [{ translateY: searchBarTranslateY }],
                    paddingTop: isFocused ? 50 : 10, // Add padding for status bar when at top
                }
            ]}>
                <Animated.View style={[
                    styles.searchContainer,
                    {
                        backgroundColor: theme.inputBg,
                        borderColor: theme.borderColor,
                        width: searchBarWidth
                    }
                ]}>
                    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2" style={styles.searchIcon}>
                        <Circle cx="11" cy="11" r="8" />
                        <Path d="M21 21L16.65 16.65" />
                    </Svg>
                    <TextInput
                        ref={inputRef}
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder={placeholder}
                        placeholderTextColor="#A0AEC0"
                        value={searchText}
                        onChangeText={handleChangeText}
                        onFocus={handleFocus}
                        onSubmitEditing={handleSubmit}
                    />
                    {isFocused && (
                         <TouchableOpacity onPress={() => { handleChangeText(''); }} style={{ marginRight: 5 }}>
                             <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2">
                                <Path d="M18 6L6 18M6 6l12 12" />
                             </Svg>
                         </TouchableOpacity>
                    )}
                </Animated.View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        zIndex: 100,
        overflow: 'hidden', // Clip content
        paddingBottom: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 0 : 20, // Adjust for OS
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    backButton: {
        padding: 5,
    },
    searchWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 25,
        paddingHorizontal: 15,
        height: 50,
        borderWidth: 1,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
});

export default AnimatedSearchHeader;
