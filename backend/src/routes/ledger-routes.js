import { Router } from 'express';
import { z } from 'zod';

import { pool, query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);

const ledgerTypeSchema = z.enum(['customer', 'supplier']);
const balanceTypeSchema = z.enum(['debit', 'credit']);

const createLedgerSchema = z.object({
  ledgerType: ledgerTypeSchema,
  name: z.string().trim().min(2).max(160),
  code: z.string().trim().max(40).optional(),
  gstin: z.string().trim().length(15).optional(),
  phone: z.string().trim().max(30).optional(),
  email: z.string().trim().email().optional(),
  billingAddress: z.string().trim().max(1000).optional(),
  state: z.string().trim().max(100).optional(),
  openingBalance: z.coerce.number().min(0).default(0),
  openingBalanceType: balanceTypeSchema.default('debit'),
  creditLimit: z.coerce.number().min(0).optional(),
  creditDays: z.coerce.number().int().min(0).optional(),
  groupId: z.string().uuid().optional()
});

const updateLedgerSchema = createLedgerSchema
  .omit({ ledgerType: true, groupId: true })
  .partial()
  .extend({
    isActive: z.boolean().optional()
  });

function defaultGroupName(ledgerType) {
  return ledgerType === 'customer' ? 'Sundry Debtors' : 'Sundry Creditors';
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

function canManageLedger(access, response) {
  if (!access) {
    response.status(404).json({ message: 'Company not found' });
    return false;
  }

  if (!['owner', 'admin', 'accountant'].includes(access.role)) {
    response.status(403).json({ message: 'Only owners, admins, and accountants can manage ledgers' });
    return false;
  }

  return true;
}

async function getOrCreateLedgerGroup(connection, companyId, ledgerType, groupId) {
  if (groupId) {
    const groupResult = await connection.query(
      `SELECT id
       FROM ledger_groups
       WHERE id = $1 AND company_id = $2`,
      [groupId, companyId]
    );

    if (groupResult.rowCount === 0) {
      const error = new Error('Ledger group not found');
      error.statusCode = 404;
      throw error;
    }

    return groupResult.rows[0].id;
  }

  const name = defaultGroupName(ledgerType);
  const existingGroup = await connection.query(
    `SELECT id
     FROM ledger_groups
     WHERE company_id = $1 AND name = $2`,
    [companyId, name]
  );

  if (existingGroup.rowCount > 0) {
    return existingGroup.rows[0].id;
  }

  const createdGroup = await connection.query(
    `INSERT INTO ledger_groups (company_id, name, is_system)
     VALUES ($1, $2, true)
     RETURNING id`,
    [companyId, name]
  );

  return createdGroup.rows[0].id;
}

function mapLedgerPayload(payload) {
  return [
    payload.name,
    payload.code || null,
    payload.gstin || null,
    payload.phone || null,
    payload.email || null,
    payload.billingAddress || null,
    payload.state || null,
    payload.openingBalance,
    payload.openingBalanceType,
    payload.creditLimit ?? null,
    payload.creditDays ?? null
  ];
}

router.get('/', async (request, response, next) => {
  try {
    const access = await getCompanyAccess(request.user.id, request.params.companyId);

    if (!access) {
      response.status(404).json({ message: 'Company not found' });
      return;
    }

    const ledgerType = request.query.type ? ledgerTypeSchema.parse(request.query.type) : null;
    const search = request.query.search ? String(request.query.search).trim() : '';

    const result = await query(
      `SELECT
        l.id,
        l.ledger_type,
        l.name,
        l.code,
        l.gstin,
        l.phone,
        l.email,
        l.billing_address,
        l.state,
        l.opening_balance,
        l.opening_balance_type,
        l.credit_limit,
        l.credit_days,
        l.is_active,
        l.created_at,
        lg.name AS group_name
       FROM ledgers l
       LEFT JOIN ledger_groups lg ON lg.id = l.group_id
       WHERE l.company_id = $1
        AND ($2::ledger_type IS NULL OR l.ledger_type = $2)
        AND (
          $3 = ''
          OR l.name ILIKE '%' || $3 || '%'
          OR l.phone ILIKE '%' || $3 || '%'
          OR l.gstin ILIKE '%' || $3 || '%'
          OR l.code ILIKE '%' || $3 || '%'
        )
       ORDER BY l.created_at DESC`,
      [request.params.companyId, ledgerType, search]
    );

    response.json({ data: result.rows });
  } catch (error) {
    if (error instanceof z.ZodError) {
      response.status(400).json({ message: 'Validation failed', errors: error.flatten().fieldErrors });
      return;
    }

    next(error);
  }
});

router.post('/', async (request, response, next) => {
  try {
    const access = await getCompanyAccess(request.user.id, request.params.companyId);

    if (!canManageLedger(access, response)) {
      return;
    }

    const payload = createLedgerSchema.parse(request.body);
    const connection = await pool.connect();

    try {
      await connection.query('BEGIN');

      const groupId = await getOrCreateLedgerGroup(
        connection,
        request.params.companyId,
        payload.ledgerType,
        payload.groupId
      );

      const result = await connection.query(
        `INSERT INTO ledgers (
          company_id,
          group_id,
          ledger_type,
          name,
          code,
          gstin,
          phone,
          email,
          billing_address,
          state,
          opening_balance,
          opening_balance_type,
          credit_limit,
          credit_days
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id, ledger_type, name, code, gstin, phone, email, billing_address, state,
          opening_balance, opening_balance_type, credit_limit, credit_days, is_active, created_at`,
        [request.params.companyId, groupId, payload.ledgerType, ...mapLedgerPayload(payload)]
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

    if (error.code === '23505') {
      response.status(409).json({ message: 'Ledger name or code already exists for this company' });
      return;
    }

    next(error);
  }
});

router.get('/:ledgerId', async (request, response, next) => {
  try {
    const access = await getCompanyAccess(request.user.id, request.params.companyId);

    if (!access) {
      response.status(404).json({ message: 'Company not found' });
      return;
    }

    const result = await query(
      `SELECT
        l.*,
        lg.name AS group_name
       FROM ledgers l
       LEFT JOIN ledger_groups lg ON lg.id = l.group_id
       WHERE l.company_id = $1 AND l.id = $2`,
      [request.params.companyId, request.params.ledgerId]
    );

    if (result.rowCount === 0) {
      response.status(404).json({ message: 'Ledger not found' });
      return;
    }

    response.json({ data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

router.patch('/:ledgerId', async (request, response, next) => {
  try {
    const access = await getCompanyAccess(request.user.id, request.params.companyId);

    if (!canManageLedger(access, response)) {
      return;
    }

    const payload = updateLedgerSchema.parse(request.body);
    const result = await query(
      `UPDATE ledgers
       SET
        name = COALESCE($1, name),
        code = COALESCE($2, code),
        gstin = COALESCE($3, gstin),
        phone = COALESCE($4, phone),
        email = COALESCE($5, email),
        billing_address = COALESCE($6, billing_address),
        state = COALESCE($7, state),
        opening_balance = COALESCE($8, opening_balance),
        opening_balance_type = COALESCE($9, opening_balance_type),
        credit_limit = COALESCE($10, credit_limit),
        credit_days = COALESCE($11, credit_days),
        is_active = COALESCE($12, is_active),
        updated_at = now()
       WHERE company_id = $13 AND id = $14
       RETURNING id, ledger_type, name, code, gstin, phone, email, billing_address, state,
        opening_balance, opening_balance_type, credit_limit, credit_days, is_active, updated_at`,
      [
        payload.name,
        payload.code,
        payload.gstin,
        payload.phone,
        payload.email,
        payload.billingAddress,
        payload.state,
        payload.openingBalance,
        payload.openingBalanceType,
        payload.creditLimit,
        payload.creditDays,
        payload.isActive,
        request.params.companyId,
        request.params.ledgerId
      ]
    );

    if (result.rowCount === 0) {
      response.status(404).json({ message: 'Ledger not found' });
      return;
    }

    response.json({ data: result.rows[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      response.status(400).json({ message: 'Validation failed', errors: error.flatten().fieldErrors });
      return;
    }

    if (error.code === '23505') {
      response.status(409).json({ message: 'Ledger name or code already exists for this company' });
      return;
    }

    next(error);
  }
});

router.delete('/:ledgerId', async (request, response, next) => {
  try {
    const access = await getCompanyAccess(request.user.id, request.params.companyId);

    if (!canManageLedger(access, response)) {
      return;
    }

    const result = await query(
      `UPDATE ledgers
       SET is_active = false, updated_at = now()
       WHERE company_id = $1 AND id = $2
       RETURNING id`,
      [request.params.companyId, request.params.ledgerId]
    );

    if (result.rowCount === 0) {
      response.status(404).json({ message: 'Ledger not found' });
      return;
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
