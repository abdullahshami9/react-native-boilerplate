export type ColorScheme = {
    bg: string;
    authBg: string; // New for Login/Signup/Starter
    headerBg: string;
    text: string;
    subText: string;
    cardBg: string;
    navBg: string;
    navBorder: string;
    iconColor: string;
    primary: string;
    secondary: string;
    inputBg: string;
    inputBorder: string;
    slotFreeBg: string;
    slotFreeText: string;
    slotBusyBg: string;
    slotBusyText: string;
    error: string;
    success: string;
    divider: string;
    borderColor: string;
    buttonBg?: string; // Optional for now as it wasn't there before
};

export const lightColors: ColorScheme = {
    bg: '#F7FAFC',
    authBg: '#E8EEF3', // Preserving existing auth screen background
    headerBg: '#F7FAFC',
    text: '#2D3748',
    subText: '#718096',
    cardBg: '#FFFFFF',
    navBg: '#FFFFFF',
    navBorder: '#E2E8F0',
    iconColor: '#4A5568',
    primary: '#4A9EFF',
    secondary: '#4A5568',
    inputBg: 'rgba(255, 255, 255, 0.4)',
    inputBorder: 'rgba(160, 174, 192, 0.3)',
    slotFreeBg: '#C6F6D5',
    slotFreeText: '#22543D',
    slotBusyBg: '#FED7D7',
    slotBusyText: '#822727',
    error: '#E53E3E',
    success: '#38A169',
    divider: '#E2E8F0',
    borderColor: '#E2E8F0', // Light gray for borders
    buttonBg: '#EDF2F7', // Default light button bg
};

export const darkColors: ColorScheme = {
    bg: '#0b141a',
    authBg: '#0b141a', // Unified dark background (though forced light won't see this)
    headerBg: '#202c33',
    text: '#e9edef',
    subText: '#8696a0',
    cardBg: '#202c33',
    navBg: '#202c33',
    navBorder: '#37404a',
    iconColor: '#aebac1',
    primary: '#00a884',
    secondary: '#00a884',
    inputBg: '#2a3942',
    inputBorder: 'transparent',
    slotFreeBg: '#005c4b',
    slotFreeText: '#e9edef',
    slotBusyBg: '#8c1c1c',
    slotBusyText: '#ffdcdc',
    error: '#f15c6d',
    success: '#00a884',
    divider: '#37404a',
    borderColor: '#37404a', // Dark gray for borders
    buttonBg: '#37404a', // Subtle Dark Gray for buttons (Replacing Blue)
};

export const colors = {
    light: lightColors,
    dark: darkColors,
};
