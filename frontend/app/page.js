import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  Building2,
  Calculator,
  ChevronDown,
  ClipboardList,
  Command,
  FileDown,
  FileText,
  Landmark,
  LayoutDashboard,
  Package,
  Plus,
  Printer,
  ReceiptText,
  RefreshCw,
  Search,
  Settings,
  ShoppingCart,
  UsersRound,
  WalletCards
} from 'lucide-react';

const metrics = [
  {
    label: 'Sales Today',
    value: '₹1,42,850',
    change: '+18.4%',
    tone: 'mint',
    icon: ArrowUpRight
  },
  {
    label: 'Purchase Inward',
    value: '₹86,300',
    change: '12 bills',
    tone: 'steel',
    icon: ArrowDownLeft
  },
  {
    label: 'Receivables',
    value: '₹3,78,420',
    change: '24 customers',
    tone: 'gold',
    icon: WalletCards
  },
  {
    label: 'Low Stock',
    value: '17 items',
    change: '5 critical',
    tone: 'berry',
    icon: Package
  }
];

const quickActions = [
  { label: 'Sales Bill', key: 'F8', icon: ReceiptText },
  { label: 'Purchase Entry', key: 'F9', icon: ShoppingCart },
  { label: 'Customer', key: 'Ctrl C', icon: UsersRound },
  { label: 'Supplier', key: 'Ctrl S', icon: Building2 },
  { label: 'Stock Item', key: 'Alt S', icon: Package },
  { label: 'Print Invoice', key: 'Ctrl P', icon: Printer }
];

const activity = [
  { type: 'Sales', party: 'Aarav Medicals', amount: '₹18,420', status: 'Posted' },
  { type: 'Purchase', party: 'Nexa Distributors', amount: '₹42,100', status: 'Posted' },
  { type: 'Sales', party: 'City Super Mart', amount: '₹9,850', status: 'Draft' },
  { type: 'Stock', party: 'Paracetamol 500mg', amount: '120 Nos', status: 'Low' }
];

const stockRows = [
  { item: 'Paracetamol 500mg', closing: '84 Nos', reorder: '150 Nos', value: '₹7,560' },
  { item: 'Hand Sanitizer 500ml', closing: '38 Nos', reorder: '50 Nos', value: '₹4,940' },
  { item: 'Vitamin C Tablets', closing: '112 Nos', reorder: '100 Nos', value: '₹16,800' }
];

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Ledgers', icon: ClipboardList },
  { label: 'Inventory', icon: Package },
  { label: 'Vouchers', icon: ReceiptText },
  { label: 'Reports', icon: FileText },
  { label: 'Banking', icon: Landmark },
  { label: 'Settings', icon: Settings }
];

