import { Router } from 'express';
import { z } from 'zod';

import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

const createCompanySchema = z.object({
  name: z.string().trim().min(2).max(160),
  gstin: z.string().trim().length(15).optional(),
  addressLine1: z.string().trim().max(255).optional(),
  addressLine2: z.string().trim().max(255).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  pincode: z.string().trim().max(12).optional(),
  phone: z.string().trim().max(30).optional(),
  email: z.string().trim().email().optional()
});

router.get('/', async (_request, response, next) => {
  try {
    const result = await query(
      `SELECT id, name, gstin, city, state, phone, email, created_at
       FROM companies
       ORDER BY created_at DESC`
    );

    response.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (request, response, next) => {
  try {
    const payload = createCompanySchema.parse(request.body);
    const result = await query(
      `INSERT INTO companies (
        name,
        gstin,
        address_line1,
        address_line2,
        city,
        state,
        pincode,
        phone,
        email
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, name, gstin, city, state, phone, email, created_at`,
      [
        payload.name,
        payload.gstin || null,
        payload.addressLine1 || null,
        payload.addressLine2 || null,
        payload.city || null,
        payload.state || null,
        payload.pincode || null,
        payload.phone || null,
        payload.email || null
      ]
    );

    response.status(201).json({ data: result.rows[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      response.status(400).json({ message: 'Validation failed', errors: error.flatten().fieldErrors });
      return;
    }

    next(error);
  }
});

export default router;
