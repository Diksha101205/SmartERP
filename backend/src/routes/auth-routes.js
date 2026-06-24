import bcrypt from 'bcryptjs';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { config } from '../config/env.js';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255).transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(72)
});

const loginSchema = z.object({
  email: z.string().trim().email().max(255).transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(72)
});

function signToken(userId) {
  return jwt.sign({}, config.jwtSecret, {
    subject: userId,
    expiresIn: config.jwtExpiresIn
  });
}

function userResponse(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.created_at
  };
}

router.post('/register', async (request, response, next) => {
  try {
    const payload = registerSchema.parse(request.body);
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [payload.email]);

    if (existingUser.rowCount > 0) {
      response.status(409).json({ message: 'Email is already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);
    const result = await query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [payload.name, payload.email, passwordHash]
    );

    const user = result.rows[0];

    response.status(201).json({
      data: {
        user: userResponse(user),
        token: signToken(user.id)
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      response.status(400).json({ message: 'Validation failed', errors: error.flatten().fieldErrors });
      return;
    }

    next(error);
  }
});

router.post('/login', async (request, response, next) => {
  try {
    const payload = loginSchema.parse(request.body);
    const result = await query(
      `SELECT id, name, email, password_hash, created_at
       FROM users
       WHERE email = $1`,
      [payload.email]
    );

    if (result.rowCount === 0) {
      response.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(payload.password, user.password_hash);

    if (!isPasswordValid) {
      response.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    response.json({
      data: {
        user: userResponse(user),
        token: signToken(user.id)
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      response.status(400).json({ message: 'Validation failed', errors: error.flatten().fieldErrors });
      return;
    }

    next(error);
  }
});

router.get('/me', requireAuth, (request, response) => {
  response.json({ data: { user: userResponse(request.user) } });
});

export default router;
