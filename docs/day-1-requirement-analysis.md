# SmartERP Day 1 - Requirement Analysis

## 1. Product Summary

SmartERP is a cloud-based billing, inventory, accounting, and business management system inspired by Tally. The MVP will focus on a keyboard-first workflow for maintaining ledgers, customers, suppliers, stock items, sales bills, and purchase or indirect stock entries.

The first version should feel fast for accountants and shop operators who repeatedly enter transactions. Mouse usage is optional; core screens must support keyboard shortcuts, arrow navigation, tab flow, enter-to-select, and escape-to-go-back behavior.

## 2. MVP Scope

### In Scope For MVP

- User authentication
- Company creation and selection
- Financial year setup
- Customer ledger management
- Supplier ledger management
- Item and stock management
- Sales voucher / customer bill
- Purchase voucher / indirect stock entry
- GST fields at master and voucher level
- Basic invoice totals and tax calculation
- Stock quantity movement after sales and purchases
- Basic reports:
  - Customer ledger
  - Supplier ledger
  - Stock summary
  - Sales register
  - Purchase register
- Keyboard shortcut foundation

### Out Of Scope For MVP

- Payroll
- Manufacturing / bill of materials
- Advanced banking reconciliation
- Multi-branch stock transfer
- E-way bill and e-invoice API integration
- Advanced role permission matrix
- Mobile app
- Offline sync

## 3. Primary Users

### Business Owner

- Creates company profile
- Reviews sales, purchase, stock, and financial reports
- Manages users and access

### Accountant / Operator

- Creates customers, suppliers, and items
- Enters sales and purchase vouchers
- Prints or downloads invoices
- Reviews ledger and stock reports

### Admin

- Manages application users
- Controls company access
- Maintains master data

## 4. Core Business Entities

### Company

A company represents one business account book. One user account can manage up to five companies.

Key data:

- Company name
- GSTIN
- Address
- State
- Phone and email
- Financial year
- Base currency

### Ledger

Ledgers store accounting parties and accounts. For the MVP, ledgers will focus on customers and suppliers.

Ledger types:

- Customer
- Supplier
- Cash
- Bank
- Sales
- Purchase
- Tax

MVP priority:

- Customer ledger
- Supplier ledger

### Stock Item

Stock items represent goods sold or purchased.

Key data:

- Item name
- SKU / code
- Unit
- HSN / SAC
- GST rate
- Opening stock
- Opening value
- Selling price
- Purchase price
- Reorder level

### Voucher

A voucher records a business transaction.

MVP voucher types:

- Sales
- Purchase

Future voucher types:

- Receipt
- Payment
- Journal
- Credit note
- Debit note

## 5. Functional Requirements

### Authentication

- Users can register and log in.
- Users can securely log out.
- Sessions use JWT or Supabase authentication.
- Passwords are never stored as plain text.

### Company Management

- A user can create up to five companies.
- A user can switch active company using `F1`.
- Each company has its own ledgers, stock, vouchers, and reports.
- Financial year can be changed using `F2`.

### Customer Ledger

- Create customer ledger with shortcut `Ctrl + C` or `Alt + L`.
- Store billing address, GSTIN, state, phone, email, opening balance, and credit limit.
- Search customers by name, phone, GSTIN, or ledger code.
- View customer ledger report using `Ctrl + Shift + C`.
- Prevent duplicate ledger names within the same company.

### Supplier Ledger

- Create supplier ledger with shortcut `Ctrl + S` or `Alt + L`.
- Store GSTIN, address, state, phone, email, opening balance, and credit terms.
- Search suppliers by name, phone, GSTIN, or ledger code.
- View supplier ledger report using `Ctrl + Shift + S`.
- Prevent duplicate ledger names within the same company.

### Item / Stock

- Create stock item using `Alt + S` or `Ctrl + N`.
- Store unit, HSN / SAC, GST rate, selling price, purchase price, and opening stock.
- Show available stock before billing.
- Update stock after sales and purchases.
- Support stock report using `Ctrl + R`.
- Prevent negative stock if company setting disables it.

### Sales Voucher / Customer Bill

- Open sales voucher using `F8` or new invoice using `Ctrl + B`.
- Select customer ledger.
- Add one or more stock items.
- Calculate taxable amount, GST amount, discount, round-off, and grand total.
- Reduce stock quantities after voucher save.
- Generate invoice number automatically per company and financial year.
- Support print invoice using `Ctrl + P`.
- Support PDF download using `Ctrl + Shift + P`.

### Purchase Voucher / Indirect Stock Entry

- Open purchase voucher using `F9`.
- Select supplier ledger.
- Add one or more stock items.
- Calculate taxable amount, GST amount, discount, round-off, and grand total.
- Increase stock quantities after voucher save.
- Store supplier invoice number and supplier invoice date.

### Reports

- Customer ledger report shows opening balance, sales, payments or adjustments in future, and closing balance.
- Supplier ledger report shows opening balance, purchases, payments or adjustments in future, and closing balance.
- Stock summary shows opening quantity, inward, outward, closing quantity, and stock value.
- Sales register lists sales vouchers for selected date range.
- Purchase register lists purchase vouchers for selected date range.

## 6. Keyboard Requirements

### Global Shortcuts

- `F1`: Company selection
- `F2`: Change financial year
- `F3`: Company information
- `F4`: Calculator
- `F5`: Refresh
- `Esc`: Previous screen
- `Ctrl + Q`: Logout
- `Ctrl + H`: Home
- `Ctrl + K`: Command search

### MVP Shortcuts

- `Alt + L`: Create ledger
- `Alt + S`: Create stock item
- `F8`: Sales voucher
- `F9`: Purchase voucher
- `Ctrl + B`: New invoice
- `Ctrl + P`: Print invoice
- `Ctrl + Shift + P`: Download PDF
- `Ctrl + C`: New customer
- `Ctrl + Shift + C`: Customer ledger
- `Ctrl + S`: New supplier
- `Ctrl + Shift + S`: Supplier ledger
- `Ctrl + I`: Inventory dashboard
- `Ctrl + R`: Stock report
- `Ctrl + F`: Search
- `Arrow keys`: Navigation
- `Enter`: Select
- `Tab`: Next field
- `Shift + Tab`: Previous field

## 7. Non-Functional Requirements

### Performance

- Master search should return results in under 300 ms for normal business data volumes.
- Voucher save should complete in under 1 second for typical invoices.
- Reports should support pagination and date filters.

### Security

- All company data must be scoped by company ID.
- Users must only access companies they are authorized for.
- API endpoints must validate authentication and authorization.
- Input validation is required on both frontend and backend.

### Reliability

- Voucher creation must be transactional.
- Stock movement and accounting entries must save together.
- Failed voucher saves must not partially update stock.

### Usability

- Main workflows must be usable without a mouse.
- Form focus order must match accounting data entry habits.
- Shortcut conflicts should be avoided, especially browser-reserved shortcuts.

## 8. Recommended MVP Pages

- Login
- Company selection
- Dashboard
- Customer list
- Customer create / edit
- Supplier list
- Supplier create / edit
- Item list
- Item create / edit
- Sales voucher
- Purchase voucher
- Invoice preview
- Customer ledger report
- Supplier ledger report
- Stock summary
- Sales register
- Purchase register

## 9. Day 1 Deliverables

- Requirement analysis document
- MVP scope definition
- Entity identification
- Keyboard shortcut map
- Database design
- Initial PostgreSQL schema draft

