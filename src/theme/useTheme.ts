import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { colors, ColorScheme } from './colors';

export const useTheme = (forceScheme?: 'light' | 'dark'): ColorScheme => {
    const context = useContext(AuthContext);

    // Safety check if hook is used outside provider, though less likely here
    const isDarkMode = context?.isDarkMode ?? false;

    if (forceScheme) {
        return colors[forceScheme];
    }

    return isDarkMode ? colors.dark : colors.light;
};
