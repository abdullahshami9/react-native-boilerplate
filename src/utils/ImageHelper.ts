import { CONFIG } from '../Config';
import LocalAssets from './LocalAssets';

// Helper to resolve image source for <Image source={...} />
export const resolveImage = (path: string | null | undefined, defaultKey: string = 'business_startup_growth') => {
    if (!path) {
        return LocalAssets[defaultKey] || LocalAssets['business_startup_growth'];
    }

    // Check if it's a local asset key
    if (path.startsWith('asset:')) {
        const key = path.replace('asset:', '');
        return LocalAssets[key] || LocalAssets[defaultKey] || LocalAssets['business_startup_growth'];
    }

    // Check if it's a full URL (mock data or external)
    if (path.startsWith('http')) {
        return { uri: path };
    }

    // Assume server path
    // If it's a server path, we need to ensure we don't double slash if API_URL has trailing slash
    const baseUrl = CONFIG.API_URL.endsWith('/') ? CONFIG.API_URL.slice(0, -1) : CONFIG.API_URL;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    return { uri: `${baseUrl}/${cleanPath}` };
};

// Helper to get a default image based on context
export const getDefaultImageForType = (type: 'business' | 'customer' | 'product' | 'service', subtype?: string) => {
    switch (type) {
        case 'business':
            return 'asset:business_finance_boss';
        case 'customer':
            return 'asset:leisure_relax';
        case 'product':
            if (subtype?.toLowerCase().includes('food')) return 'asset:food_butcher';
            if (subtype?.toLowerCase().includes('tech')) return 'asset:business_technology';
            if (subtype?.toLowerCase().includes('sport')) return 'asset:sport_soccer';
            if (subtype?.toLowerCase().includes('cloth')) return 'asset:shopping_fashion';
            return 'asset:shopping_purchase';
        case 'service':
            return 'asset:business_support';
        default:
            return 'asset:business_startup_growth';
    }
};
