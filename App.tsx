import React, { useContext, useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { ActivityIndicator, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import DeviceInfo from 'react-native-device-info';
import axios from 'axios';
import { CONFIG } from './src/Config';

// React Query & Persistence
import { QueryClient, onlineManager } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import storage from './src/shared/utils/storage';

import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import SocketService from './src/services/SocketService';
import MiniToast, { MiniToastRef } from './src/components/MiniToast';
import LoginScreen from './src/features/auth/screens/LoginScreen';
import SignupScreen from './src/features/auth/screens/SignupScreen';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import OnboardingScreen from './src/features/auth/screens/OnboardingScreen';
import ProductDetailsScreen from './src/features/market/screens/ProductDetailsScreen';
import InventoryScreen from './src/features/market/screens/InventoryScreen';
import AddProductScreen from './src/features/market/screens/AddProductScreen';
import BusinessOnboardingScreen from './src/features/business/screens/BusinessOnboardingScreen';
import ChatListScreen from './src/features/social/screens/ChatListScreen';
import ChatScreen from './src/features/social/screens/ChatScreen';
import ProfileScreen from './src/features/social/screens/ProfileScreen';
import ServiceDetailsScreen from './src/features/services/screens/ServiceDetailsScreen';
import BookingScreen from './src/features/services/screens/BookingScreen';
import CheckoutScreen from './src/features/market/screens/CheckoutScreen';
import BusinessCardEditorScreen from './src/features/business/screens/BusinessCardEditorScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';

// Business Screens
import ManageServicesScreen from './src/features/business/screens/ManageServicesScreen';
import ServiceAppointmentsScreen from './src/features/services/screens/ServiceAppointmentsScreen';
import ProcurementScreen from './src/features/business/screens/ProcurementScreen';
import BusinessOrdersScreen from './src/features/business/screens/BusinessOrdersScreen';
import CustomerOrdersScreen from './src/screens/CustomerOrdersScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';
import ARCardScannerScreen from './src/screens/ar/ARCardScannerScreen';

// Tunnel Screens
import ChooseProfileTypeScreen from './src/screens/tunnel/ChooseProfileTypeScreen';
import PersonalDetailsScreen from './src/screens/tunnel/personal/PersonalDetailsScreen';
import PersonalSkillsScreen from './src/screens/tunnel/personal/PersonalSkillsScreen';
import PersonalEducationScreen from './src/screens/tunnel/personal/PersonalEducationScreen';
import PersonalLocationJobScreen from './src/screens/tunnel/personal/PersonalLocationJobScreen';
import PersonalJobScreen from './src/screens/tunnel/personal/PersonalJobScreen';
import BusinessLocationScreen from './src/screens/tunnel/business/BusinessLocationScreen';
import BusinessTypeContactScreen from './src/screens/tunnel/business/BusinessTypeContactScreen';
import BusinessIndustryScreen from './src/screens/tunnel/business/BusinessIndustryScreen';
import PaymentIntegrationScreen from './src/screens/tunnel/PaymentIntegrationScreen';
import IdentityGateScreen from './src/screens/tunnel/IdentityGateScreen';
import PremiumUpgradeScreen from './src/features/business/screens/PremiumUpgradeScreen';
import { navigationRef } from './src/utils/NavigationHelper';

const Stack = Platform.OS === 'web' ? createStackNavigator() : createNativeStackNavigator();

// React Query Setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days cache for offline support
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
      retry: 2
    },
    mutations: {
      networkMode: 'offlineFirst', // Allow mutations to fire when offline
      retry: 3,
    }
  },
});

// Configure Online Status Manager for React Query
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: {
    getItem: async (key) => storage.getString(key),
    setItem: async (key, value) => storage.setString(key, value),
    removeItem: async (key) => storage.delete(key),
  },
});

