CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_company_role AS ENUM ('owner', 'admin', 'accountant', 'viewer');
CREATE TYPE ledger_type AS ENUM ('customer', 'supplier', 'cash', 'bank', 'sales', 'purchase', 'tax', 'other');
CREATE TYPE balance_type AS ENUM ('debit', 'credit');
CREATE TYPE voucher_type AS ENUM ('sales', 'purchase');
CREATE TYPE voucher_status AS ENUM ('draft', 'posted', 'cancelled');
CREATE TYPE stock_movement_type AS ENUM ('opening', 'purchase_in', 'sales_out', 'adjustment_in', 'adjustment_out');

CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(120) NOT NULL,
    email varchar(255) NOT NULL UNIQUE,
    password_hash text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE companies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(160) NOT NULL,
    gstin varchar(15),
    address_line1 varchar(255),
    address_line2 varchar(255),
    city varchar(100),
    state varchar(100),
    pincode varchar(12),
    phone varchar(30),
    email varchar(255),
    base_currency varchar(3) NOT NULL DEFAULT 'INR',
    allow_negative_stock boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_companies (
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    role user_company_role NOT NULL DEFAULT 'owner',
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, company_id)
);

CREATE TABLE financial_years (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name varchar(20) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    is_active boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT financial_year_date_order CHECK (start_date < end_date),
    CONSTRAINT financial_year_unique_name UNIQUE (company_id, name)
);

CREATE TABLE ledger_groups (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
    name varchar(120) NOT NULL,
    parent_group_id uuid REFERENCES ledger_groups(id) ON DELETE SET NULL,
    is_system boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ledger_group_unique_name UNIQUE (company_id, name)
);

CREATE TABLE ledgers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    group_id uuid REFERENCES ledger_groups(id) ON DELETE SET NULL,
    ledger_type ledger_type NOT NULL,
    name varchar(160) NOT NULL,
    code varchar(40),
    gstin varchar(15),
    phone varchar(30),
    email varchar(255),
    billing_address text,
    state varchar(100),
    opening_balance numeric(14, 2) NOT NULL DEFAULT 0,
    opening_balance_type balance_type NOT NULL DEFAULT 'debit',
    credit_limit numeric(14, 2),
    credit_days integer,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ledgers_unique_name UNIQUE (company_id, name),
    CONSTRAINT ledgers_unique_code UNIQUE (company_id, code),
    CONSTRAINT ledgers_credit_days_positive CHECK (credit_days IS NULL OR credit_days >= 0)
);

CREATE TABLE units (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name varchar(40) NOT NULL,
    symbol varchar(12) NOT NULL,
    decimal_places integer NOT NULL DEFAULT 2,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT units_unique_name UNIQUE (company_id, name),
    CONSTRAINT units_decimal_places_range CHECK (decimal_places BETWEEN 0 AND 4)
);

CREATE TABLE stock_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    unit_id uuid REFERENCES units(id) ON DELETE SET NULL,
    name varchar(180) NOT NULL,
    sku varchar(80),
    hsn_sac varchar(20),
    gst_rate numeric(5, 2) NOT NULL DEFAULT 0,
    opening_quantity numeric(14, 3) NOT NULL DEFAULT 0,
    opening_value numeric(14, 2) NOT NULL DEFAULT 0,
    selling_price numeric(14, 2) NOT NULL DEFAULT 0,
    purchase_price numeric(14, 2) NOT NULL DEFAULT 0,
    reorder_level numeric(14, 3) NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT stock_items_unique_name UNIQUE (company_id, name),
    CONSTRAINT stock_items_unique_sku UNIQUE (company_id, sku),
    CONSTRAINT stock_items_gst_rate_range CHECK (gst_rate BETWEEN 0 AND 100)
);

