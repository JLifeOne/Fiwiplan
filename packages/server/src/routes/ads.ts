import express from 'express';
import prisma from '../lib/prisma';

// In a real app, you'd use a proper file upload library like multer
// For now, we'll just simulate file attachments with string arrays.
const router = express.Router();
// Create a new Ad (as a draft)
router.post('/', async (req, res) => {
  const {
    ownerId,
    title,
    description,
    attachments,
    website,
    phoneNumber,
    address,
    category,
    subcategory,
    startAt,
    endAt,
    demographics,
  } = req.body;
  try {
    const newAd = await prisma.ad.create({
      data: {
        ownerId,
        title,
        description,
        attachments,
        website,
        phoneNumber,
        address,
        category,
        subcategory,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        status: 'DRAFT',
        demographics: demographics ? {
          create: {
            minAge: demographics.minAge,
            maxAge: demographics.maxAge,
            genders: demographics.genders,
            locations: demographics.locations,
            religions: demographics.religions,
            interests: demographics.interests,
          },
        } : undefined,
      },
      include: { demographics: true },
    });
    res.status(201).json(newAd);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create ad', error });
  }
});
// Update an Ad (only if it's a draft)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, attachments, website, phoneNumber, address, category, subcategory, startAt, endAt, demographics } = req.body;
    try {
        const ad = await prisma.ad.findUnique({ where: { id } });
        if (!ad || ad.status !== 'DRAFT') {
            return res.status(403).json({ message: 'Ad cannot be updated at its current state.' });
        }
        const updatedAd = await prisma.ad.update({
            where: { id },
            data: {
                title,
                description,
                attachments,
                website,
                phoneNumber,
                address,
                category,
                subcategory,
                startAt: startAt ? new Date(startAt) : undefined,
                endAt: endAt ? new Date(endAt) : undefined,
                demographics: demographics ? {
                    update: {
                        minAge: demographics.minAge,
                        maxAge: demographics.maxAge,
                        genders: demographics.genders,
                        locations: demographics.locations,
                        religions: demographics.religions,
                        interests: demographics.interests,
                    }
                } : undefined,
            },
            include: { demographics: true },
        });
        res.json(updatedAd);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update ad', error });
    }
});
// Submit an Ad for approval (includes payment simulation)
router.post('/:id/submit', async (req, res) => {
    const { id } = req.params;
    const { paymentMethod, amount } = req.body; // Simulate payment details
    try {
        const ad = await prisma.ad.findUnique({ where: { id } });
        if (!ad || ad.status !== 'DRAFT') {
            return res.status(400).json({ message: 'Only draft ads can be submitted.' });
        }
        // In a real app, integrate with a payment gateway like Stripe here.
        // For now, we'll just create a payment record.
        const updatedAd = await prisma.ad.update({
            where: { id },
            data: {
                status: 'PENDING_APPROVAL',
                payment: {
                    create: {
                        amount,
                        paymentMethod,
                        transactionId: `txn_${Date.now()}`, // Mock transaction ID
                        status: 'COMPLETED', // Assume payment is successful
                    },
                },
            },
            include: { payment: true },
        });
        res.json(updatedAd);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to submit ad', error });
    }
});
// Get a specific ad by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const ad = await prisma.ad.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                        profilePhoto: true,
                    },
                },
                demographics: true,
                payment: true,
                stats: true,
                reviews: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                profilePhoto: true,
                            },
                        },
                    },
                },
                likes: true,
                saves: true,
            },
        });
        if (!ad) {
            return res.status(404).json({ message: 'Ad not found' });
        }
        res.json(ad);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to get ad', error });
    }
});
// Get related ads
router.get('/:id/related', async (req, res) => {
    const { id } = req.params;
    try {
        const originalAd = await prisma.ad.findUnique({ where: { id } });
        if (!originalAd) {
            return res.status(404).json({ message: 'Original ad not found' });
        }
        const relatedAds = await prisma.ad.findMany({
            where: {
                AND: [
                    { id: { not: id } }, // Exclude the original ad
                    { status: 'ACTIVE' }, // Only show active ads
                    {
                        OR: [
                            { category: originalAd.category },
                            { subcategory: originalAd.subcategory },
                        ],
                    },
                ],
            },
            take: 10, // Limit to 10 related ads
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                        profilePhoto: true,
                    },
                },
            },
        });
        res.json(relatedAds);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to get related ads', error });
    }
});
export default router;
