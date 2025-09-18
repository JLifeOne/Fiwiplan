import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import OTPScreen from '../screens/OTPScreen';
import HomeScreen from '../screens/HomeScreen';
import CreatePlanScreen from '../screens/CreatePlanScreen';

export type RootStackParamList = {
  Login: undefined;
  OTP: { email: string };
  Home: undefined;
  CreatePlan: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="OTP" component={OTPScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreatePlan" component={CreatePlanScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
