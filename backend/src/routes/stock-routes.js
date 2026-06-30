import { Router } from 'express';
import { z } from 'zod';

import { pool, query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);

const createUnitSchema = z.object({
  name: z.string().trim().min(1).max(40),
  symbol: z.string().trim().min(1).max(12),
  decimalPlaces: z.coerce.number().int().min(0).max(4).default(2)
});

const createStockItemSchema = z.object({
  name: z.string().trim().min(2).max(180),
  sku: z.string().trim().max(80).optional(),
  unitId: z.string().uuid().optional(),
  hsnSac: z.string().trim().max(20).optional(),
  gstRate: z.coerce.number().min(0).max(100).default(0),
  openingQuantity: z.coerce.number().min(0).default(0),
  openingValue: z.coerce.number().min(0).default(0),
  sellingPrice: z.coerce.number().min(0).default(0),
  purchasePrice: z.coerce.number().min(0).default(0),
  reorderLevel: z.coerce.number().min(0).default(0)
});

const updateStockItemSchema = createStockItemSchema.partial().extend({
  isActive: z.boolean().optional()
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

function canManageStock(access, response) {
  if (!access) {
    response.status(404).json({ message: 'Company not found' });
    return false;
  }

  if (!['owner', 'admin', 'accountant'].includes(access.role)) {
    response.status(403).json({ message: 'Only owners, admins, and accountants can manage stock' });
    return false;
  }

  return true;
}

async function ensureUnit(connection, companyId, unitId) {
  if (!unitId) {
    return null;
  }

  const result = await connection.query('SELECT id FROM units WHERE id = $1 AND company_id = $2', [unitId, companyId]);

  if (result.rowCount === 0) {
    const error = new Error('Unit not found');
    error.statusCode = 404;
    throw error;
  }

  return unitId;
}

router.get('/units', async (request, response, next) => {
  try {
    const access = await getCompanyAccess(request.user.id, request.params.companyId);

    if (!access) {
      response.status(404).json({ message: 'Company not found' });
      return;
    }

    const result = await query(
      `SELECT id, name, symbol, decimal_places, created_at
       FROM units
       WHERE company_id = $1
       ORDER BY name ASC`,
      [request.params.companyId]
    );

    response.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
});

router.post('/units', async (request, response, next) => {
  try {
    const access = await getCompanyAccess(request.user.id, request.params.companyId);

    if (!canManageStock(access, response)) {
      return;
    }

    const payload = createUnitSchema.parse(request.body);
    const result = await query(
      `INSERT INTO units (company_id, name, symbol, decimal_places)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, symbol, decimal_places, created_at`,
      [request.params.companyId, payload.name, payload.symbol, payload.decimalPlaces]
    );

    response.status(201).json({ data: result.rows[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      response.status(400).json({ message: 'Validation failed', errors: error.flatten().fieldErrors });
      return;
    }

    if (error.code === '23505') {
      response.status(409).json({ message: 'Unit name already exists for this company' });
      return;
    }

    next(error);
  }
});

router.get('/items', async (request, response, next) => {
  try {
    const access = await getCompanyAccess(request.user.id, request.params.companyId);

    if (!access) {
      response.status(404).json({ message: 'Company not found' });
      return;
    }

    const search = request.query.search ? String(request.query.search).trim() : '';
    const activeOnly = request.query.activeOnly === 'true';
    const result = await query(
      `SELECT
        si.id,
        si.name,
        si.sku,
        si.hsn_sac,
        si.gst_rate,
        si.opening_quantity,
        si.opening_value,
        si.selling_price,
        si.purchase_price,
        si.reorder_level,
        si.is_active,
        si.created_at,
        u.name AS unit_name,
        u.symbol AS unit_symbol,
        COALESCE(SUM(CASE WHEN sm.movement_type IN ('opening', 'purchase_in', 'adjustment_in') THEN sm.quantity ELSE 0 END), 0) AS inward_quantity,
        COALESCE(SUM(CASE WHEN sm.movement_type IN ('sales_out', 'adjustment_out') THEN sm.quantity ELSE 0 END), 0) AS outward_quantity
       FROM stock_items si
       LEFT JOIN units u ON u.id = si.unit_id
       LEFT JOIN stock_movements sm ON sm.stock_item_id = si.id
       WHERE si.company_id = $1
        AND ($2 = '' OR si.name ILIKE '%' || $2 || '%' OR si.sku ILIKE '%' || $2 || '%' OR si.hsn_sac ILIKE '%' || $2 || '%')
        AND ($3::boolean = false OR si.is_active = true)
       GROUP BY si.id, u.name, u.symbol
       ORDER BY si.created_at DESC`,
      [request.params.companyId, search, activeOnly]
    );

    response.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
});

router.post('/items', async (request, response, next) => {
  try {
    const access = await getCompanyAccess(request.user.id, request.params.companyId);

    if (!canManageStock(access, response)) {
      return;
    }

    const payload = createStockItemSchema.parse(request.body);
    const connection = await pool.connect();

    try {
      await connection.query('BEGIN');

      const unitId = await ensureUnit(connection, request.params.companyId, payload.unitId);
      const result = await connection.query(
        `INSERT INTO stock_items (
          company_id,
          unit_id,
          name,
          sku,
          hsn_sac,
          gst_rate,
          opening_quantity,
          opening_value,
          selling_price,
          purchase_price,
          reorder_level
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, name, sku, hsn_sac, gst_rate, opening_quantity, opening_value,
          selling_price, purchase_price, reorder_level, is_active, created_at`,
        [
          request.params.companyId,
          unitId,
          payload.name,
          payload.sku || null,
          payload.hsnSac || null,
          payload.gstRate,
          payload.openingQuantity,
          payload.openingValue,
          payload.sellingPrice,
          payload.purchasePrice,
          payload.reorderLevel
        ]
      );

      const stockItem = result.rows[0];

      if (payload.openingQuantity > 0) {
        await connection.query(
          `INSERT INTO stock_movements (
            company_id,
            stock_item_id,
            movement_date,
            movement_type,
            quantity,
            unit_cost,
            total_value
          )
          VALUES ($1, $2, CURRENT_DATE, 'opening', $3, $4, $5)`,
          [
            request.params.companyId,
            stockItem.id,
            payload.openingQuantity,
            payload.openingQuantity > 0 ? payload.openingValue / payload.openingQuantity : 0,
            payload.openingValue
          ]
        );
      }

      await connection.query('COMMIT');
      response.status(201).json({ data: stockItem });
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
      response.status(409).json({ message: 'Stock item name or SKU already exists for this company' });
      return;
    }

    next(error);
  }
});

router.get('/items/:itemId', async (request, response, next) => {
  try {
    const access = await getCompanyAccess(request.user.id, request.params.companyId);

    if (!access) {
      response.status(404).json({ message: 'Company not found' });
      return;
    }

    const result = await query(
      `SELECT si.*, u.name AS unit_name, u.symbol AS unit_symbol
       FROM stock_items si
       LEFT JOIN units u ON u.id = si.unit_id
       WHERE si.company_id = $1 AND si.id = $2`,
      [request.params.companyId, request.params.itemId]
    );

    if (result.rowCount === 0) {
      response.status(404).json({ message: 'Stock item not found' });
      return;
    }

    response.json({ data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

router.patch('/items/:itemId', async (request, response, next) => {
  try {
    const access = await getCompanyAccess(request.user.id, request.params.companyId);

    if (!canManageStock(access, response)) {
      return;
    }

    const payload = updateStockItemSchema.parse(request.body);
    const connection = await pool.connect();

    try {
      await connection.query('BEGIN');
      const unitId = await ensureUnit(connection, request.params.companyId, payload.unitId);
      const result = await connection.query(
        `UPDATE stock_items
         SET
          unit_id = CASE WHEN $1::boolean THEN $2 ELSE unit_id END,
          name = COALESCE($3, name),
          sku = COALESCE($4, sku),
          hsn_sac = COALESCE($5, hsn_sac),
          gst_rate = COALESCE($6, gst_rate),
          selling_price = COALESCE($7, selling_price),
          purchase_price = COALESCE($8, purchase_price),
          reorder_level = COALESCE($9, reorder_level),
          is_active = COALESCE($10, is_active),
          updated_at = now()
         WHERE company_id = $11 AND id = $12
         RETURNING id, name, sku, hsn_sac, gst_rate, selling_price, purchase_price,
          reorder_level, is_active, updated_at`,
        [
          Object.prototype.hasOwnProperty.call(payload, 'unitId'),
          unitId,
          payload.name,
          payload.sku,
          payload.hsnSac,
          payload.gstRate,
          payload.sellingPrice,
          payload.purchasePrice,
          payload.reorderLevel,
          payload.isActive,
          request.params.companyId,
          request.params.itemId
        ]
      );

      if (result.rowCount === 0) {
        await connection.query('ROLLBACK');
        response.status(404).json({ message: 'Stock item not found' });
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
    if (error instanceof z.ZodError) {
      response.status(400).json({ message: 'Validation failed', errors: error.flatten().fieldErrors });
      return;
    }

    if (error.code === '23505') {
      response.status(409).json({ message: 'Stock item name or SKU already exists for this company' });
      return;
    }

    next(error);
  }
});

router.delete('/items/:itemId', async (request, response, next) => {
  try {
    const access = await getCompanyAccess(request.user.id, request.params.companyId);

    if (!canManageStock(access, response)) {
      return;
    }

    const result = await query(
      `UPDATE stock_items
       SET is_active = false, updated_at = now()
       WHERE company_id = $1 AND id = $2
       RETURNING id`,
      [request.params.companyId, request.params.itemId]
    );

    if (result.rowCount === 0) {
      response.status(404).json({ message: 'Stock item not found' });
      return;
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get('/summary', async (request, response, next) => {
  try {
    const access = await getCompanyAccess(request.user.id, request.params.companyId);

    if (!access) {
      response.status(404).json({ message: 'Company not found' });
      return;
    }

    const result = await query(
      `SELECT
        si.id,
        si.name,
        si.sku,
        si.reorder_level,
        u.symbol AS unit_symbol,
        si.opening_quantity
          + COALESCE(SUM(CASE WHEN sm.movement_type IN ('purchase_in', 'adjustment_in') THEN sm.quantity ELSE 0 END), 0)
          - COALESCE(SUM(CASE WHEN sm.movement_type IN ('sales_out', 'adjustment_out') THEN sm.quantity ELSE 0 END), 0)
          AS closing_quantity,
        si.purchase_price,
        si.selling_price
       FROM stock_items si
       LEFT JOIN units u ON u.id = si.unit_id
       LEFT JOIN stock_movements sm ON sm.stock_item_id = si.id
       WHERE si.company_id = $1 AND si.is_active = true
       GROUP BY si.id, u.symbol
       ORDER BY si.name ASC`,
      [request.params.companyId]
    );

    response.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
});

export default router;
