import { Platform } from 'react-native';

// Web Implementation (Default)
const webStorage = {
    getString: (key: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
            return localStorage.getItem(key);
        }
        return null;
    },
    setString: (key: string, value: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(key, value);
        }
    },
    delete: (key: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem(key);
        }
    },
    clear: () => {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.clear();
        }
    }
};

export default webStorage;
