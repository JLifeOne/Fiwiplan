import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import API_URL from '../config';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

interface Plan {
  id: string;
  title: string;
  startAt: string | null;
}

const HomeScreen = ({ navigation }: Props) => {
  const [plans, setPlans] = useState<Plan[]>([]);

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${API_URL}/plans`);
      const data = await response.json();
      if (response.ok) {
        setPlans(data);
      } else {
        Alert.alert('Error', 'Failed to fetch plans');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchPlans();
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <FlatList
        data={plans}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => navigation.navigate('PlanDetails', { planId: item.id })}>
            <Card.Title title={item.title} subtitle={item.startAt ? new Date(item.startAt).toLocaleDateString() : ''} />
          </Card>
        )}
      />
      <Button
        mode="contained"
        onPress={() => navigation.navigate('CreatePlan')}
        style={styles.button}
      >
        Create Plan
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 10,
  },
  button: {
    margin: 20,
  },
});

export default HomeScreen;
