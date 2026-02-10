import LocalAssets from './LocalAssets';

// Assuming backend is on localhost:3000 for now, or configured via env
const API_URL = 'http://localhost:3000';

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
        return path;
    }

    // Assume server path
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${API_URL}/${cleanPath}`;
};

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
