import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import LoginScreen from '../screens/LoginScreen';
import OTPScreen from '../screens/OTPScreen';
import HomeScreen from '../screens/HomeScreen';
import CreatePlanScreen from '../screens/CreatePlanScreen';
import AIMenuPlannerScreen from '../screens/AIMenuPlannerScreen';
import PlanDetailsScreen from '../screens/PlanDetailsScreen';
import AIChatParserScreen from '../screens/AIChatParserScreen';
import ChatScreen from '../screens/ChatScreen';
import AdsScreen from '../screens/AdsScreen';
import MyAdsScreen from '../screens/MyAdsScreen';
import CreateAdScreen from '../screens/CreateAdScreen';
import AdDemographicsScreen from '../screens/AdDemographicsScreen';
import AdPaymentScreen from '../screens/AdPaymentScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ContactsScreen from '../screens/ContactsScreen';
import AdDetailsScreen from '../screens/AdDetailsScreen';
import VendorAdManagementScreen from '../screens/VendorAdManagementScreen';
import { useAuth } from '../context/AuthContext';

export type RootStackParamList = {
  Login: undefined;
  OTP: { phone: string; debugOtp?: string };
  Home: undefined;
  CreatePlan: undefined;
  AIMenuPlanner: undefined;
  PlanDetails: { planId: string };
  AIChatParser: undefined;
  Chat: { planId: string, planTitle: string };
  Ads: undefined;
  MyAds: undefined;
  CreateAd: undefined;
  AdDemographics: { adId: string };
  AdPayment: { adId: string };
  Profile: undefined;
  Contacts: undefined;
  AdDetails: { adIds: string[], initialAdIndex: number };
  VendorAdManagement: { adId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { token, initializing } = useAuth();
  const theme = useTheme();

  if (initializing) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator animating color={theme.colors.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={token ? 'Home' : 'Login'}>
        {!token ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="OTP" component={OTPScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="CreatePlan" component={CreatePlanScreen} />
            <Stack.Screen name="AIMenuPlanner" component={AIMenuPlannerScreen} />
            <Stack.Screen name="PlanDetails" component={PlanDetailsScreen} />
            <Stack.Screen name="AIChatParser" component={AIChatParserScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Ads" component={AdsScreen} />
            <Stack.Screen name="MyAds" component={MyAdsScreen} />
            <Stack.Screen name="CreateAd" component={CreateAdScreen} />
            <Stack.Screen name="AdDemographics" component={AdDemographicsScreen} />
            <Stack.Screen name="AdPayment" component={AdPaymentScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Contacts" component={ContactsScreen} />
            <Stack.Screen name="AdDetails" component={AdDetailsScreen} />
            <Stack.Screen name="VendorAdManagement" component={VendorAdManagementScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AppNavigator;
