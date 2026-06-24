import jwt from 'jsonwebtoken';

import { config } from '../config/env.js';
import { query } from '../db/pool.js';

export async function requireAuth(request, response, next) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      response.status(401).json({ message: 'Authentication token required' });
      return;
    }

    const token = authHeader.slice('Bearer '.length);
    const payload = jwt.verify(token, config.jwtSecret);

    const result = await query(
      `SELECT id, name, email, created_at
       FROM users
       WHERE id = $1`,
      [payload.sub]
    );

    if (result.rowCount === 0) {
      response.status(401).json({ message: 'User not found' });
      return;
    }

    request.user = result.rows[0];
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      response.status(401).json({ message: 'Invalid or expired token' });
      return;
    }

    next(error);
  }
}