CREATE TABLE vouchers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    financial_year_id uuid NOT NULL REFERENCES financial_years(id) ON DELETE RESTRICT,
    voucher_type voucher_type NOT NULL,
    voucher_number integer NOT NULL,
    voucher_date date NOT NULL,
    party_ledger_id uuid NOT NULL REFERENCES ledgers(id) ON DELETE RESTRICT,
    supplier_invoice_number varchar(80),
    supplier_invoice_date date,
    narration text,
    taxable_amount numeric(14, 2) NOT NULL DEFAULT 0,
    cgst_amount numeric(14, 2) NOT NULL DEFAULT 0,
    sgst_amount numeric(14, 2) NOT NULL DEFAULT 0,
    igst_amount numeric(14, 2) NOT NULL DEFAULT 0,
    discount_amount numeric(14, 2) NOT NULL DEFAULT 0,
    round_off_amount numeric(14, 2) NOT NULL DEFAULT 0,
    grand_total numeric(14, 2) NOT NULL DEFAULT 0,
    status voucher_status NOT NULL DEFAULT 'draft',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT vouchers_unique_number UNIQUE (company_id, financial_year_id, voucher_type, voucher_number)
);

CREATE TABLE voucher_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_id uuid NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
    stock_item_id uuid NOT NULL REFERENCES stock_items(id) ON DELETE RESTRICT,
    description text,
    quantity numeric(14, 3) NOT NULL,
    unit_price numeric(14, 2) NOT NULL,
    discount_percent numeric(5, 2) NOT NULL DEFAULT 0,
    discount_amount numeric(14, 2) NOT NULL DEFAULT 0,
    taxable_amount numeric(14, 2) NOT NULL DEFAULT 0,
    gst_rate numeric(5, 2) NOT NULL DEFAULT 0,
    cgst_amount numeric(14, 2) NOT NULL DEFAULT 0,
    sgst_amount numeric(14, 2) NOT NULL DEFAULT 0,
    igst_amount numeric(14, 2) NOT NULL DEFAULT 0,
    line_total numeric(14, 2) NOT NULL DEFAULT 0,
    CONSTRAINT voucher_items_quantity_positive CHECK (quantity > 0),
    CONSTRAINT voucher_items_discount_range CHECK (discount_percent BETWEEN 0 AND 100),
    CONSTRAINT voucher_items_gst_rate_range CHECK (gst_rate BETWEEN 0 AND 100)
);

CREATE TABLE ledger_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    voucher_id uuid REFERENCES vouchers(id) ON DELETE CASCADE,
    ledger_id uuid NOT NULL REFERENCES ledgers(id) ON DELETE RESTRICT,
    entry_date date NOT NULL,
    debit_amount numeric(14, 2) NOT NULL DEFAULT 0,
    credit_amount numeric(14, 2) NOT NULL DEFAULT 0,
    narration text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ledger_entries_non_negative CHECK (debit_amount >= 0 AND credit_amount >= 0),
    CONSTRAINT ledger_entries_has_amount CHECK (debit_amount > 0 OR credit_amount > 0)
);

CREATE TABLE stock_movements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    voucher_id uuid REFERENCES vouchers(id) ON DELETE CASCADE,
    voucher_item_id uuid REFERENCES voucher_items(id) ON DELETE CASCADE,
    stock_item_id uuid NOT NULL REFERENCES stock_items(id) ON DELETE RESTRICT,
    movement_date date NOT NULL,
    movement_type stock_movement_type NOT NULL,
    quantity numeric(14, 3) NOT NULL,
    unit_cost numeric(14, 2) NOT NULL DEFAULT 0,
    total_value numeric(14, 2) NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT stock_movements_quantity_positive CHECK (quantity > 0)
);

CREATE INDEX idx_user_companies_user ON user_companies(user_id, company_id);
CREATE INDEX idx_ledgers_company_type ON ledgers(company_id, ledger_type);
CREATE INDEX idx_ledgers_company_name ON ledgers(company_id, name);
CREATE INDEX idx_ledgers_company_gstin ON ledgers(company_id, gstin);
CREATE INDEX idx_stock_items_company_name ON stock_items(company_id, name);
CREATE INDEX idx_stock_items_company_sku ON stock_items(company_id, sku);
CREATE INDEX idx_vouchers_company_type_date ON vouchers(company_id, voucher_type, voucher_date);
CREATE INDEX idx_vouchers_company_number ON vouchers(company_id, financial_year_id, voucher_type, voucher_number);
CREATE INDEX idx_ledger_entries_report ON ledger_entries(company_id, ledger_id, entry_date);
CREATE INDEX idx_stock_movements_report ON stock_movements(company_id, stock_item_id, movement_date);

