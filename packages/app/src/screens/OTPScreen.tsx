import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import API_URL from '../config';

type Props = NativeStackScreenProps<RootStackParamList, 'OTP'>;

const OTPScreen = ({ route, navigation }: Props) => {
  const { email } = route.params;
  const [otp, setOtp] = useState('');

  const handleVerify = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (response.ok) {
        // In a real app, you'd store the JWT here
        navigation.navigate('Home');
      } else {
        Alert.alert('Verification Failed', data.error || 'Something went wrong');
      }
    } catch (error) {
      Alert.alert('Verification Error', 'An unexpected error occurred.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>An OTP has been sent to {email}</Text>
      <TextInput
        label="OTP"
        value={otp}
        onChangeText={setOtp}
        style={styles.input}
        keyboardType="number-pad"
      />
      <Button mode="contained" onPress={handleVerify} style={styles.button}>
        Verify
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  },
});

export default OTPScreen;
