import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

const nativeStorage = {
    getString: (key: string) => storage.getString(key) || null,
    setString: (key: string, value: string) => storage.set(key, value),
    delete: (key: string) => storage.delete(key),
    clear: () => storage.clearAll(),
};

export default nativeStorage;
