import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Card, Title, Paragraph, ActivityIndicator, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'AIMenuPlanner'>;

const AIMenuPlannerScreen = ({ navigation }: Props) => {
  const { colors } = useTheme();
  const [eventType, setEventType] = useState('cookout');
  const [adults, setAdults] = useState('50');
  const [kids, setKids] = useState('10');
  const [mealStyle, setMealStyle] = useState('cookout');
  const [culture, setCulture] = useState('jamaican');
  const [menuPlan, setMenuPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { api } = useAuth();

  const handleGenerateMenu = async () => {
    setLoading(true);
    setError(null);
    setMenuPlan(null);
    try {
      const payload = {
        eventType,
        adults: parseInt(adults, 10),
        kids: parseInt(kids, 10),
        mealStyle,
        culture,
      };

      const data = await api('/ai/menu', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setMenuPlan(data);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to generate menu.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>AI Menu Planner</Text>
      <TextInput label="Event Type" value={eventType} onChangeText={setEventType} style={styles.input} />
      <TextInput label="Adults" value={adults} onChangeText={setAdults} keyboardType="numeric" style={styles.input} />
      <TextInput label="Kids" value={kids} onChangeText={setKids} keyboardType="numeric" style={styles.input} />
      <TextInput label="Meal Style" value={mealStyle} onChangeText={setMealStyle} style={styles.input} />
      <TextInput label="Culture" value={culture} onChangeText={setCulture} style={styles.input} />
      <Button mode="contained" onPress={handleGenerateMenu} style={styles.button} loading={loading} disabled={loading}>
        Generate Menu
      </Button>

      {loading && <ActivityIndicator animating={true} color={colors.primary} size="large" style={styles.loader} />}

      {error && <Text style={styles.error}>{error}</Text>}

      {menuPlan && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Menu Plan</Title>
            <Paragraph>Event Type: {menuPlan.eventType}</Paragraph>
            <Paragraph>Guests: {menuPlan.adults} Adults, {menuPlan.kids} Kids</Paragraph>
            
            {menuPlan.dishes && menuPlan.dishes.length > 0 && <Title style={styles.marginTop}>Dishes</Title>}
            {menuPlan.dishes?.map((dish: any, index: number) => (
              <Paragraph key={index}>{dish.name} (Serves {dish.servings})</Paragraph>
            ))}

            {menuPlan.shoppingList && menuPlan.shoppingList.length > 0 && <Title style={styles.marginTop}>Shopping List</Title>}
            {menuPlan.shoppingList?.map((item: any, index: number) => (
              <Paragraph key={index}>{item.item} - {item.pack} ({item.units} units)</Paragraph>
            ))}

            {menuPlan.costRange && <Title style={styles.marginTop}>Cost Estimate</Title>}
            {menuPlan.costRange && <Paragraph>{menuPlan.costRange.min} - {menuPlan.costRange.max} {menuPlan.costRange.currency}</Paragraph>}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
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
    marginBottom: 20,
  },
  loader: {
    marginVertical: 20,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    marginTop: 20,
  },
  marginTop: {
    marginTop: 10,
  }
});

export default AIMenuPlannerScreen;
