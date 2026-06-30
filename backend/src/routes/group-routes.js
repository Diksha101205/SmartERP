import { Router } from 'express';
import { z } from 'zod';

import { pool, query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);

const defaultGroups = [
  'Sundry Debtors',
  'Sundry Creditors',
  'Sales Accounts',
  'Purchase Accounts',
  'Duties and Taxes',
  'Cash-in-Hand',
  'Bank Accounts',
  'Indirect Expenses',
  'Indirect Incomes',
  'Current Assets',
  'Current Liabilities'
];

const createGroupSchema = z.object({
  name: z.string().trim().min(2).max(120),
  parentGroupId: z.string().uuid().optional(),
  isSystem: z.boolean().default(false)
});

const updateGroupSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  parentGroupId: z.string().uuid().nullable().optional()
});

async function getCompanyAccess(userId, companyId) {
  const result = await query(
    `SELECT role
     FROM user_companies
     WHERE user_id = $1 AND company_id = $2`,
    [userId, companyId]
  );

  return result.rows[0] || null;
}

function canManageGroups(access, response) {
  if (!access) {
    response.status(404).json({ message: 'Company not found' });
    return false;
  }

  if (!['owner', 'admin', 'accountant'].includes(access.role)) {
    response.status(403).json({ message: 'Only owners, admins, and accountants can manage groups' });
    return false;
  }

  return true;
}

async function ensureParentGroup(connection, companyId, parentGroupId, currentGroupId = null) {
  if (!parentGroupId) {
    return null;
  }

  if (parentGroupId === currentGroupId) {
    const error = new Error('A group cannot be its own parent');
    error.statusCode = 400;
    throw error;
  }

  const result = await connection.query(
    `SELECT id
     FROM ledger_groups
     WHERE id = $1 AND company_id = $2`,
    [parentGroupId, companyId]
  );

  if (result.rowCount === 0) {
    const error = new Error('Parent group not found');
    error.statusCode = 404;
    throw error;
  }

  return parentGroupId;
}

