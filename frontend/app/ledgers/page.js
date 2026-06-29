import {
  ArrowLeft,
  Building2,
  ClipboardList,
  FileText,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  UsersRound,
  WalletCards
} from 'lucide-react';

const summary = [
  { label: 'Customers', value: '128', detail: 'Sundry Debtors', icon: UsersRound },
  { label: 'Suppliers', value: '46', detail: 'Sundry Creditors', icon: Building2 },
  { label: 'Receivable', value: 'INR 3,78,420', detail: 'Debit closing', icon: WalletCards },
  { label: 'GST Registered', value: '91', detail: 'With GSTIN', icon: ShieldCheck }
];

const ledgers = [
  {
    name: 'Aarav Medicals',
    type: 'Customer',
    code: 'CUST-001',
    gstin: '27ABCDE1234F1Z5',
    phone: '9876543210',
    balance: 'INR 48,240 Dr',
    days: '21 days',
    status: 'Active'
  },
  {
    name: 'Nexa Distributors',
    type: 'Supplier',
    code: 'SUP-014',
    gstin: '29AAFCN2345L1Z8',
    phone: '9988776655',
    balance: 'INR 86,300 Cr',
    days: '30 days',
    status: 'Active'
  },
  {
    name: 'City Super Mart',
    type: 'Customer',
    code: 'CUST-028',
    gstin: '24AACCC7788A1Z2',
    phone: '9123456789',
    balance: 'INR 9,850 Dr',
    days: '15 days',
    status: 'Draft'
  }
];

const states = ['Maharashtra', 'Gujarat', 'Karnataka', 'Delhi', 'Rajasthan'];

function Field({ label, children }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold uppercase text-ink/55">{label}</span>
      {children}
    </label>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="h-10 rounded-md border border-line bg-white px-3 text-sm text-ink placeholder:text-ink/35"
    />
  );
}

export default function LedgersPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between lg:px-6">
          <div className="flex items-center gap-3">
            <a
              href="/"
              aria-label="Back to dashboard"
              title="Back to dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-md border border-line bg-paper text-ink hover:border-mint hover:text-mint"
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </a>
            <div>
              <p className="text-sm font-semibold text-mint">Masters</p>
              <h1 className="text-2xl font-semibold tracking-normal">Ledger Management</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white">
              <Plus size={18} aria-hidden="true" />
              New Ledger
            </button>
            <button className="flex h-10 items-center gap-2 rounded-md border border-line bg-paper px-4 text-sm font-semibold text-ink">
              <FileText size={18} aria-hidden="true" />
              Ledger Report
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 lg:px-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summary.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label} className="rounded-md border border-line bg-white p-4 shadow-panel">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-ink/60">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-normal">{item.value}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-mint/25 bg-mint/10 text-mint">
                    <Icon size={20} aria-hidden="true" />
                  </div>
                </div>
                <p className="mt-4 text-sm font-medium text-ink/65">{item.detail}</p>
              </div>
            );
          })}
        </section>

        <section className="grid gap-5 xl:grid-cols-[360px_1fr]">
          <aside className="rounded-md border border-line bg-white shadow-panel">
            <div className="border-b border-line px-4 py-3">
              <h2 className="text-base font-semibold">Create Ledger</h2>
            </div>
            <form className="grid gap-4 p-4">
              <Field label="Ledger Type">
                <select className="h-10 rounded-md border border-line bg-white px-3 text-sm text-ink">
                  <option>Customer</option>
                  <option>Supplier</option>
                </select>
              </Field>
              <Field label="Name">
                <Input placeholder="Aarav Medicals" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <Field label="Code">
                  <Input placeholder="CUST-001" />
                </Field>
                <Field label="GSTIN">
                  <Input placeholder="27ABCDE1234F1Z5" />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <Field label="Phone">
                  <Input placeholder="9876543210" />
                </Field>
                <Field label="Email">
                  <Input placeholder="accounts@example.com" />
                </Field>
              </div>
              <Field label="State">
                <select className="h-10 rounded-md border border-line bg-white px-3 text-sm text-ink">
                  {states.map((state) => (
                    <option key={state}>{state}</option>
                  ))}
                </select>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Opening Balance">
                  <Input placeholder="0.00" />
                </Field>
                <Field label="Type">
                  <select className="h-10 rounded-md border border-line bg-white px-3 text-sm text-ink">
                    <option>Debit</option>
                    <option>Credit</option>
                  </select>
                </Field>
              </div>
              <button className="mt-1 h-10 rounded-md bg-ink text-sm font-semibold text-white">Save Ledger</button>
            </form>
          </aside>

          <section className="overflow-hidden rounded-md border border-line bg-white shadow-panel">
            <div className="flex flex-col gap-3 border-b border-line px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-semibold">Customer And Supplier Ledgers</h2>
                <p className="mt-1 text-sm text-ink/60">Search by name, code, phone, or GSTIN.</p>
              </div>
              <label className="relative w-full lg:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" size={18} />
                <input
                  aria-label="Search ledgers"
                  className="h-10 w-full rounded-md border border-line bg-paper pl-10 pr-3 text-sm text-ink placeholder:text-ink/40"
                  placeholder="Search ledgers"
                />
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-paper text-ink/60">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Ledger</th>
                    <th className="px-4 py-3 font-semibold">Contact</th>
                    <th className="px-4 py-3 font-semibold">GSTIN</th>
                    <th className="px-4 py-3 font-semibold">Balance</th>
                    <th className="px-4 py-3 font-semibold">Credit</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgers.map((ledger) => (
                    <tr key={ledger.code} className="border-t border-line">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-ink">{ledger.name}</p>
                        <p className="mt-1 text-xs text-ink/55">
                          {ledger.type} - {ledger.code}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-ink/70">
                        <span className="flex items-center gap-2">
                          <Phone size={14} aria-hidden="true" />
                          {ledger.phone}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink/70">{ledger.gstin}</td>
                      <td className="px-4 py-3 font-semibold">{ledger.balance}</td>
                      <td className="px-4 py-3 text-ink/70">{ledger.days}</td>
                      <td className="px-4 py-3">
                        <span className="rounded border border-line bg-paper px-2 py-1 text-xs font-semibold text-ink/70">
                          {ledger.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>

        <section className="grid gap-4 rounded-md border border-line bg-white p-4 shadow-panel md:grid-cols-3">
          <div className="flex gap-3">
            <MapPin className="mt-0.5 text-mint" size={18} aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">Address Ready</p>
              <p className="mt-1 text-sm leading-6 text-ink/60">Billing address and state fields support GST place-of-supply workflows.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Mail className="mt-0.5 text-mint" size={18} aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">Contact Ready</p>
              <p className="mt-1 text-sm leading-6 text-ink/60">Phone and email fields are structured for invoice sharing later.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <ClipboardList className="mt-0.5 text-mint" size={18} aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">Accounting Ready</p>
              <p className="mt-1 text-sm leading-6 text-ink/60">Opening balance and ledger groups map to accounting reports.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