const AppNav = () => {
  const { isLoading, userToken, userInfo } = useContext(AuthContext);
  const toastRef = useRef<MiniToastRef>(null);

  // Connection & Metadata Handling
  useEffect(() => {
    // 1. Monitor Internet Connection
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      if (state.isConnected === false) {
        toastRef.current?.show('No Internet Connection', 'error');
      } else if (state.isConnected === true) {
        // Optional: toastRef.current?.show('Back Online', 'success');
      }
    });

    // 2. Sync Metadata (Once per session if user is logged in)
    const syncMetadata = async () => {
      if (userInfo?.id) {
        try {
          const ip = await NetInfo.fetch().then(state => state.details && 'ipAddress' in state.details ? String(state.details.ipAddress) : '0.0.0.0');
          const metadata = {
            user_id: userInfo.id,
            device_model: DeviceInfo.getModel(),
            os_version: DeviceInfo.getSystemVersion(),
            app_version: DeviceInfo.getVersion(),
            ip_address: ip,
            // Location could be added here if permission granted
            meta_data: {
              brand: DeviceInfo.getBrand(),
              manufacturer: DeviceInfo.getManufacturer(),
              isEmulator: await DeviceInfo.isEmulator(),
              tablet: DeviceInfo.isTablet()
            }
          };
          // Fire and forget
          await axios.post(`${CONFIG.API_URL}/api/metadata`, metadata).catch(err => console.log("Meta sync fail", err.message));
        } catch (e) {
          console.log("Metadata collection failed", e);
        }
      }
    };

    if (userInfo?.id) {
      syncMetadata();
    }

    return () => {
      unsubscribeNetInfo();
    };
  }, [userInfo?.id]);

  useEffect(() => {
    if (userInfo?.id) {
      SocketService.connect(userInfo.id);
      SocketService.registerUser(userInfo.id);

      const offNotification = SocketService.onNotification((data: any) => {
        if (toastRef.current) {
          toastRef.current.show(`${data.title}: ${data.message}`);
        }
      });

      return () => {
        offNotification();
        SocketService.disconnect();
      };
    }
  }, [userInfo?.id]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7FAFC' }}>
        <ActivityIndicator size="large" color="#4A9EFF" />
      </View>
    );
  }

  return (
    <>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          presentation: 'card',
          gestureEnabled: true,
        }}>
          {userToken !== null ? (
            // User is logged in
            (Number(userInfo?.is_tunnel_completed) === 1 || userInfo?.is_tunnel_completed === true) ? (
              // Main App Stack
              <>
                <Stack.Screen name="Main" component={BottomTabNavigator} />
                <Stack.Screen name="BusinessOnboarding" component={BusinessOnboardingScreen} />
                <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
                <Stack.Screen name="Inventory" component={InventoryScreen} />
                <Stack.Screen name="AddProduct" component={AddProductScreen} />
                <Stack.Screen name="ChatList" component={ChatListScreen} />
                <Stack.Screen name="Chat" component={ChatScreen} />
                <Stack.Screen name="UserProfile" component={ProfileScreen} />
                <Stack.Screen name="BusinessCardEditor" component={BusinessCardEditorScreen} />
                <Stack.Screen name="Notifications" component={NotificationsScreen} />

                {/* Customer Screens */}
                <Stack.Screen name="ServiceDetails" component={ServiceDetailsScreen} />
                <Stack.Screen name="Booking" component={BookingScreen} />
                <Stack.Screen name="CustomerOrders" component={CustomerOrdersScreen} />
                <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
                <Stack.Screen name="Checkout" component={CheckoutScreen} />

                {/* Business Screens */}
                <Stack.Screen name="ManageServices" component={ManageServicesScreen} />
                <Stack.Screen name="ServiceAppointments" component={ServiceAppointmentsScreen} />
                <Stack.Screen name="Procurement" component={ProcurementScreen} />
                <Stack.Screen name="BusinessOrders" component={BusinessOrdersScreen} />
                <Stack.Screen name="ARCardScanner" component={ARCardScannerScreen} />
                <Stack.Screen name="PremiumUpgrade" component={PremiumUpgradeScreen} />
              </>
            ) : (
              // Tunnel Stack (Mandatory Onboarding)
              <>
                <Stack.Screen name="ChooseProfileType" component={ChooseProfileTypeScreen} />

                {/* Personal Flow */}
                <Stack.Screen name="PersonalDetails" component={PersonalDetailsScreen} />
                <Stack.Screen name="PersonalSkills" component={PersonalSkillsScreen} />
                <Stack.Screen name="PersonalEducation" component={PersonalEducationScreen} />
                <Stack.Screen name="PersonalLocationJob" component={PersonalLocationJobScreen} />
                <Stack.Screen name="PersonalJob" component={PersonalJobScreen} />

                {/* Business Flow */}
                <Stack.Screen name="BusinessLocation" component={BusinessLocationScreen} />
                <Stack.Screen name="BusinessTypeContact" component={BusinessTypeContactScreen} />
                <Stack.Screen name="BusinessIndustry" component={BusinessIndustryScreen} />

                {/* Common Final Step */}
                <Stack.Screen name="IdentityGate" component={IdentityGateScreen} />
                <Stack.Screen name="PaymentIntegration" component={PaymentIntegrationScreen} />
              </>
            )
          ) : (
            // Auth Stack
            <>
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <MiniToast ref={toastRef} />
    </>
  );
};

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        {/* resumePausedMutations: true ensures offline mutations retry on reconnect */}
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister: asyncStoragePersister,
            dehydrateOptions: {
              shouldDehydrateMutation: (mutation: any) => true, // Persist all mutations for offline support
              shouldDehydrateQuery: (query: any) => {
                // Default logic + ensure we persist critical data
                return true;
              }
            }
          }}
          onSuccess={() => {
            queryClient.resumePausedMutations().then(() => {
              // console.log("Paused mutations resumed");
            });
          }}
        >
          <AuthProvider>
            <CartProvider>
              <AppNav />
            </CartProvider>
          </AuthProvider>
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
