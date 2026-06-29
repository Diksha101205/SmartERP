import { Router } from 'express';
import { z } from 'zod';

import { pool, query } from '../db/pool.js';
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
  email: z.string().trim().email().optional(),
  financialYear: z
    .object({
      name: z.string().trim().min(4).max(20),
      startDate: z.coerce.date(),
      endDate: z.coerce.date()
    })
    .optional()
});

const updateCompanySchema = createCompanySchema.omit({ financialYear: true }).partial();

const createFinancialYearSchema = z.object({
  name: z.string().trim().min(4).max(20),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isActive: z.boolean().default(false)
});

function toDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

function defaultFinancialYear() {
  const today = new Date();
  const year = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;

  return {
    name: `${year}-${String(year + 1).slice(2)}`,
    startDate: `${year}-04-01`,
    endDate: `${year + 1}-03-31`
  };
}

async function getCompanyAccess(userId, companyId) {
  const result = await query(
    `SELECT role
     FROM user_companies
     WHERE user_id = $1 AND company_id = $2`,
    [userId, companyId]
  );

  return result.rows[0] || null;
}

function requireCompanyManager(access, response) {
  if (!access) {
    response.status(404).json({ message: 'Company not found' });
    return false;
  }

  if (!['owner', 'admin'].includes(access.role)) {
    response.status(403).json({ message: 'Only company owners and admins can perform this action' });
    return false;
  }

  return true;
}

