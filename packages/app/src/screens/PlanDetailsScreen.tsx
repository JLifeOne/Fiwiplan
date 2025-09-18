import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'PlanDetails'>;

const PlanDetailsScreen = ({ navigation }: Props) => {
  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('AIMenuPlanner')}
        style={styles.button}
      >
        AI Menu Planner
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    margin: 20,
  },
});

export default PlanDetailsScreen;
