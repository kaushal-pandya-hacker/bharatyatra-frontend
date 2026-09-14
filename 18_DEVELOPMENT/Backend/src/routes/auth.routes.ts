import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { z } from 'zod';
import { validateBody } from '../middleware/validate.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phoneNumber: z.string().optional()
});

router.post('/login', validateBody(loginSchema), async (req: Request, res: Response) => {
  const { email } = req.body;
  
  const token = jwt.sign(
    { id: 'usr_sample_123', email, role: 'CUSTOMER', fullName: 'Demo Traveler' },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return res.json({
    success: true,
    data: {
      token,
      user: {
        id: 'usr_sample_123',
        email,
        fullName: 'Demo Traveler',
        role: 'CUSTOMER'
      }
    }
  });
});

router.post('/register', validateBody(registerSchema), async (req: Request, res: Response) => {
  const { email, fullName } = req.body;

  const token = jwt.sign(
    { id: `usr_${Date.now()}`, email, role: 'CUSTOMER', fullName },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return res.status(201).json({
    success: true,
    data: {
      token,
      user: {
        id: `usr_${Date.now()}`,
        email,
        fullName,
        role: 'CUSTOMER'
      }
    }
  });
});

export default router;
