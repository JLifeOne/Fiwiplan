import express from 'express';
import prisma from '../lib/prisma';

const router = express.Router();
// Get all budget items for a plan
router.get('/', async (req, res) => {
  const { planId } = req.query;
  if (!planId) {
    return res.status(400).json({ message: 'Plan ID is required' });
  }
  try {
    const budgets = await prisma.budget.findMany({
      where: { planId: String(planId) },
      orderBy: { createdAt: 'desc' },
    });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch budget items', error });
  }
});
// Create a new budget item
router.post('/', async (req, res) => {
  const { planId, title, amount, category, type } = req.body;
  if (!planId || !title || !amount || !category || !type) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    const newBudget = await prisma.budget.create({
      data: {
        planId,
        title,
        amount: parseFloat(amount),
        category,
        type,
      },
    });
    res.status(201).json(newBudget);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create budget item', error });
  }
});
// Update a budget item
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, amount, category, type } = req.body;
  try {
    const updatedBudget = await prisma.budget.update({
      where: { id },
      data: {
        title,
        amount: amount ? parseFloat(amount) : undefined,
        category,
        type,
      },
    });
    res.json(updatedBudget);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update budget item', error });
  }
});
// Delete a budget item
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.budget.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete budget item', error });
  }
});
export default router;
