import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import OTPScreen from '../screens/OTPScreen';
import HomeScreen from '../screens/HomeScreen';
import CreatePlanScreen from '../screens/CreatePlanScreen';
import AIMenuPlannerScreen from '../screens/AIMenuPlannerScreen';
import PlanDetailsScreen from '../screens/PlanDetailsScreen';

export type RootStackParamList = {
  Login: undefined;
  OTP: { email: string };
  Home: undefined;
  CreatePlan: undefined;
  AIMenuPlanner: undefined;
  PlanDetails: { planId: string };
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
        <Stack.Screen name="AIMenuPlanner" component={AIMenuPlannerScreen} />
        <Stack.Screen name="PlanDetails" component={PlanDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
