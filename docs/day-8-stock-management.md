# SmartERP Day 8 - Stock Management

## 1. Day 8 Objective

Day 8 adds item, unit, and stock summary management for the MVP inventory module.

Deliverables:

- Company-scoped unit APIs
- Company-scoped stock item APIs
- Opening stock movement on item creation
- Stock item search
- Stock item update
- Stock item deactivation
- Stock summary endpoint
- Stock management frontend screen

## 2. Backend Endpoints

All stock endpoints require:

```text
Authorization: Bearer jwt-token
```

### Units

```text
GET /api/companies/:companyId/stock/units
POST /api/companies/:companyId/stock/units
```

Create unit request:

```json
{
  "name": "Numbers",
  "symbol": "Nos",
  "decimalPlaces": 0
}
```

### Stock Items

```text
GET /api/companies/:companyId/stock/items
POST /api/companies/:companyId/stock/items
GET /api/companies/:companyId/stock/items/:itemId
PATCH /api/companies/:companyId/stock/items/:itemId
DELETE /api/companies/:companyId/stock/items/:itemId
```

Create item request:

```json
{
  "name": "Paracetamol 500mg",
  "sku": "MED-PCM-500",
  "unitId": "uuid",
  "hsnSac": "300490",
  "gstRate": 12,
  "openingQuantity": 100,
  "openingValue": 9000,
  "sellingPrice": 110,
  "purchasePrice": 90,
  "reorderLevel": 150
}
```

### Stock Summary

```text
GET /api/companies/:companyId/stock/summary
```

Returns active stock items with closing quantity and pricing fields.

## 3. Access Rules

- Any company member can view stock.
- Owners, admins, and accountants can create and update stock.
- Viewers cannot mutate stock.
- Unknown or inaccessible company IDs return `404`.

## 4. Inventory Rules

- Unit name is unique per company.
- Stock item name is unique per company.
- SKU is unique per company when provided.
- GST rate must be between 0 and 100.
- Opening quantity creates an `opening` stock movement.
- Delete deactivates stock items instead of permanently removing them.

## 5. Frontend Screen

Added:

```text
frontend/app/stock/page.js
```

The screen includes:

- Stock summary cards
- Create stock item form
- Unit selection
- HSN/SAC and GST fields
- Opening quantity and value
- Purchase and selling price
- Reorder level
- Stock item table

## 6. Recommended Day 9

Day 9 should focus on sales voucher / customer bill:

- Voucher number generation
- Customer selection
- Item line entry
- GST calculation
- Stock out movement
- Ledger postings
