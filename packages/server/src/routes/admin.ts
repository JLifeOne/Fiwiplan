import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient, AdStatus } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to check for admin role
// In a real app, this would be more robust, checking a JWT or session.
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const { role } = req.body; // Mocking role from body for now
  if (role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden: Admins only' });
  }
  next();
};

// Get all ads pending approval
router.get('/pending', isAdmin, async (req, res) => {
  try {
    const pendingAds = await prisma.ad.findMany({
      where: { status: 'PENDING_APPROVAL' },
      include: { owner: true, demographics: true, payment: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json(pendingAds);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pending ads', error });
  }
});

// Approve or reject an ad
router.patch('/:id/status', isAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Expecting 'APPROVED' or 'REJECTED'

  if (![AdStatus.APPROVED, AdStatus.REJECTED].includes(status)) {
    return res.status(400).json({ message: 'Invalid status provided.' });
  }

  try {
    const ad = await prisma.ad.findUnique({ where: { id } });
    if (!ad || ad.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({ message: 'Ad is not pending approval.' });
    }

    const updatedAd = await prisma.ad.update({
      where: { id },
      data: { 
        status: status === 'APPROVED' ? 'ACTIVE' : 'REJECTED'
      },
    });

    // In a real app, you would send a notification to the ad owner here.

    res.json(updatedAd);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update ad status', error });
  }
});

export default router;
