import express from 'express';
import { authenticateToken } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = express.Router();
// GET approved ads
router.get('/', async (req, res) => {
  try {
    const ads = await prisma.ad.findMany({
      where: {
        status: 'APPROVED',
      },
      include: {
        demographics: true,
        payment: true,
        interactions: true,
        reviews: true,
        stats: true,
        _count: {
          select: {
            interactions: { where: { liked: true } },
            reviews: true,
          },
        },
      },
    });
    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch ads', error });
  }
});
// POST to like or save an ad
router.post('/:adId/interact', authenticateToken, async (req, res) => {
  const { adId } = req.params;
  const { liked, saved } = req.body;
  const userId = (req as any).user.id;
  try {
    const existingInteraction = await prisma.userAdInteraction.findUnique({
      where: {
        adId_userId: { adId, userId },
      },
    });
    let interaction;
    if (existingInteraction) {
      interaction = await prisma.userAdInteraction.update({
        where: {
          adId_userId: { adId, userId },
        },
        data: {
          liked: liked !== undefined ? liked : existingInteraction.liked,
          saved: saved !== undefined ? saved : existingInteraction.saved,
        },
      });
    } else {
      interaction = await prisma.userAdInteraction.create({
        data: {
          adId,
          userId,
          liked: liked || false,
          saved: saved || false,
        },
      });
    }
    // Update AdStat
    await prisma.adStat.upsert({
        where: { adId },
        update: {
            likes: { increment: liked ? 1 : (existingInteraction?.liked ? -1 : 0) },
            saves: { increment: saved ? 1 : (existingInteraction?.saved ? -1 : 0) },
        },
        create: {
            adId,
            likes: liked ? 1 : 0,
            saves: saved ? 1 : 0,
        }
    });
    res.status(201).json(interaction);
  } catch (error) {
    res.status(500).json({ message: 'Failed to interact with ad', error });
  }
});
// POST a review for an ad
router.post('/:adId/review', authenticateToken, async (req, res) => {
  const { adId } = req.params;
  const { rating, comment } = req.body;
  const userId = (req as any).user.id;
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }
  try {
    const review = await prisma.adReview.create({
      data: {
        adId,
        userId,
        rating,
        comment,
      },
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Failed to post review', error });
  }
});
export default router;
