import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import API_URL from '../config';

type Props = NativeStackScreenProps<RootStackParamList, 'CreatePlan'>;

const CreatePlanScreen = ({ navigation }: Props) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');

  const handleCreatePlan = async () => {
    // This is a placeholder. In a real app, you'd get the user ID from auth state.
    const userId = "clxsh9wmp00007g1gdlq3x3e0"; 
    try {
      const response = await fetch(`${API_URL}/plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description, date, location, userId }),
      });
      if (response.ok) {
        navigation.goBack();
      } else {
        const data = await response.json();
        Alert.alert('Failed to create plan', data.error || 'Something went wrong');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a new Plan</Text>
      <TextInput
        label="Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />
      <TextInput
        label="Date"
        value={date}
        onChangeText={setDate}
        style={styles.input}
        placeholder="YYYY-MM-DD"
      />
      <TextInput
        label="Location"
        value={location}
        onChangeText={setLocation}
        style={styles.input}
      />
      <Button mode="contained" onPress={handleCreatePlan} style={styles.button}>
        Create Plan
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
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

export default CreatePlanScreen;
