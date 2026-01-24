import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View } from 'react-native';

import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ProductDetailsScreen from './src/screens/ProductDetailsScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import AddProductScreen from './src/screens/AddProductScreen';
import BusinessOnboardingScreen from './src/screens/BusinessOnboardingScreen';
import ChatListScreen from './src/screens/ChatListScreen';
import ChatScreen from './src/screens/ChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ServiceDetailsScreen from './src/screens/ServiceDetailsScreen';
import BookingScreen from './src/screens/BookingScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import BusinessCardEditorScreen from './src/screens/BusinessCardEditorScreen';

// Business Screens
import ManageServicesScreen from './src/screens/business/ManageServicesScreen';
import ServiceAppointmentsScreen from './src/screens/business/ServiceAppointmentsScreen';
import ProcurementScreen from './src/screens/business/ProcurementScreen';
import BusinessOrdersScreen from './src/screens/business/BusinessOrdersScreen';
import CustomerOrdersScreen from './src/screens/CustomerOrdersScreen';
import ARCardScannerScreen from './src/screens/ar/ARCardScannerScreen';

// Tunnel Screens
import ChooseProfileTypeScreen from './src/screens/tunnel/ChooseProfileTypeScreen';
import PersonalDetailsScreen from './src/screens/tunnel/personal/PersonalDetailsScreen';
import PersonalSkillsScreen from './src/screens/tunnel/personal/PersonalSkillsScreen';
import PersonalEducationScreen from './src/screens/tunnel/personal/PersonalEducationScreen';
import PersonalLocationJobScreen from './src/screens/tunnel/personal/PersonalLocationJobScreen';
import BusinessLocationScreen from './src/screens/tunnel/business/BusinessLocationScreen';
import BusinessTypeContactScreen from './src/screens/tunnel/business/BusinessTypeContactScreen';
import BusinessIndustryScreen from './src/screens/tunnel/business/BusinessIndustryScreen';
import PaymentIntegrationScreen from './src/screens/tunnel/PaymentIntegrationScreen';
import IdentityGateScreen from './src/screens/tunnel/IdentityGateScreen';

const Stack = createNativeStackNavigator();

const AppNav = () => {
  const { isLoading, userToken, userInfo } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7FAFC' }}>
        <ActivityIndicator size="large" color="#4A9EFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        presentation: 'card',
        gestureEnabled: true,
      }}>
        {userToken !== null ? (
          // User is logged in
          userInfo?.is_tunnel_completed ? (
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

              {/* Customer Screens */}
              <Stack.Screen name="ServiceDetails" component={ServiceDetailsScreen} />
              <Stack.Screen name="Booking" component={BookingScreen} />
              <Stack.Screen name="CustomerOrders" component={CustomerOrdersScreen} />
              <Stack.Screen name="Checkout" component={CheckoutScreen} />

              {/* Business Screens */}
              <Stack.Screen name="ManageServices" component={ManageServicesScreen} />
              <Stack.Screen name="ServiceAppointments" component={ServiceAppointmentsScreen} />
              <Stack.Screen name="Procurement" component={ProcurementScreen} />
              <Stack.Screen name="BusinessOrders" component={BusinessOrdersScreen} />
              <Stack.Screen name="ARCardScanner" component={ARCardScannerScreen} />
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
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <AppNav />
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