function MetricCard({ metric }) {
  const Icon = metric.icon;
  const toneClasses = {
    mint: 'bg-mint/10 text-mint border-mint/25',
    steel: 'bg-steel/10 text-steel border-steel/25',
    gold: 'bg-gold/10 text-gold border-gold/25',
    berry: 'bg-berry/10 text-berry border-berry/25'
  };

  return (
    <section className="rounded-md border border-line bg-white p-4 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink/60">{metric.label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-normal text-ink">{metric.value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-md border ${toneClasses[metric.tone]}`}>
          <Icon size={20} aria-hidden="true" />
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-ink/70">{metric.change}</p>
    </section>
  );
}

function IconButton({ label, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="flex h-10 w-10 items-center justify-center rounded-md border border-line bg-white text-ink shadow-panel transition hover:border-mint hover:text-mint"
    >
      {children}
    </button>
  );
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-paper">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[248px_1fr]">
        <aside className="border-b border-line bg-ink text-white lg:border-b-0 lg:border-r">
          <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-mint text-white">
              <Building2 size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-base font-semibold">SmartERP</p>
              <p className="text-xs text-white/60">Demo Traders</p>
            </div>
          </div>

          <nav className="grid gap-1 p-3">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  type="button"
                  className={`flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition ${
                    item.active ? 'bg-white text-ink' : 'text-white/72 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0">
          <header className="flex min-h-16 flex-col gap-3 border-b border-line bg-white px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-6">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="flex h-10 items-center gap-2 rounded-md border border-line bg-paper px-3 text-sm font-semibold text-ink"
              >
                <Building2 size={17} aria-hidden="true" />
                Demo Traders
                <ChevronDown size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="flex h-10 items-center gap-2 rounded-md border border-line bg-paper px-3 text-sm font-semibold text-ink"
              >
                FY 2026-27
                <ChevronDown size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="relative min-w-0 flex-1 lg:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" size={18} />
                <input
                  aria-label="Search"
                  className="h-10 w-full rounded-md border border-line bg-paper pl-10 pr-10 text-sm text-ink placeholder:text-ink/40"
                  placeholder="Search ledgers, stock, vouchers"
                />
                <Command className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/40" size={16} />
              </label>
              <IconButton label="Refresh">
                <RefreshCw size={18} aria-hidden="true" />
              </IconButton>
              <IconButton label="Calculator">
                <Calculator size={18} aria-hidden="true" />
              </IconButton>
              <IconButton label="Notifications">
                <Bell size={18} aria-hidden="true" />
              </IconButton>
            </div>
          </header>

          <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 lg:px-6">
            <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold text-mint">Company Dashboard</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">Accounts, billing, and stock</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">
                  Monitor today&apos;s business position and jump into the next accounting entry.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white">
                  <Plus size={18} aria-hidden="true" />
                  New Voucher
                </button>
                <button className="flex h-10 items-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink shadow-panel">
                  <FileDown size={18} aria-hidden="true" />
                  Export
                </button>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <MetricCard key={metric.label} metric={metric} />
              ))}
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-md border border-line bg-white shadow-panel">
                <div className="flex items-center justify-between border-b border-line px-4 py-3">
                  <h2 className="text-base font-semibold text-ink">Quick Actions</h2>
                  <span className="text-sm font-medium text-ink/55">Keyboard ready</span>
                </div>
                <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
                  {quickActions.map((action) => {
                    const Icon = action.icon;

                    return (
                      <button
                        key={action.label}
                        type="button"
                        className="flex min-h-20 items-center justify-between gap-3 rounded-md border border-line bg-paper p-3 text-left transition hover:border-mint hover:bg-mint/5"
                      >
                        <span className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-mint shadow-panel">
                            <Icon size={19} aria-hidden="true" />
                          </span>
                          <span className="text-sm font-semibold text-ink">{action.label}</span>
                        </span>
                        <kbd className="rounded border border-line bg-white px-2 py-1 text-xs font-semibold text-ink/60">
                          {action.key}
                        </kbd>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-md border border-line bg-white shadow-panel">
                <div className="border-b border-line px-4 py-3">
                  <h2 className="text-base font-semibold text-ink">Cash And Bank</h2>
                </div>
                <div className="grid gap-3 p-4">
                  <div className="rounded-md border border-line bg-paper p-4">
                    <p className="text-sm font-medium text-ink/60">Cash-in-hand</p>
                    <p className="mt-2 text-2xl font-semibold text-ink">₹64,220</p>
                  </div>
                  <div className="rounded-md border border-line bg-paper p-4">
                    <p className="text-sm font-medium text-ink/60">Bank balance</p>
                    <p className="mt-2 text-2xl font-semibold text-ink">₹8,92,140</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="h-10 rounded-md border border-line bg-white text-sm font-semibold text-ink">
                      Receipt
                    </button>
                    <button className="h-10 rounded-md border border-line bg-white text-sm font-semibold text-ink">
                      Payment
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
              <div className="overflow-hidden rounded-md border border-line bg-white shadow-panel">
                <div className="flex items-center justify-between border-b border-line px-4 py-3">
                  <h2 className="text-base font-semibold text-ink">Recent Activity</h2>
                  <button className="text-sm font-semibold text-mint">View all</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                    <thead className="bg-paper text-ink/60">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Type</th>
                        <th className="px-4 py-3 font-semibold">Ledger / Item</th>
                        <th className="px-4 py-3 font-semibold">Amount</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activity.map((row) => (
                        <tr key={`${row.type}-${row.party}`} className="border-t border-line">
                          <td className="px-4 py-3 font-medium text-ink">{row.type}</td>
                          <td className="px-4 py-3 text-ink/70">{row.party}</td>
                          <td className="px-4 py-3 font-semibold text-ink">{row.amount}</td>
                          <td className="px-4 py-3">
                            <span className="rounded border border-line bg-paper px-2 py-1 text-xs font-semibold text-ink/70">
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="overflow-hidden rounded-md border border-line bg-white shadow-panel">
                <div className="flex items-center justify-between border-b border-line px-4 py-3">
                  <h2 className="text-base font-semibold text-ink">Stock Watch</h2>
                  <button className="text-sm font-semibold text-mint">Summary</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                    <thead className="bg-paper text-ink/60">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Item</th>
                        <th className="px-4 py-3 font-semibold">Closing</th>
                        <th className="px-4 py-3 font-semibold">Reorder</th>
                        <th className="px-4 py-3 font-semibold">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockRows.map((row) => (
                        <tr key={row.item} className="border-t border-line">
                          <td className="px-4 py-3 font-medium text-ink">{row.item}</td>
                          <td className="px-4 py-3 text-ink/70">{row.closing}</td>
                          <td className="px-4 py-3 text-ink/70">{row.reorder}</td>
                          <td className="px-4 py-3 font-semibold text-ink">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