router.get('/', async (request, response, next) => {
  try {
    const access = await getCompanyAccess(request.user.id, request.params.companyId);

    if (!access) {
      response.status(404).json({ message: 'Company not found' });
      return;
    }

    const search = request.query.search ? String(request.query.search).trim() : '';
    const result = await query(
      `SELECT
        g.id,
        g.name,
        g.parent_group_id,
        parent.name AS parent_group_name,
        g.is_system,
        g.created_at,
        COUNT(l.id)::int AS ledger_count
       FROM ledger_groups g
       LEFT JOIN ledger_groups parent ON parent.id = g.parent_group_id
       LEFT JOIN ledgers l ON l.group_id = g.id
       WHERE g.company_id = $1
        AND ($2 = '' OR g.name ILIKE '%' || $2 || '%')
       GROUP BY g.id, parent.name
       ORDER BY g.is_system DESC, g.name ASC`,
      [request.params.companyId, search]
    );

    response.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (request, response, next) => {
  try {
    const access = await getCompanyAccess(request.user.id, request.params.companyId);

    if (!canManageGroups(access, response)) {
      return;
    }

    const payload = createGroupSchema.parse(request.body);
    const connection = await pool.connect();

    try {
      await connection.query('BEGIN');

      const parentGroupId = await ensureParentGroup(connection, request.params.companyId, payload.parentGroupId);
      const result = await connection.query(
        `INSERT INTO ledger_groups (company_id, name, parent_group_id, is_system)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, parent_group_id, is_system, created_at`,
        [request.params.companyId, payload.name, parentGroupId, payload.isSystem]
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
      response.status(409).json({ message: 'Group name already exists for this company' });
      return;
    }

    next(error);
  }
});

router.post('/seed-defaults', async (request, response, next) => {
  try {
    const access = await getCompanyAccess(request.user.id, request.params.companyId);

    if (!canManageGroups(access, response)) {
      return;
    }

    const connection = await pool.connect();

    try {
      await connection.query('BEGIN');

      const created = [];

      for (const groupName of defaultGroups) {
        const result = await connection.query(
          `INSERT INTO ledger_groups (company_id, name, is_system)
           VALUES ($1, $2, true)
           ON CONFLICT (company_id, name) DO NOTHING
           RETURNING id, name, is_system`,
          [request.params.companyId, groupName]
        );

        if (result.rowCount > 0) {
          created.push(result.rows[0]);
        }
      }

      await connection.query('COMMIT');
      response.status(201).json({ data: created, createdCount: created.length });
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

router.get('/:groupId', async (request, response, next) => {
  try {
    const access = await getCompanyAccess(request.user.id, request.params.companyId);

    if (!access) {
      response.status(404).json({ message: 'Company not found' });
      return;
    }

    const result = await query(
      `SELECT
        g.id,
        g.name,
        g.parent_group_id,
        parent.name AS parent_group_name,
        g.is_system,
        g.created_at,
        COUNT(l.id)::int AS ledger_count
       FROM ledger_groups g
       LEFT JOIN ledger_groups parent ON parent.id = g.parent_group_id
       LEFT JOIN ledgers l ON l.group_id = g.id
       WHERE g.company_id = $1 AND g.id = $2
       GROUP BY g.id, parent.name`,
      [request.params.companyId, request.params.groupId]
    );

    if (result.rowCount === 0) {
      response.status(404).json({ message: 'Group not found' });
      return;
    }

    response.json({ data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

router.patch('/:groupId', async (request, response, next) => {
  try {
    const access = await getCompanyAccess(request.user.id, request.params.companyId);

    if (!canManageGroups(access, response)) {
      return;
    }

    const payload = updateGroupSchema.parse(request.body);
    const connection = await pool.connect();

    try {
      await connection.query('BEGIN');

      const groupResult = await connection.query(
        `SELECT id, is_system
         FROM ledger_groups
         WHERE company_id = $1 AND id = $2`,
        [request.params.companyId, request.params.groupId]
      );

      if (groupResult.rowCount === 0) {
        await connection.query('ROLLBACK');
        response.status(404).json({ message: 'Group not found' });
        return;
      }

      if (groupResult.rows[0].is_system && payload.name) {
        await connection.query('ROLLBACK');
        response.status(403).json({ message: 'System group names cannot be changed' });
        return;
      }

      const parentGroupId = await ensureParentGroup(
        connection,
        request.params.companyId,
        payload.parentGroupId,
        request.params.groupId
      );

      const result = await connection.query(
        `UPDATE ledger_groups
         SET
          name = COALESCE($1, name),
          parent_group_id = CASE WHEN $2::boolean THEN $3 ELSE parent_group_id END
         WHERE company_id = $4 AND id = $5
         RETURNING id, name, parent_group_id, is_system, created_at`,
        [
          payload.name,
          Object.prototype.hasOwnProperty.call(payload, 'parentGroupId'),
          parentGroupId,
          request.params.companyId,
          request.params.groupId
        ]
      );

      await connection.query('COMMIT');
      response.json({ data: result.rows[0] });
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
      response.status(409).json({ message: 'Group name already exists for this company' });
      return;
    }

    next(error);
  }
});

router.delete('/:groupId', async (request, response, next) => {
  try {
    const access = await getCompanyAccess(request.user.id, request.params.companyId);

    if (!canManageGroups(access, response)) {
      return;
    }

    const usage = await query(
      `SELECT
        g.is_system,
        COUNT(DISTINCT l.id)::int AS ledger_count,
        COUNT(DISTINCT child.id)::int AS child_count
       FROM ledger_groups g
       LEFT JOIN ledgers l ON l.group_id = g.id
       LEFT JOIN ledger_groups child ON child.parent_group_id = g.id
       WHERE g.company_id = $1 AND g.id = $2
       GROUP BY g.id`,
      [request.params.companyId, request.params.groupId]
    );

    if (usage.rowCount === 0) {
      response.status(404).json({ message: 'Group not found' });
      return;
    }

    const group = usage.rows[0];

    if (group.is_system) {
      response.status(403).json({ message: 'System groups cannot be deleted' });
      return;
    }

    if (group.ledger_count > 0 || group.child_count > 0) {
      response.status(409).json({ message: 'Group is in use and cannot be deleted' });
      return;
    }

    await query('DELETE FROM ledger_groups WHERE company_id = $1 AND id = $2', [
      request.params.companyId,
      request.params.groupId
    ]);

    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