router.get('/', async (request, response, next) => {
  try {
    const result = await query(
      `SELECT
        c.id,
        c.name,
        c.gstin,
        c.city,
        c.state,
        c.phone,
        c.email,
        c.created_at,
        uc.role,
        fy.id AS active_financial_year_id,
        fy.name AS active_financial_year_name,
        fy.start_date AS active_financial_year_start_date,
        fy.end_date AS active_financial_year_end_date
       FROM companies c
       INNER JOIN user_companies uc ON uc.company_id = c.id
       LEFT JOIN financial_years fy ON fy.company_id = c.id AND fy.is_active = true
       WHERE uc.user_id = $1
       ORDER BY c.created_at DESC`,
      [request.user.id]
    );

    response.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (request, response, next) => {
  try {
    const payload = createCompanySchema.parse(request.body);
    const ownedCompanies = await query(
      `SELECT COUNT(*)::int AS total
       FROM user_companies
       WHERE user_id = $1 AND role = 'owner'`,
      [request.user.id]
    );

    if (ownedCompanies.rows[0].total >= 5) {
      response.status(403).json({ message: 'A user can create up to 5 companies only' });
      return;
    }

    const financialYear = payload.financialYear || defaultFinancialYear();
    const connection = await pool.connect();

    try {
      await connection.query('BEGIN');

      const companyResult = await connection.query(
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

      const company = companyResult.rows[0];

      await connection.query(
        `INSERT INTO user_companies (user_id, company_id, role)
         VALUES ($1, $2, 'owner')`,
        [request.user.id, company.id]
      );

      const financialYearResult = await connection.query(
        `INSERT INTO financial_years (company_id, name, start_date, end_date, is_active)
         VALUES ($1, $2, $3, $4, true)
         RETURNING id, name, start_date, end_date, is_active`,
        [
          company.id,
          financialYear.name,
          financialYear.startDate instanceof Date ? toDateOnly(financialYear.startDate) : financialYear.startDate,
          financialYear.endDate instanceof Date ? toDateOnly(financialYear.endDate) : financialYear.endDate
        ]
      );

      await connection.query('COMMIT');

      response.status(201).json({
        data: {
          ...company,
          role: 'owner',
          active_financial_year: financialYearResult.rows[0]
        }
      });
    } catch (error) {
      await connection.query('ROLLBACK');
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      response.status(400).json({ message: 'Validation failed', errors: error.flatten().fieldErrors });
      return;
    }

    next(error);
  }
});

router.get('/:companyId', async (request, response, next) => {
  try {
    const result = await query(
      `SELECT
        c.*,
        uc.role,
        fy.id AS active_financial_year_id,
        fy.name AS active_financial_year_name,
        fy.start_date AS active_financial_year_start_date,
        fy.end_date AS active_financial_year_end_date
       FROM companies c
       INNER JOIN user_companies uc ON uc.company_id = c.id
       LEFT JOIN financial_years fy ON fy.company_id = c.id AND fy.is_active = true
       WHERE c.id = $1 AND uc.user_id = $2`,
      [request.params.companyId, request.user.id]
    );

    if (result.rowCount === 0) {
      response.status(404).json({ message: 'Company not found' });
      return;
    }

    response.json({ data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

router.patch('/:companyId', async (request, response, next) => {
  try {
    const access = await getCompanyAccess(request.user.id, request.params.companyId);

    if (!requireCompanyManager(access, response)) {
      return;
    }

    const payload = updateCompanySchema.parse(request.body);
    const result = await query(
      `UPDATE companies
       SET
        name = COALESCE($1, name),
        gstin = COALESCE($2, gstin),
        address_line1 = COALESCE($3, address_line1),
        address_line2 = COALESCE($4, address_line2),
        city = COALESCE($5, city),
        state = COALESCE($6, state),
        pincode = COALESCE($7, pincode),
        phone = COALESCE($8, phone),
        email = COALESCE($9, email),
        updated_at = now()
       WHERE id = $10
       RETURNING id, name, gstin, address_line1, address_line2, city, state, pincode, phone, email, updated_at`,
      [
        payload.name,
        payload.gstin,
        payload.addressLine1,
        payload.addressLine2,
        payload.city,
        payload.state,
        payload.pincode,
        payload.phone,
        payload.email,
        request.params.companyId
      ]
    );

    response.json({ data: result.rows[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      response.status(400).json({ message: 'Validation failed', errors: error.flatten().fieldErrors });
      return;
    }

    next(error);
  }
});

router.delete('/:companyId', async (request, response, next) => {
  try {
    const access = await getCompanyAccess(request.user.id, request.params.companyId);

    if (!access) {
      response.status(404).json({ message: 'Company not found' });
      return;
    }

    if (access.role !== 'owner') {
      response.status(403).json({ message: 'Only company owners can delete a company' });
      return;
    }

    await query('DELETE FROM companies WHERE id = $1', [request.params.companyId]);
    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get('/:companyId/financial-years', async (request, response, next) => {
  try {
    const access = await getCompanyAccess(request.user.id, request.params.companyId);

    if (!access) {
      response.status(404).json({ message: 'Company not found' });
      return;
    }

    const result = await query(
      `SELECT id, name, start_date, end_date, is_active, created_at
       FROM financial_years
       WHERE company_id = $1
       ORDER BY start_date DESC`,
      [request.params.companyId]
    );

    response.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
});

router.post('/:companyId/financial-years', async (request, response, next) => {
  try {
    const access = await getCompanyAccess(request.user.id, request.params.companyId);

    if (!requireCompanyManager(access, response)) {
      return;
    }

    const payload = createFinancialYearSchema.parse(request.body);
    const connection = await pool.connect();

    try {
      await connection.query('BEGIN');

      if (payload.isActive) {
        await connection.query('UPDATE financial_years SET is_active = false WHERE company_id = $1', [
          request.params.companyId
        ]);
      }

      const result = await connection.query(
        `INSERT INTO financial_years (company_id, name, start_date, end_date, is_active)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, start_date, end_date, is_active, created_at`,
        [
          request.params.companyId,
          payload.name,
          toDateOnly(payload.startDate),
          toDateOnly(payload.endDate),
          payload.isActive
        ]
      );

      await connection.query('COMMIT');
      response.status(201).json({ data: result.rows[0] });
    } catch (error) {
      await connection.query('ROLLBACK');
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      response.status(400).json({ message: 'Validation failed', errors: error.flatten().fieldErrors });
      return;
    }

    next(error);
  }
});

router.patch('/:companyId/financial-years/:financialYearId/activate', async (request, response, next) => {
  try {
    const access = await getCompanyAccess(request.user.id, request.params.companyId);

    if (!requireCompanyManager(access, response)) {
      return;
    }

    const connection = await pool.connect();

    try {
      await connection.query('BEGIN');
      await connection.query('UPDATE financial_years SET is_active = false WHERE company_id = $1', [
        request.params.companyId
      ]);

      const result = await connection.query(
        `UPDATE financial_years
         SET is_active = true
         WHERE id = $1 AND company_id = $2
         RETURNING id, name, start_date, end_date, is_active`,
        [request.params.financialYearId, request.params.companyId]
      );

      if (result.rowCount === 0) {
        await connection.query('ROLLBACK');
        response.status(404).json({ message: 'Financial year not found' });
        return;
      }

      await connection.query('COMMIT');
      response.json({ data: result.rows[0] });
    } catch (error) {
      await connection.query('ROLLBACK');
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
});

export default router;
