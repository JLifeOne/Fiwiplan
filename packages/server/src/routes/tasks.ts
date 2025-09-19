import { Router } from 'express';
import { TaskStatus } from '@prisma/client';
import prisma from '../lib/prisma';

const router = Router();
// GET /api/tasks?planId=...
router.get('/', async (req, res) => {
  const { planId } = req.query;
  if (!planId) {
    return res.status(400).json({ error: 'planId is required' });
  }
  try {
    const tasks = await prisma.task.findMany({
      where: { planId: String(planId) },
      orderBy: { createdAt: 'asc' },
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});
// POST /api/tasks
router.post('/', async (req, res) => {
  const { title, planId, description, dueDate } = req.body;
  if (!title || !planId) {
    return res.status(400).json({ error: 'Title and planId are required' });
  }
  try {
    const task = await prisma.task.create({
      data: {
        title,
        planId,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: TaskStatus.PENDING,
      },
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});
// PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, dueDate, status } = req.body;
  try {
    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status: status as TaskStatus,
      },
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong or task not found' });
  }
});
// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.task.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong or task not found' });
  }
});
export default router;
