import React, { useState } from 'react';
import { View, StyleSheet, Alert, Image } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const { requestOtp } = useAuth();

  const handleLogin = async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    try {
      const trimmedPhone = phone.trim();
      const result = await requestOtp(trimmedPhone);

      if (result.success) {
        navigation.navigate('OTP', { phone: trimmedPhone, debugOtp: result.debugOtp });
        if (result.debugOtp) {
          console.log('Debug OTP:', result.debugOtp);
        }
      } else {
        Alert.alert('Login Failed', result.error || 'Something went wrong');
      }
    } catch (error) {
      Alert.alert('Login Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} />
      <Text style={[styles.title, { color: theme.colors.primary }]}>Welcome to FiwiPlan</Text>
      <Text style={styles.subtitle}>Plan Together, Seamlessly.</Text>
      <TextInput
        label="Phone Number"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        keyboardType="phone-pad"
        autoCapitalize="none"
      />
      <Button
        mode="contained"
        onPress={handleLogin}
        style={styles.button}
        loading={loading}
        disabled={loading}
      >
        Continue with Phone
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
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  input: {
    marginBottom: 20,
  },
  button: {
    paddingVertical: 8,
    marginTop: 10,
  },
});

export default LoginScreen;
