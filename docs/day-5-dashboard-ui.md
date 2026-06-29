# SmartERP Day 5 - Dashboard UI

## 1. Day 5 Objective

Day 5 creates the first frontend screen for SmartERP: a keyboard-friendly dashboard for accounting, billing, inventory, and company context.

Deliverables:

- Next.js frontend app
- Tailwind CSS setup
- Dashboard layout
- Sidebar navigation
- Company and financial year selectors
- Search and command-style header
- KPI cards
- Quick actions
- Recent activity table
- Stock watch table

## 2. Frontend Stack

- Next.js
- React
- Tailwind CSS
- Lucide React icons

## 3. Dashboard Sections

### Header

- Active company selector
- Active financial year selector
- Search input
- Refresh button
- Calculator button
- Notification button

### Sidebar

- Dashboard
- Ledgers
- Inventory
- Vouchers
- Reports
- Banking
- Settings

### KPI Cards

- Sales today
- Purchase inward
- Receivables
- Low stock

### Quick Actions

- Sales bill
- Purchase entry
- Customer
- Supplier
- Stock item
- Print invoice

### Tables

- Recent activity
- Stock watch

## 4. Local Run

From the frontend folder:

```bash
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

Backend API URL is stored in:

```text
frontend/.env
```

## 5. Recommended Day 6

Day 6 should begin connecting dashboard UI to backend data:

- Login page
- Store JWT after login
- Fetch authenticated company list
- Show selected company in dashboard
- Add frontend route protection
- Build company selection screen
