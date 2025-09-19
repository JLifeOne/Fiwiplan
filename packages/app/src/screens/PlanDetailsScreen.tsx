import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, FlatList } from 'react-native';
import { Button, Card, Title, Paragraph, Modal, Portal, TextInput, ActivityIndicator, useTheme, Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'PlanDetails'>;

interface Plan {
  id: string;
  title: string;
  description: string | null;
  startAt: string | null;
  location: string | null;
}

interface Task {
  id: string;
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

interface Budget {
  id: string;
  title: string;
  amount: number;
  category: string;
  type: 'INCOME' | 'EXPENSE';
}

interface Suggestion {
    suggestion: string;
    estimatedSaving: number;
}

const PlanDetailsScreen = ({ route, navigation }: Props) => {
  const { planId } = route.params;
  const { colors } = useTheme();
  const { api } = useAuth();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  // Task Management State
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // AI Budget Balancer State
  const [budgetBalancerModalVisible, setBudgetBalancerModalVisible] = useState(false);
  const [targetBudget, setTargetBudget] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [balancing, setBalancing] = useState(false);

  // Detailed Budgeting State
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [newBudgetItem, setNewBudgetItem] = useState({
    title: '',
    amount: '',
    category: '',
    type: 'EXPENSE' as Budget['type'],
  });


  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        setLoading(true);

        const [planData, tasksData, budgetData] = await Promise.all([
          api<Plan>(`/plans/${planId}`),
          api<Task[]>(`/tasks?planId=${planId}`),
          api<Budget[]>(`/budget?planId=${planId}`),
        ]);

        setPlan(planData ?? null);
        setTasks(tasksData ?? []);
        setBudgets(budgetData ?? []);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch plan details.';
        Alert.alert('Error', message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanDetails();
  }, [api, planId]);

  // Task Handlers...
  const handleAddTask = async () => {
    const title = newTaskTitle.trim();
    if (!title) {
      Alert.alert('Input needed', 'Please enter a task title.');
      return;
    }
    try {
      const addedTask = await api<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title,
          planId,
        }),
      });
      setTasks([...tasks, addedTask]);
      setNewTaskTitle('');
      setTaskModalVisible(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add task.';
      Alert.alert('Error', message);
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;

    const title = newTaskTitle.trim();
    if (!title) {
      Alert.alert('Input needed', 'Please enter a task title.');
      return;
    }

    try {
      const updatedTask = await api<Task>(`/tasks/${editingTask.id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, status: editingTask.status }),
      });
      setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
      setNewTaskTitle('');
      setEditingTask(null);
      setTaskModalVisible(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update task.';
      Alert.alert('Error', message);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    Alert.alert(
        "Delete Task",
        "Are you sure you want to delete this task?",
        [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                onPress: async () => {
                    try {
                        await api(`/tasks/${taskId}`, { method: 'DELETE' });
                        setTasks(tasks.filter(t => t.id !== taskId));
                    } catch (error) {
                        const message = error instanceof Error ? error.message : 'Failed to delete task.';
                        Alert.alert('Error', message);
                    }
                },
                style: "destructive",
            },
        ]
    );
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setTaskModalVisible(true);
  };

  const handleStatusChange = async (task: Task, newStatus: Task['status']) => {
    try {
        const updatedTask = await api<Task>(`/tasks/${task.id}`, {
            method: 'PUT',
            body: JSON.stringify({ title: task.title, status: newStatus }),
        });
        setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update task status.';
        Alert.alert('Error', message);
    }
  };

  // AI Budget Balancer Handler
  const handleBalanceBudget = async () => {
    if (!plan || !targetBudget) {
        Alert.alert('Input needed', 'Please enter a target budget.');
        return;
    }
    setBalancing(true);
    setSuggestions([]);
    try {
        const data = await api<{ suggestions: Suggestion[] }>('/ai/balance', {
            method: 'POST',
            body: JSON.stringify({ plan, budget: parseFloat(targetBudget) }),
        });
        setSuggestions(data?.suggestions ?? []);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get suggestions.';
        Alert.alert('Error', message);
    } finally {
        setBalancing(false);
    }
  };

  // Detailed Budgeting Handlers
  const handleAddBudget = async () => {
    const { title, amount, category, type } = newBudgetItem;
    if (!title || !amount || !category) {
      Alert.alert('Input needed', 'Please fill all budget item fields.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (Number.isNaN(parsedAmount)) {
      Alert.alert('Input needed', 'Amount must be a number.');
      return;
    }
    try {
      const addedBudget = await api<Budget>('/budget', {
        method: 'POST',
        body: JSON.stringify({ ...newBudgetItem, planId, amount: parsedAmount }),
      });
      setBudgets([...budgets, addedBudget]);
      resetBudgetModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add budget item.';
      Alert.alert('Error', message);
    }
  };

  const handleUpdateBudget = async () => {
    if (!editingBudget) return;
    const { title, amount, category, type } = newBudgetItem;
    try {
      const parsedAmount = parseFloat(amount);
      if (Number.isNaN(parsedAmount)) {
        throw new Error('Amount must be a number.');
      }
      const updatedBudget = await api<Budget>(`/budget/${editingBudget.id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, amount: parsedAmount, category, type }),
      });
      setBudgets(budgets.map(b => b.id === updatedBudget.id ? updatedBudget : b));
      resetBudgetModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update budget item.';
      Alert.alert('Error', message);
    }
  };

  const handleDeleteBudget = (budgetId: string) => {
    Alert.alert("Delete Budget Item", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            await api(`/budget/${budgetId}`, { method: 'DELETE' });
            setBudgets(budgets.filter(b => b.id !== budgetId));
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete budget item.';
            Alert.alert('Error', message);
          }
        },
        style: "destructive",
      },
    ]);
  };

  const openBudgetEditModal = (budget: Budget) => {
    setEditingBudget(budget);
    setNewBudgetItem({
        title: budget.title,
        amount: budget.amount.toString(),
        category: budget.category,
        type: budget.type,
    });
    setBudgetModalVisible(true);
  };

  const resetBudgetModal = () => {
    setEditingBudget(null);
    setNewBudgetItem({ title: '', amount: '', category: '', type: 'EXPENSE' });
    setBudgetModalVisible(false);
  };

  const totalIncome = budgets.filter(b => b.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = budgets.filter(b => b.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpenses;

  if (loading) {
    return <ActivityIndicator animating={true} color={colors.primary} style={styles.loader} size="large" />;
  }

  if (!plan) {
    return (
      <View style={styles.container}>
        <Text>Plan not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>{plan.title}</Title>
          {plan.description && <Paragraph>{plan.description}</Paragraph>}
          {plan.startAt && <Paragraph>Date: {new Date(plan.startAt).toLocaleDateString()}</Paragraph>}
          {plan.location && <Paragraph>Location: {plan.location}</Paragraph>}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Tasks</Title>
          <Button icon="plus" mode="contained-tonal" onPress={() => setTaskModalVisible(true)} style={styles.addTaskButton}>
            Add Task
          </Button>
          {tasks.length > 0 ? (
            <FlatList
              data={tasks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Card style={styles.taskCard}>
                    <Card.Content>
                        <View style={styles.taskHeader}>
                            <Text style={styles.taskTitle}>{item.title}</Text>
                            <View style={styles.taskActions}>
                                <Button icon="pencil" onPress={() => openEditModal(item)} compact>{''}</Button>
                                <Button icon="delete" onPress={() => handleDeleteTask(item.id)} compact>{''}</Button>
                            </View>
                        </View>
                        <View style={styles.statusContainer}>
                            {['PENDING', 'IN_PROGRESS', 'COMPLETED'].map(status => (
                                <Button
                                    key={status}
                                    mode={item.status === status ? 'contained' : 'outlined'}
                                    onPress={() => handleStatusChange(item, status as Task['status'])}
                                    style={styles.statusButton}
                                    labelStyle={styles.statusLabel}
                                    compact
                                >
                                    {status.replace('_', ' ')}
                                </Button>
                            ))}
                        </View>
                    </Card.Content>
                </Card>
              )}
            />
          ) : (
            <Text>No tasks for this plan yet.</Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
            <Title>Budget</Title>
            <Button icon="plus" mode="contained-tonal" onPress={() => setBudgetModalVisible(true)} style={styles.addTaskButton}>
                Add Budget Item
            </Button>
            <View style={styles.budgetSummary}>
                <Text style={[styles.summaryText, styles.incomeText]}>Income: ${totalIncome.toLocaleString()}</Text>
                <Text style={[styles.summaryText, styles.expenseText]}>Expenses: ${totalExpenses.toLocaleString()}</Text>
                <Text style={[styles.summaryText, balance >= 0 ? styles.balanceText : styles.negativeBalanceText]}>Balance: ${balance.toLocaleString()}</Text>
            </View>
            {budgets.length > 0 ? (
                <FlatList
                    data={budgets}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <Card style={styles.budgetItemCard}>
                            <Card.Content>
                                <View style={styles.budgetItemHeader}>
                                    <Text style={styles.budgetItemTitle}>{item.title} ({item.category})</Text>
                                    <Text style={item.type === 'INCOME' ? styles.incomeText : styles.expenseText}>
                                        ${item.amount.toLocaleString()}
                                    </Text>
                                </View>
                                <View style={styles.taskActions}>
                                    <Button icon="pencil" onPress={() => openBudgetEditModal(item)} compact>{''}</Button>
                                    <Button icon="delete" onPress={() => handleDeleteBudget(item.id)} compact>{''}</Button>
                                </View>
                            </Card.Content>
                        </Card>
                    )}
                />
            ) : (
                <Text>No budget items for this plan yet.</Text>
            )}
        </Card.Content>
      </Card>

      <Button
        icon="chat"
        mode="contained"
        onPress={() => navigation.navigate('Chat', { planId: plan.id, planTitle: plan.title })}
        style={styles.button}
      >
        Group Chat
      </Button>

      <Button
        icon="cash-multiple"
        mode="contained"
        onPress={() => setBudgetBalancerModalVisible(true)}
        style={styles.button}
      >
        Balance Budget with AI
      </Button>

      <Button
        icon="silverware-fork-knife"
        mode="outlined"
        onPress={() => navigation.navigate('AIMenuPlanner')}
        style={styles.button}
      >
        Plan Menu with AI
      </Button>

      <Portal>
        <Modal visible={budgetBalancerModalVisible} onDismiss={() => setBudgetBalancerModalVisible(false)} contentContainerStyle={styles.modalContainer}>
          <Title>Balance Your Budget</Title>
          <TextInput
            label="Target Budget"
            value={targetBudget}
            onChangeText={setTargetBudget}
            keyboardType="numeric"
            style={styles.input}
          />
          <Button mode="contained" onPress={handleBalanceBudget} disabled={balancing} style={styles.button}>
            {balancing ? 'Getting Suggestions...' : 'Get Suggestions'}
          </Button>
          {balancing && <ActivityIndicator animating={true} color={colors.primary} style={styles.modalLoader} />}
          {suggestions.length > 0 && (
            <FlatList
                data={suggestions}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({item}) => (
                    <Card style={styles.suggestionCard}>
                        <Paragraph>{item.suggestion}</Paragraph>
                        <Text style={{color: colors.primary}}>Saving: ${item.estimatedSaving.toLocaleString()}</Text>
                    </Card>
                )}
            />
          )}
        </Modal>
      </Portal>

      <Portal>
        <Modal
          visible={taskModalVisible}
          onDismiss={() => {
            setTaskModalVisible(false);
            setNewTaskTitle('');
            setEditingTask(null);
          }}
          contentContainerStyle={styles.modalContainer}
        >
          <Title>{editingTask ? 'Edit Task' : 'Add New Task'}</Title>
          <TextInput
            label="Task Title"
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            style={styles.input}
          />
          <Button mode="contained" onPress={editingTask ? handleUpdateTask : handleAddTask} style={styles.button}>
            {editingTask ? 'Save Changes' : 'Add Task'}
          </Button>
        </Modal>
      </Portal>

      <Portal>
        <Modal visible={budgetModalVisible} onDismiss={resetBudgetModal} contentContainerStyle={styles.modalContainer}>
            <ScrollView>
                <Title>{editingBudget ? 'Edit' : 'Add'} Budget Item</Title>
                <TextInput
                    label="Title"
                    value={newBudgetItem.title}
                    onChangeText={text => setNewBudgetItem({...newBudgetItem, title: text})}
                    style={styles.input}
                />
                <TextInput
                    label="Amount"
                    value={newBudgetItem.amount}
                    onChangeText={text => setNewBudgetItem({...newBudgetItem, amount: text})}
                    keyboardType="numeric"
                    style={styles.input}
                />
                <TextInput
                    label="Category"
                    value={newBudgetItem.category}
                    onChangeText={text => setNewBudgetItem({...newBudgetItem, category: text})}
                    style={styles.input}
                />
                <View style={styles.statusContainer}>
                    <Button
                        mode={newBudgetItem.type === 'INCOME' ? 'contained' : 'outlined'}
                        onPress={() => setNewBudgetItem({...newBudgetItem, type: 'INCOME'})}
                        style={styles.statusButton}
                    >
                        Income
                    </Button>
                    <Button
                        mode={newBudgetItem.type === 'EXPENSE' ? 'contained' : 'outlined'}
                        onPress={() => setNewBudgetItem({...newBudgetItem, type: 'EXPENSE'})}
                        style={styles.statusButton}
                    >
                        Expense
                    </Button>
                </View>
                <Button
                    mode="contained"
                    onPress={editingBudget ? handleUpdateBudget : handleAddBudget}
                    style={styles.button}
                >
                    {editingBudget ? 'Save Changes' : 'Add Item'}
                </Button>
            </ScrollView>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  button: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  addTaskButton: {
    marginVertical: 10,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    maxHeight: '80%',
  },
  input: {
    marginBottom: 10,
  },
  modalLoader: {
    marginVertical: 15,
  },
  suggestionCard: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
  },
  taskCard: {
    marginVertical: 8,
    backgroundColor: '#fefefe',
    elevation: 2,
  },
  taskTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskActions: {
    flexDirection: 'row',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statusButton: {
    marginHorizontal: 2,
    borderWidth: 1,
  },
  statusLabel: {
    fontSize: 10,
    marginHorizontal: 0,
    marginVertical: 0,
  },
  budgetSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  incomeText: {
    color: 'green',
  },
  expenseText: {
    color: 'red',
  },
  balanceText: {
    color: 'blue',
  },
  negativeBalanceText: {
    color: 'orange',
  },
  budgetItemCard: {
    marginVertical: 5,
  },
  budgetItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetItemTitle: {
    fontWeight: 'bold',
  }
});

export default PlanDetailsScreen;
