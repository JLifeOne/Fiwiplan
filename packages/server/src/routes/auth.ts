import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // For now, we'll just find or create the user
  // OTP logic will be added later
  try {
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({ data: { email } });
    }
    res.json({ message: 'Login successful, OTP would be sent' });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// POST /api/auth/verify
router.post('/verify', async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }
  
    // For now, we'll just validate the user exists
    // OTP validation will be added later
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      // In a real app, you'd return a JWT here
      res.json({ message: 'OTP verified successfully', userId: user.id });
    } catch (error) {
      res.status(500).json({ error: 'Something went wrong' });
    }
  });

export default router;
