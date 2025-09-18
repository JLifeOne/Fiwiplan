import { Router } from 'express';
import { generateMenuPlan, parseChat, balanceBudget } from '../services/aiService';

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

// POST /api/ai/parse-chat
router.post('/parse-chat', async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ message: 'Message is required' });
    }

    try {
        const parsedData = await parseChat(message);
        res.json(parsedData);
    } catch (error) {
        console.error('Error parsing chat:', error);
        res.status(500).json({ message: 'Failed to parse chat message' });
    }
});

// POST /api/ai/balance
router.post('/balance', async (req, res) => {
    const { plan, budget } = req.body;
    if (!plan || !budget) {
        return res.status(400).json({ message: 'Plan and budget are required' });
    }

    try {
        const suggestions = await balanceBudget(plan, budget);
        res.json(suggestions);
    } catch (error) {
        console.error('Error balancing budget:', error);
        res.status(500).json({ message: 'Failed to balance budget' });
    }
});

export default router;
