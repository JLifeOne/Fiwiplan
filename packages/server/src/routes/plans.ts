import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/plans
router.get('/', async (req, res) => {
  // For now, we'll return all plans. In a real app, this would be user-specific.
  try {
    const plans = await prisma.plan.findMany();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// POST /api/plans
router.post('/', async (req, res) => {
  const { title, description, date, location, userId } = req.body;
  if (!title || !userId) {
    return res.status(400).json({ error: 'Title and userId are required' });
  }

  try {
    const plan = await prisma.plan.create({
      data: {
        title,
        description,
        startAt: date ? new Date(date) : null,
        location,
        ownerId: userId,
      },
    });
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;
