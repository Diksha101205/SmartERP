import {
  ArrowLeft,
  BadgeCheck,
  Boxes,
  Building2,
  CircleDollarSign,
  ClipboardList,
  Landmark,
  Layers3,
  Plus,
  Search,
  Shield,
  TreePine,
  UsersRound,
  WalletCards
} from 'lucide-react';

const summary = [
  { label: 'System Groups', value: '11', detail: 'Default accounting heads', icon: Shield },
  { label: 'Custom Groups', value: '6', detail: 'Company-specific heads', icon: Layers3 },
  { label: 'Mapped Ledgers', value: '174', detail: 'Customers and suppliers', icon: ClipboardList },
  { label: 'Parent Groups', value: '8', detail: 'Reporting hierarchy', icon: TreePine }
];

const groupRows = [
  {
    name: 'Sundry Debtors',
    parent: 'Current Assets',
    ledgers: 128,
    nature: 'Asset',
    type: 'System',
    icon: UsersRound
  },
  {
    name: 'Sundry Creditors',
    parent: 'Current Liabilities',
    ledgers: 46,
    nature: 'Liability',
    type: 'System',
    icon: Building2
  },
  {
    name: 'Sales Accounts',
    parent: 'Direct Income',
    ledgers: 3,
    nature: 'Income',
    type: 'System',
    icon: CircleDollarSign
  },
  {
    name: 'Purchase Accounts',
    parent: 'Direct Expenses',
    ledgers: 4,
    nature: 'Expense',
    type: 'System',
    icon: Boxes
  },
  {
    name: 'Bank Accounts',
    parent: 'Current Assets',
    ledgers: 2,
    nature: 'Asset',
    type: 'System',
    icon: Landmark
  }
];

const defaultGroups = [
  'Sundry Debtors',
  'Sundry Creditors',
  'Sales Accounts',
  'Purchase Accounts',
  'Duties and Taxes',
  'Cash-in-Hand',
  'Bank Accounts'
];

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

export default function GroupsPage() {
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
              <p className="text-sm font-semibold text-mint">Accounting Masters</p>
              <h1 className="text-2xl font-semibold tracking-normal">Group Management</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white">
              <Plus size={18} aria-hidden="true" />
              New Group
            </button>
            <button className="flex h-10 items-center gap-2 rounded-md border border-line bg-paper px-4 text-sm font-semibold text-ink">
              <BadgeCheck size={18} aria-hidden="true" />
              Seed Defaults
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
              <h2 className="text-base font-semibold">Create Group</h2>
            </div>
            <form className="grid gap-4 p-4">
              <Field label="Group Name">
                <Input placeholder="Transport Expenses" />
              </Field>
              <Field label="Parent Group">
                <select className="h-10 rounded-md border border-line bg-white px-3 text-sm text-ink">
                  <option>No parent</option>
                  <option>Sundry Debtors</option>
                  <option>Sundry Creditors</option>
                  <option>Current Assets</option>
                  <option>Indirect Expenses</option>
                </select>
              </Field>
              <Field label="Group Type">
                <select className="h-10 rounded-md border border-line bg-white px-3 text-sm text-ink">
                  <option>Custom</option>
                  <option>System</option>
                </select>
              </Field>
              <button className="mt-1 h-10 rounded-md bg-ink text-sm font-semibold text-white">Save Group</button>
            </form>

            <div className="border-t border-line p-4">
              <p className="text-sm font-semibold">Default Groups</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {defaultGroups.map((group) => (
                  <span key={group} className="rounded border border-line bg-paper px-2 py-1 text-xs font-semibold text-ink/70">
                    {group}
                  </span>
                ))}
              </div>
            </div>
          </aside>

          <section className="overflow-hidden rounded-md border border-line bg-white shadow-panel">
            <div className="flex flex-col gap-3 border-b border-line px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-semibold">Ledger Groups</h2>
                <p className="mt-1 text-sm text-ink/60">Maintain accounting classification for reports and vouchers.</p>
              </div>
              <label className="relative w-full lg:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" size={18} />
                <input
                  aria-label="Search groups"
                  className="h-10 w-full rounded-md border border-line bg-paper pl-10 pr-3 text-sm text-ink placeholder:text-ink/40"
                  placeholder="Search groups"
                />
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-paper text-ink/60">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Group</th>
                    <th className="px-4 py-3 font-semibold">Parent</th>
                    <th className="px-4 py-3 font-semibold">Nature</th>
                    <th className="px-4 py-3 font-semibold">Ledgers</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {groupRows.map((group) => {
                    const Icon = group.icon;

                    return (
                      <tr key={group.name} className="border-t border-line">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-mint/10 text-mint">
                              <Icon size={18} aria-hidden="true" />
                            </span>
                            <span className="font-semibold text-ink">{group.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-ink/70">{group.parent}</td>
                        <td className="px-4 py-3 text-ink/70">{group.nature}</td>
                        <td className="px-4 py-3 font-semibold">{group.ledgers}</td>
                        <td className="px-4 py-3">
                          <span className="rounded border border-line bg-paper px-2 py-1 text-xs font-semibold text-ink/70">
                            {group.type}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
