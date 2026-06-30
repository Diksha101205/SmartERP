import {
  ArrowLeft,
  BadgePercent,
  Boxes,
  ClipboardList,
  Hash,
  Package,
  Plus,
  Ruler,
  Search,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Warehouse
} from 'lucide-react';

const summary = [
  { label: 'Stock Items', value: '248', detail: 'Active inventory masters', icon: Package },
  { label: 'Low Stock', value: '17', detail: 'Below reorder level', icon: TrendingDown },
  { label: 'Stock Value', value: 'INR 12,84,600', detail: 'At purchase value', icon: Warehouse },
  { label: 'GST Items', value: '231', detail: 'HSN/SAC mapped', icon: ShieldCheck }
];

const stockRows = [
  {
    name: 'Paracetamol 500mg',
    sku: 'MED-PCM-500',
    unit: 'Nos',
    hsn: '300490',
    gst: '12%',
    closing: '84',
    reorder: '150',
    purchase: 'INR 90.00',
    sale: 'INR 110.00',
    status: 'Low'
  },
  {
    name: 'Hand Sanitizer 500ml',
    sku: 'MED-SAN-500',
    unit: 'Nos',
    hsn: '380894',
    gst: '18%',
    closing: '38',
    reorder: '50',
    purchase: 'INR 130.00',
    sale: 'INR 160.00',
    status: 'Low'
  },
  {
    name: 'Vitamin C Tablets',
    sku: 'MED-VIT-C',
    unit: 'Strip',
    hsn: '300450',
    gst: '12%',
    closing: '112',
    reorder: '100',
    purchase: 'INR 150.00',
    sale: 'INR 190.00',
    status: 'OK'
  }
];

const units = ['Nos', 'Kg', 'Litre', 'Box', 'Strip', 'Pack'];

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

export default function StockPage() {
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
              <p className="text-sm font-semibold text-mint">Inventory Masters</p>
              <h1 className="text-2xl font-semibold tracking-normal">Stock Management</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white">
              <Plus size={18} aria-hidden="true" />
              New Item
            </button>
            <button className="flex h-10 items-center gap-2 rounded-md border border-line bg-paper px-4 text-sm font-semibold text-ink">
              <Ruler size={18} aria-hidden="true" />
              New Unit
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
              <h2 className="text-base font-semibold">Create Stock Item</h2>
            </div>
            <form className="grid gap-4 p-4">
              <Field label="Item Name">
                <Input placeholder="Paracetamol 500mg" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <Field label="SKU">
                  <Input placeholder="MED-PCM-500" />
                </Field>
                <Field label="Unit">
                  <select className="h-10 rounded-md border border-line bg-white px-3 text-sm text-ink">
                    {units.map((unit) => (
                      <option key={unit}>{unit}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="HSN / SAC">
                  <Input placeholder="300490" />
                </Field>
                <Field label="GST Rate">
                  <Input placeholder="12" />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Opening Qty">
                  <Input placeholder="100" />
                </Field>
                <Field label="Opening Value">
                  <Input placeholder="9000.00" />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Purchase Price">
                  <Input placeholder="90.00" />
                </Field>
                <Field label="Selling Price">
                  <Input placeholder="110.00" />
                </Field>
              </div>
              <Field label="Reorder Level">
                <Input placeholder="150" />
              </Field>
              <button className="mt-1 h-10 rounded-md bg-ink text-sm font-semibold text-white">Save Item</button>
            </form>
          </aside>

          <section className="overflow-hidden rounded-md border border-line bg-white shadow-panel">
            <div className="flex flex-col gap-3 border-b border-line px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-semibold">Stock Items</h2>
                <p className="mt-1 text-sm text-ink/60">Search by item name, SKU, or HSN/SAC.</p>
              </div>
              <label className="relative w-full lg:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" size={18} />
                <input
                  aria-label="Search stock"
                  className="h-10 w-full rounded-md border border-line bg-paper pl-10 pr-3 text-sm text-ink placeholder:text-ink/40"
                  placeholder="Search stock items"
                />
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse text-left text-sm">
                <thead className="bg-paper text-ink/60">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Item</th>
                    <th className="px-4 py-3 font-semibold">HSN/SAC</th>
                    <th className="px-4 py-3 font-semibold">GST</th>
                    <th className="px-4 py-3 font-semibold">Closing</th>
                    <th className="px-4 py-3 font-semibold">Reorder</th>
                    <th className="px-4 py-3 font-semibold">Purchase</th>
                    <th className="px-4 py-3 font-semibold">Sale</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stockRows.map((item) => (
                    <tr key={item.sku} className="border-t border-line">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-ink">{item.name}</p>
                        <p className="mt-1 text-xs text-ink/55">
                          {item.sku} - {item.unit}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-ink/70">
                        <span className="flex items-center gap-2">
                          <Hash size={14} aria-hidden="true" />
                          {item.hsn}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink/70">
                        <span className="flex items-center gap-2">
                          <BadgePercent size={14} aria-hidden="true" />
                          {item.gst}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold">{item.closing}</td>
                      <td className="px-4 py-3 text-ink/70">{item.reorder}</td>
                      <td className="px-4 py-3 text-ink/70">{item.purchase}</td>
                      <td className="px-4 py-3 font-semibold">{item.sale}</td>
                      <td className="px-4 py-3">
                        <span className="rounded border border-line bg-paper px-2 py-1 text-xs font-semibold text-ink/70">
                          {item.status}
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
            <Ruler className="mt-0.5 text-mint" size={18} aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">Unit Ready</p>
              <p className="mt-1 text-sm leading-6 text-ink/60">Units support decimal precision for quantity entry.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <TrendingUp className="mt-0.5 text-mint" size={18} aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">Opening Stock Ready</p>
              <p className="mt-1 text-sm leading-6 text-ink/60">Opening quantity creates the first stock movement.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <ClipboardList className="mt-0.5 text-mint" size={18} aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">Voucher Ready</p>
              <p className="mt-1 text-sm leading-6 text-ink/60">Items are ready for sales and purchase voucher lines.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
