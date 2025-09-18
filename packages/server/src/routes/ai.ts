import { Router } from 'express';
import { generateMenuPlan } from '../services/aiService';

const router = Router();

// POST /api/ai/menu
router.post('/menu', async (req, res) => {
  try {
    const menuPlan = await generateMenuPlan(req.body);
    res.json(menuPlan);
  } catch (error) {
    console.error('Error generating menu plan:', error);
    res.status(500).json({ message: 'Failed to generate menu plan' });
  }
});

export default router;
