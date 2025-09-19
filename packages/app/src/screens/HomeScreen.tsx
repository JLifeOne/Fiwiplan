import React, { useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

interface Plan {
  id: string;
  title: string;
  startAt: string | null;
}

const HomeScreen = ({ navigation }: Props) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const { api, user, logout } = useAuth();

  const fetchPlans = useCallback(async () => {
    try {
      const data = await api<Plan[]>('/plans');
      setPlans(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch plans';
      Alert.alert('Error', message);
    }
  }, [api]);

  useFocusEffect(
    useCallback(() => {
      fetchPlans();
    }, [fetchPlans]),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hi {user?.displayName || user?.phone || 'Planner'}!</Text>
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
      <Button
        mode="outlined"
        onPress={() => navigation.navigate('AIChatParser')}
        style={styles.button}
      >
        Create Plan with AI Chat
      </Button>
      <Button
        mode="outlined"
        onPress={() => navigation.navigate('AIMenuPlanner')}
        style={styles.button}
      >
        AI Menu Planner
      </Button>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Ads')}
        style={styles.button}
      >
        Browse Ads
      </Button>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('MyAds')}
        style={styles.button}
      >
        My Ads
      </Button>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Profile')}
        style={styles.button}
      >
        My Profile
      </Button>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Contacts')}
        style={styles.button}
      >
        Find Friends
      </Button>
      <Button mode="text" onPress={logout} style={styles.logoutButton}>
        Log Out
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    margin: 10,
  },
  button: {
    margin: 20,
  },
  logoutButton: {
    alignSelf: 'center',
    marginTop: 10,
  },
});

export default HomeScreen;
