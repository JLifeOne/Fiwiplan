import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, OTP_EXPIRY_MINUTES, OTP_MAX_ATTEMPTS } from '../config/env';
import prisma from '../lib/prisma';

const router = Router();

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const buildExpiry = () => new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

const formatPhone = (phone: unknown) => String(phone ?? '').trim();
const formatOtp = (otp: unknown) => String(otp ?? '').trim();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const phone = formatPhone(req.body?.phone);

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const otp = generateOtp();
  const expiresAt = buildExpiry();

  try {
    await prisma.user.upsert({
      where: { phone },
      update: {},
      create: { phone },
    });

    await prisma.otpChallenge.upsert({
      where: { phone },
      update: {
        code: otp,
        expiresAt,
        attempts: 0,
        consumedAt: null,
      },
      create: {
        phone,
        code: otp,
        expiresAt,
      },
    });

    const response: Record<string, string> = { message: 'OTP sent to your phone number.' };
    if (process.env.NODE_ENV !== 'production') {
      response.debugOtp = otp;
      // eslint-disable-next-line no-console
      console.log('OTP for ' + phone + ': ' + otp);
    }

    return res.json(response);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to initiate login' });
  }
});

// POST /api/auth/verify
router.post('/verify', async (req, res) => {
  const phone = formatPhone(req.body?.phone);
  const otp = formatOtp(req.body?.otp);

  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone number and OTP are required' });
  }

  try {
    const challenge = await prisma.otpChallenge.findUnique({ where: { phone } });

    if (!challenge) {
      return res.status(400).json({ error: 'OTP not found. Please request a new code.' });
    }

    if (challenge.consumedAt) {
      return res.status(400).json({ error: 'OTP has already been used. Request a new code.' });
    }

    if (challenge.expiresAt < new Date()) {
      await prisma.otpChallenge.delete({ where: { phone } }).catch(() => undefined);
      return res.status(400).json({ error: 'OTP expired. Request a new code.' });
    }

    if (challenge.code !== otp) {
      const attempts = challenge.attempts + 1;
      await prisma.otpChallenge.update({
        where: { phone },
        data: { attempts },
      });

      if (attempts >= OTP_MAX_ATTEMPTS) {
        return res.status(429).json({ error: 'Too many invalid attempts. Request a new OTP.' });
      }

      return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
    }

    await prisma.otpChallenge.delete({ where: { phone } }).catch(() => undefined);

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = jwt.sign({ id: user.id, phone: user.phone }, JWT_SECRET, {
      expiresIn: '30d',
    });

    return res.json({ message: 'OTP verified successfully', token, userId: user.id });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

export default router;
