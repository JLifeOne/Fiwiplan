import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'OTP'>;

const OTPScreen = ({ route, navigation }: Props) => {
  const { phone, debugOtp } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const { verifyOtp } = useAuth();

  useEffect(() => {
    if (debugOtp) {
      console.log('Debug OTP:', debugOtp);
    }
  }, [debugOtp]);

  const handleVerify = async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOtp(phone, otp);
      if (result.success) {
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      } else {
        Alert.alert('Verification Failed', result.error || 'Something went wrong');
      }
    } catch (error) {
      Alert.alert('Verification Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={styles.title}>Verify Your Number</Text>
      <Text style={styles.subtitle}>Enter the 6-digit code sent to {phone}</Text>
      {debugOtp ? <Text style={styles.debugInfo}>Dev code: {debugOtp}</Text> : null}
      <TextInput
        label="OTP Code"
        value={otp}
        onChangeText={setOtp}
        style={styles.input}
        keyboardType="number-pad"
        maxLength={6}
      />
      <Button
        mode="contained"
        onPress={handleVerify}
        style={styles.button}
        loading={loading}
        disabled={loading}
      >
        Verify & Proceed
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 16,
    color: '#666',
  },
  debugInfo: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
    color: '#888',
  },
  input: {
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 8,
    marginTop: 10,
  },
});

export default OTPScreen;
