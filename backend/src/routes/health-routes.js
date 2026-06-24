import { Router } from 'express';

import { query } from '../db/pool.js';

const router = Router();

router.get('/', async (_request, response, next) => {
  try {
    const database = await query('SELECT now() AS server_time');

    response.json({
      status: 'ok',
      service: 'smarterp-api',
      databaseTime: database.rows[0].server_time
    });
  } catch (error) {
    next(error);
  }
});

export default router;
