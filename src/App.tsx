import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from "react";

type Tab = "requests" | "orders" | "orderList" | "items" | "settings" | "inbox" | "more";
type IconName =
  | "home"
  | "file"
  | "cart"
  | "inbox"
  | "grid"
  | "search"
  | "bell"
  | "next"
  | "plus"
  | "check"
  | "box"
  | "sheet"
  | "chart"
  | "settings"
  | "help"
  | "logout"
  | "eye"
  | "shield"
  | "server"
  | "user"
  | "lock"
  | "building"
  | "refresh"
  | "calendar";

const icons: Record<IconName, string[]> = {
  home: ["M3 11l9-8 9 8", "M5 10v10h14V10M9 20v-6h6v6"],
  file: ["M6 2h8l4 4v16H6z", "M14 2v5h5M9 12h6M9 16h4"],
  cart: ["M3 4h2l2.2 10h10.6l2-7H6", "M9 19h.01M17 19h.01"],
  inbox: ["M4 4h16v15H4z", "M4 13l4-4h8l4 4M8 13l2 3h4l2-3"],
  grid: ["M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"],
  search: ["M18 11a7 7 0 11-14 0 7 7 0 0114 0z", "M20 20l-4-4"],
  bell: ["M18 8a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"],
  next: ["M9 18l6-6-6-6"],
  plus: ["M12 5v14M5 12h14"],
  check: ["M5 12l4 4L19 6"],
  box: ["M4 7l8-4 8 4v10l-8 4-8-4z", "M4 7l8 4 8-4M12 11v10"],
  sheet: ["M5 4h14v17H5z", "M9 4V2h6v2M9 10h6M9 14h6M9 18h4"],
  chart: ["M4 20V10M10 20V4M16 20v-7M22 20H2"],
  settings: [
    "M12 8a4 4 0 100 8 4 4 0 000-8z",
    "M4 12H2m20 0h-2M12 4V2m0 20v-2M6.3 6.3L4.9 4.9m14.2 14.2l-1.4-1.4M17.7 6.3l1.4-1.4M4.9 19.1l1.4-1.4",
  ],
  help: [
    "M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    "M9.8 9a2.3 2.3 0 113.7 1.8c-1 .7-1.5 1.1-1.5 2.2M12 17h.01",
  ],
  logout: ["M10 4H4v16h6M14 8l4 4-4 4M8 12h10"],
  eye: [
    "M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z",
    "M14.5 12a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z",
  ],
  shield: ["M12 2L4.5 5v6c0 5 3.2 8.5 7.5 11 4.3-2.5 7.5-6 7.5-11V5z", "M9 12l2 2 4-5"],
  server: ["M3 4h18v6H3zM3 14h18v6H3z", "M7 7h.01M7 17h.01"],
  user: ["M16 8a4 4 0 11-8 0 4 4 0 018 0z", "M4 21a8 8 0 0116 0"],
  lock: ["M4 10h16v11H4z", "M8 10V7a4 4 0 018 0v3"],
  building: ["M4 21V5l8-3 8 3v16M8 8h2M14 8h2M8 12h2M14 12h2M9 21v-5h6v5"],
  refresh: ["M20 7V3l-2 2a8 8 0 101.5 9", "M20 3h-4"],
  calendar: ["M5 3v3M19 3v3M3 9h18", "M4 5h16v16H4z"],
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {icons[name].map((d, i) => (
        <path d={d} key={i} />
      ))}
    </svg>
  );
}

function Logo({ size = 52 }: { size?: number }) {
  return (
    <span className="logo" style={{ width: size, height: size }}>
      <img src="/outrigger-logo.png" alt="Outrigger" />
    </span>
  );
}

const reqs = [
  {
    id: "REQ-MAM-000039970",
    title: "F&B Living Water PO-20675",
    area: "Main Kitchen",
    amount: "$2,548.90",
    status: "Approval pending",
    tone: "amber",
    date: "2026-11-17",
    delivery: "2026-11-18",
    purchaseType: "General",
  },
  {
    id: "REQ-MAM-000039959",
    title: "Store Allowance – November",
    area: "Non-operating Dept",
    amount: "$59.76",
    status: "Approved",
    tone: "green",
    date: "2026-11-16",
    delivery: "2026-11-17",
    purchaseType: "Food",
  },
  {
    id: "REQ-MAM-000039955",
    title: "Maintenance Print Lab PO-21847",
    area: "Maintenance",
    amount: "$280.15",
    status: "In process",
    tone: "blue",
    date: "2026-11-14",
    delivery: "2026-11-16",
    purchaseType: "General",
  },
];
const orders = [
  {
    id: "PO-MAM-000022483",
    supplier: "Barque Investment Pvt Ltd",
    subject: "Store Local Food Order",
    amount: "$1,404.00",
    status: "Accepted",
    date: "2026-11-14",
    delivery: "2026-11-15",
    poType: "Storeroom",
  },
  {
    id: "PO-MAM-000022482",
    supplier: "Euro Marketing Private Limited",
    subject: "Store Local Food Order",
    amount: "MVR 1,050.02",
    status: "Accepted",
    date: "2026-11-13",
    delivery: "2026-11-15",
    poType: "Storeroom",
  },
  {
    id: "PO-MAM-000022481",
    supplier: "Maldives Quality Seafood",
    subject: "Fresh seafood supply",
    amount: "$865.50",
    status: "Processing",
    date: "2026-11-11",
    delivery: "2026-11-14",
    poType: "Direct",
  },
];

const orderRows = [
  {
    part: "0001048",
    description: "Still Water 500ml",
    uom: "CS",
    quantity: 12,
    source: "Storeroom",
    location: "MAM Store Main",
    category: "Beverage",
    date: "2026-11-17",
  },
  {
    part: "0002381",
    description: "Fresh Milk Full Cream 1L",
    uom: "CTN",
    quantity: 6,
    source: "Supplier",
    location: "Main Kitchen",
    category: "Dairy",
    date: "2026-11-16",
  },
  {
    part: "0003197",
    description: "Basmati Rice Premium 5kg",
    uom: "BAG",
    quantity: 8,
    source: "Storeroom",
    location: "Main Kitchen",
    category: "Dry Food",
    date: "2026-11-14",
  },
  {
    part: "0004412",
    description: "All Purpose Cleaner 5L",
    uom: "BTL",
    quantity: 4,
    source: "Supplier",
    location: "Housekeeping",
    category: "Cleaning",
    date: "2026-11-12",
  },
];

const itemRows = [
  {
    part: "0001048",
    description: "Still Water 500ml",
    supplier: "Euro Marketing",
    onHand: 84,
    invUom: "BTL",
    orderUom: "CS",
    price: 18.5,
    category: "Beverage",
    date: "2026-11-17",
  },
  {
    part: "0002381",
    description: "Fresh Milk Full Cream 1L",
    supplier: "Best Buy Maldives",
    onHand: 18,
    invUom: "PC",
    orderUom: "CTN",
    price: 32,
    category: "Dairy",
    date: "2026-11-16",
  },
  {
    part: "0003197",
    description: "Basmati Rice Premium 5kg",
    supplier: "Barque Investment",
    onHand: 31,
    invUom: "BAG",
    orderUom: "BAG",
    price: 21.75,
    category: "Dry Food",
    date: "2026-11-14",
  },
  {
    part: "0004412",
    description: "All Purpose Cleaner 5L",
    supplier: "CleanCo Maldives",
    onHand: 7,
    invUom: "BTL",
    orderUom: "CTN",
    price: 44.25,
    category: "Cleaning",
    date: "2026-11-12",
  },
];

const reqViews = [
  "All My REQ's",
  "My In Process REQ's",
  "All Approved REQ's",
  "My Completed REQ's",
  "All Standard REQ's",
  "My Selected Depts Last 30 Days REQ'",
  "My Selected Departments REQ's",
  "Awaiting Fulfillment",
  "Partially Fulfilled",
  "Completely Fulfilled",
  "Recycle Bin REQ's",
  "All REQ's",
];
const reqSearchColumns = [
  "BEO #",
  "BPO Number",
  "Buyer person ID",
  "Company ID",
  "Dept name",
  "Dispatched",
  "Entity code",
  "Event ID",
  "Exempt from autoflip scheduler",
  "Ext REQ Num",
  "From RFQ num",
  "From location",
  "Planned",
  "Project code",
  "Purchase type",
  "REQ date",
  "REQ number",
  "Recalled REQ",
  "Recurring REQ",
  "Req delivery",
  "Restock ID",
  "Status",
  "Subject",
  "To location",
  "Type",
];
const poViews = [
  "My Last 30 Days PO's",
  "All Last 30 Days PO's",
  "My Last 60 Days PO's",
  "All Last 60 Days PO's",
  "My Last 90 Days PO's",
  "All Last 90 Days PO's",
  "All My PO's",
  "My New PO's",
  "All New PO's",
  "My In Process PO's",
  "My Completed PO's",
  "All Completed PO's",
  "All Partially Rec'd & Accepted PO's",
  "All Accepted PO's",
  "My Selected Depts Last 30 Days PO's",
  "My Selected Departments PO's",
  "My Recycle Bin PO's",
  "All Recycle Bin PO's",
  "All PO's",
];
const poSearchColumns = [
  "Alloc",
  "App grps req",
  "Buyer person ID",
  "Confirm",
  "Consignment PO",
  "Cost Center",
  "Deposit rec'd date",
  "Dept code",
  "Discretionary Spend",
  "From REQ num",
  "From RFQ num",
  "GL Account",
  "Home cur.",
  "Internal PO #",
  "PO Status",
  "PO Total",
  "PO Type",
  "PO date",
  "PO number",
  "Phase",
  "Project number",
  "Purchase type",
  "Recalled PO",
  "Recurring PO",
  "Req delivery",
  "Ship date",
  "Source doc num",
  "Subj / Supplier",
  "Subject",
  "Supplier name",
  "Tracking number",
];

const fieldKey: Record<string, string> = {
  "REQ number": "id",
  Subject: "title",
  "Dept name": "area",
  "Purchase type": "purchaseType",
  "REQ date": "date",
  Status: "status",
  "PO number": "id",
  "Supplier name": "supplier",
  "Subj / Supplier": "supplier",
  "PO Status": "status",
  "PO Total": "amount",
  "PO Type": "poType",
  "PO date": "date",
  "Req delivery": "delivery",
  "Part #": "part",
  Description: "description",
  "Category name": "category",
  "Category ID": "category",
  Commodity: "category",
  "Base UOM": "invUom",
};

function Pill({ status, tone = "blue" }: { status: string; tone?: string }) {
  return <span className={`pill ${tone}`}>{status}</span>;
}

function formatDate(value: string) {
  return new Date(value + "T00:00:00").toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ModernDatePicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const initial = value ? new Date(value + "T00:00:00") : new Date();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1));
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const days = new Date(year, monthIndex + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + days }, (_, index) =>
    index < firstDay ? null : index - firstDay + 1,
  );
  const toValue = (day: number) =>
    `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return (
    <div className="modern-date">
      <span>{label}</span>
      <button className="date-trigger" onClick={() => setOpen(!open)}>
        <Icon name="calendar" size={16} />
        <b>{value ? formatDate(value) : "Select date"}</b>
      </button>
      {open && (
        <div className="calendar-popover">
          <div className="calendar-head">
            <button
              onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}
              aria-label="Previous month"
            >
              <Icon name="next" size={16} />
            </button>
            <b>{month.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</b>
            <button
              onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}
              aria-label="Next month"
            >
              <Icon name="next" size={16} />
            </button>
          </div>
          <div className="calendar-week">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
              <span key={`${day}-${index}`}>{day}</span>
            ))}
          </div>
          <div className="calendar-days">
            {cells.map((day, index) =>
              day ? (
                <button
                  className={value === toValue(day) ? "active" : ""}
                  onClick={() => {
                    onChange(toValue(day));
                    setOpen(false);
                  }}
                  key={toValue(day)}
                >
                  {day}
                </button>
              ) : (
                <i key={`blank-${index}`} />
              ),
            )}
          </div>
          <div className="calendar-footer">
            <button
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Any date
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const todayValue = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
                onChange(todayValue);
                setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                setOpen(false);
              }}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function triggerPrintWithDetails(type: "REQ" | "PO", documentNumber: string) {
  window.dispatchEvent(
    new CustomEvent("birchstreet:print-with-details", {
      detail: { type, documentNumber, action: "Print w/Details" },
    }),
  );
}

function DetailShell({
  title,
  status,
  tone,
  close,
  children,
}: {
  title: string;
  status: string;
  tone: string;
  close: () => void;
  children: ReactNode;
}) {
  return (
    <>
      <Header title="Print w/ Details" />
      <div className="content detail-page">
        <button className="back-button" onClick={close}>
          <Icon name="next" size={18} /> Back to results
        </button>
        <section className="detail-card">
          <div className="detail-title">
            <div>
              <small>DOCUMENT</small>
              <h2>{title}</h2>
            </div>
            <Pill status={status} tone={tone} />
          </div>
          {children}
        </section>
      </div>
    </>
  );
}

function ReqDetail({ record, close }: { record: (typeof reqs)[number]; close: () => void }) {
  return (
    <DetailShell title={record.id} status={record.status} tone={record.tone} close={close}>
      <h3>
        {record.purchaseType} - {record.title}
      </h3>
      <div className="detail-grid">
        <span>
          <small>REQ DATE</small>
          <b>{formatDate(record.date)}</b>
        </span>
        <span>
          <small>DELIVERY DATE</small>
          <b>{formatDate(record.delivery)}</b>
        </span>
        <span>
          <small>PURCHASE TYPE</small>
          <b>{record.purchaseType}</b>
        </span>
        <span>
          <small>DEPARTMENT</small>
          <b>{record.area}</b>
        </span>
      </div>
      <div className="detail-total">
        <span>Home currency total</span>
        <b>{record.amount}</b>
      </div>
    </DetailShell>
  );
}

function PoDetail({ record, close }: { record: (typeof orders)[number]; close: () => void }) {
  return (
    <DetailShell
      title={record.id}
      status={record.status}
      tone={record.status === "Accepted" ? "green" : "blue"}
      close={close}
    >
      <h3>{record.subject}</h3>
      <p className="detail-supplier">{record.supplier}</p>
      <div className="detail-grid">
        <span>
          <small>PO DATE</small>
          <b>{formatDate(record.date)}</b>
        </span>
        <span>
          <small>REQ DELIVERY</small>
          <b>{formatDate(record.delivery)}</b>
        </span>
        <span>
          <small>PO TYPE</small>
          <b>{record.poType}</b>
        </span>
        <span>
          <small>SUPPLIER</small>
          <b>{record.supplier}</b>
        </span>
      </div>
      <div className="detail-total">
        <span>PO total</span>
        <b>{record.amount}</b>
      </div>
    </DetailShell>
  );
}

function Login({ enter }: { enter: () => void }) {
  const saved = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("outrigger-credentials") || "null");
    } catch {
      return null;
    }
  }, []);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [login, setLogin] = useState(saved?.login || "test");
  const [password, setPassword] = useState(saved?.password || "test");
  const [remember, setRemember] = useState(Boolean(saved));
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (login !== "test" || password !== "test")
      return setError("Use test as both the Login ID and password.");
    if (remember)
      localStorage.setItem("outrigger-credentials", JSON.stringify({ login, password }));
    else localStorage.removeItem("outrigger-credentials");
    setError("");
    enter();
  }
  return (
    <main className="login-page">
      <i className="orb one" />
      <i className="orb two" />
      <section className="login-card">
        <div className="login-brand">
          <Logo size={68} />
          <div>
            <small>OUTRIGGER</small>
            <h1>Birchstreet</h1>
          </div>
        </div>
        <div className="welcome">
          <h2>Welcome back</h2>
          <p>Sign in to manage purchasing and inventory.</p>
        </div>
        <form onSubmit={submit}>
          <div className="auto-config">
            <span>
              <Icon name="server" />
            </span>
            <div>
              <b>Automatic portal connection</b>
              <small>Server detected automatically · Subscriber 458</small>
            </div>
            <Icon name="check" size={17} />
          </div>
          <input type="hidden" name="subscriberId" value="458" />
          <label>
            <span>Login ID</span>
            <div className="field">
              <Icon name="user" />
              <input
                name="login"
                autoComplete="username"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Enter your Login ID"
              />
            </div>
          </label>
          <label>
            <span>Password</span>
            <div className="field">
              <Icon name="lock" />
              <input
                name="password"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
              <button type="button" onClick={() => setShow(!show)} aria-label="Show password">
                <Icon name="eye" />
              </button>
            </div>
          </label>
          <label className="remember-login">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>Save my username and password on this device</span>
          </label>
          {error && <p className="error">{error}</p>}
          <button className="sign-in">
            Sign in securely <Icon name="next" />
          </button>
        </form>
        <p className="secure">
          <Icon name="shield" size={17} /> Saved credentials remain on this device only.
        </p>
      </section>
      <p className="property">Outrigger Maldives Maafushivaru Resort</p>
    </main>
  );
}

function Header({ title, eyebrow = "OUTRIGGER" }: { title: string; eyebrow?: string }) {
  return (
    <header>
      <div className="head-brand">
        <Logo size={42} />
        <div>
          <small>{eyebrow}</small>
          <strong>{title}</strong>
        </div>
      </div>
      <button className="bell" aria-label="Notifications">
        <Icon name="bell" />
        <i>3</i>
      </button>
    </header>
  );
}

function Home({ go }: { go: (tab: Tab) => void }) {
  return (
    <>
      <Header title="Good morning, Shibumon" eyebrow="MAAFUSHIVARU RESORT" />
      <div className="content">
        <section className="hero">
          <div className="hero-head">
            <div>
              <small>Tuesday, 17 November</small>
              <h2>Ready to get things done?</h2>
            </div>
            <span>
              <i /> Live
            </span>
          </div>
          <div className="hero-stats">
            <button onClick={() => go("requests")}>
              <b>12</b>
              <small>Open requests</small>
            </button>
            <button onClick={() => go("inbox")}>
              <b>3</b>
              <small>Need attention</small>
            </button>
            <button onClick={() => go("orders")}>
              <b>85</b>
              <small>Active POs</small>
            </button>
          </div>
        </section>
        <Title over="WORKSPACE" title="Quick actions" />
        <div className="quick">
          <Quick
            icon="plus"
            tone="coral"
            title="New request"
            sub="Create a REQ"
            click={() => go("requests")}
          />
          <Quick
            icon="sheet"
            tone="aqua"
            title="Order sheet"
            sub="Build an order"
            click={() => go("orderList")}
          />
          <Quick
            icon="box"
            tone="navy"
            title="Inventory"
            sub="View stock"
            click={() => go("items")}
          />
          <Quick
            icon="check"
            tone="sand"
            title="Approvals"
            sub="3 pending"
            click={() => go("inbox")}
          />
        </div>
        <Title over="RECENT ACTIVITY" title="Requisitions" action={() => go("requests")} />
        <div className="activity">
          {reqs.slice(0, 2).map((r) => (
            <button key={r.id} onClick={() => go("requests")}>
              <span className="doc-icon">
                <Icon name="file" />
              </span>
              <span>
                <small>{r.id}</small>
                <b>{r.title}</b>
                <em>{r.area}</em>
              </span>
              <span>
                <b>{r.amount}</b>
                <Pill status={r.status} tone={r.tone} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function Title({ over, title, action }: { over: string; title: string; action?: () => void }) {
  return (
    <div className="title">
      <div>
        <small>{over}</small>
        <h2>{title}</h2>
      </div>
      {action && (
        <button onClick={action}>
          View all <Icon name="next" size={15} />
        </button>
      )}
    </div>
  );
}
function Quick({
  icon,
  tone,
  title,
  sub,
  click,
}: {
  icon: IconName;
  tone: string;
  title: string;
  sub: string;
  click: () => void;
}) {
  return (
    <button onClick={click}>
      <span className={tone}>
        <Icon name={icon} />
      </span>
      <b>{title}</b>
      <small>{sub}</small>
    </button>
  );
}
function Search({
  value,
  change,
  text,
}: {
  value: string;
  change: (v: string) => void;
  text: string;
}) {
  return (
    <div className="search">
      <Icon name="search" />
      <input value={value} onChange={(e) => change(e.target.value)} placeholder={text} />
    </div>
  );
}

type FilterOption = { value: string; label: string };
function FilterTools({
  query,
  setQuery,
  onSearch,
  searchDisabled = false,
  column,
  setColumn,
  columns,
  sort,
  setSort,
  sorts,
  direction,
  setDirection,
  from,
  setFrom,
  to,
  setTo,
  extra,
  belowSearch,
}: {
  query: string;
  setQuery: (value: string) => void;
  onSearch: () => void;
  searchDisabled?: boolean;
  column: string;
  setColumn: (value: string) => void;
  columns: FilterOption[];
  sort: string;
  setSort: (value: string) => void;
  sorts: FilterOption[];
  direction: "asc" | "desc";
  setDirection: (value: "asc" | "desc") => void;
  from?: string;
  setFrom?: (value: string) => void;
  to?: string;
  setTo?: (value: string) => void;
  extra?: ReactNode;
  belowSearch?: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <section className="filter-panel">
      <div className="column-search">
        <select
          value={column}
          onChange={(e) => setColumn(e.target.value)}
          aria-label="Search column"
        >
          {columns.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div>
          <Icon name="search" size={18} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter Search Value"
            disabled={searchDisabled}
          />
          <button
            className="search-submit"
            onClick={onSearch}
            disabled={searchDisabled}
            aria-label="Search"
          >
            Search
          </button>
        </div>
      </div>
      {belowSearch}
      <button
        className={`advanced-toggle ${expanded ? "open" : ""}`}
        onClick={() => setExpanded(!expanded)}
      >
        <span>Filters & sorting</span>
        <Icon name="next" size={14} />
      </button>
      {expanded && (
        <div className="advanced-controls">
          {(setFrom || extra) && (
            <div className="filter-grid">
              {setFrom && (
                <label>
                  <span>From date</span>
                  <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                </label>
              )}
              {setTo && (
                <label>
                  <span>To date</span>
                  <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                </label>
              )}
              {extra}
            </div>
          )}
          <div className="sort-row">
            <label>
              <span>Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                {sorts.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="direction"
              onClick={() => setDirection(direction === "asc" ? "desc" : "asc")}
              aria-label={`Sort ${direction === "asc" ? "descending" : "ascending"}`}
            >
              <span>{direction === "asc" ? "Ascending" : "Descending"}</span>
              <b>{direction === "asc" ? "↑" : "↓"}</b>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function matchesColumn(record: Record<string, unknown>, column: string, query: string) {
  if (!query.trim()) return true;
  const needle = query.toLowerCase();
  const key = fieldKey[column] ?? column;
  return String(record[key] ?? "")
    .toLowerCase()
    .includes(needle);
}

function compareValues(a: unknown, b: unknown, direction: "asc" | "desc") {
  const numericValue = (value: unknown) => {
    if (typeof value === "number") return value;
    const text = String(value).trim();
    if (/^(?:[A-Z]{3}\s*)?\$?[\d,]+(?:\.\d+)?$/.test(text))
      return Number(text.replace(/[^\d.]/g, ""));
    return null;
  };
  const firstNumber = numericValue(a);
  const secondNumber = numericValue(b);
  const first = firstNumber ?? String(a);
  const second = secondNumber ?? String(b);
  const result =
    typeof first === "number" && typeof second === "number"
      ? first - second
      : first.localeCompare(String(second), undefined, { numeric: true });
  return direction === "asc" ? result : -result;
}

function Requests() {
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [column, setColumn] = useState("REQ number");
  const [view, setView] = useState("All REQ's");
  const [sort, setSort] = useState("date");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [selectedDate, setSelectedDate] = useState("");
  const [selected, setSelected] = useState<(typeof reqs)[number] | null>(null);
  const list = useMemo(
    () =>
      reqs
        .filter(
          (record) =>
            Boolean(appliedQuery.trim()) &&
            matchesColumn(record, column, appliedQuery) &&
            (!view.includes("In Process") || record.status === "In process") &&
            (!view.includes("Approved") || record.status === "Approved"),
        )
        .filter((record) => !selectedDate || record.date === selectedDate)
        .sort((a, b) =>
          compareValues(a[sort as keyof typeof a], b[sort as keyof typeof b], direction),
        ),
    [appliedQuery, column, view, selectedDate, sort, direction],
  );
  if (selected) return <ReqDetail record={selected} close={() => setSelected(null)} />;
  return (
    <>
      <Header title="Requisitions" />
      <div className="content">
        <div className="fixed-view">
          <span>REQ view</span>
          <select value={view} onChange={(e) => setView(e.target.value)}>
            {reqViews.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
        <FilterTools
          query={query}
          setQuery={setQuery}
          onSearch={() => setAppliedQuery(query)}
          column={column}
          setColumn={setColumn}
          columns={reqSearchColumns.map((label) => ({ value: label, label }))}
          sort={sort}
          setSort={setSort}
          sorts={[
            { value: "date", label: "REQ date" },
            { value: "id", label: "REQ number" },
            { value: "title", label: "Subject" },
            { value: "area", label: "Dept name" },
            { value: "status", label: "Status" },
            { value: "purchaseType", label: "Purchase type" },
          ]}
          direction={direction}
          setDirection={setDirection}
          extra={
            <ModernDatePicker label="REQ date" value={selectedDate} onChange={setSelectedDate} />
          }
        />
        <ListHead text={`${list.length} requisitions`} />
        <div className="stack">
          {list.map((r) => (
            <Doc
              key={r.id}
              {...r}
              onOpen={() => {
                triggerPrintWithDetails("REQ", r.id);
                setSelected(r);
              }}
            />
          ))}
          {!list.length && (
            <div className="empty">
              <Icon name="search" size={30} />
              <b>{appliedQuery ? "No requisitions found" : "Search to load requests"}</b>
              <small>
                {appliedQuery
                  ? "Try another search value or filter."
                  : "Enter 0 as the Search Value to see the latest requests."}
              </small>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
function ListHead({ text }: { text: string }) {
  return (
    <div className="list-head">
      <b>{text}</b>
      <button>
        <Icon name="refresh" size={15} /> Sync
      </button>
    </div>
  );
}
function Doc({
  id,
  title,
  purchaseType,
  status,
  tone,
  date,
  delivery,
  onOpen,
}: (typeof reqs)[number] & { onOpen: () => void }) {
  return (
    <button className="doc result-card" onClick={onOpen}>
      <div>
        <small>{id}</small>
        <Pill status={status} tone={tone} />
      </div>
      <h3>
        {purchaseType} - {title}
      </h3>
      <footer>
        <span>
          <small>REQ DATE</small>
          <b>{formatDate(date)}</b>
        </span>
        <span>
          <small>DELIVERY DATE</small>
          <b>{formatDate(delivery)}</b>
        </span>
        <Icon name="next" />
      </footer>
    </button>
  );
}

function Orders() {
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [column, setColumn] = useState("PO number");
  const [view, setView] = useState("All PO's");
  const [sort, setSort] = useState("date");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [selectedDate, setSelectedDate] = useState("");
  const [selected, setSelected] = useState<(typeof orders)[number] | null>(null);
  const list = useMemo(
    () =>
      orders
        .filter(
          (record) =>
            Boolean(appliedQuery.trim()) &&
            matchesColumn(record, column, appliedQuery) &&
            (!view.includes("Accepted") || record.status === "Accepted") &&
            (!view.includes("In Process") || record.status === "Processing"),
        )
        .filter((record) => !selectedDate || record.date === selectedDate)
        .sort((a, b) =>
          compareValues(a[sort as keyof typeof a], b[sort as keyof typeof b], direction),
        ),
    [appliedQuery, column, view, selectedDate, sort, direction],
  );
  if (selected) return <PoDetail record={selected} close={() => setSelected(null)} />;
  return (
    <>
      <Header title="Purchase orders" />
      <div className="content">
        <div className="fixed-view">
          <span>PO view</span>
          <select value={view} onChange={(e) => setView(e.target.value)}>
            {poViews.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
        <FilterTools
          query={query}
          setQuery={setQuery}
          onSearch={() => setAppliedQuery(query)}
          column={column}
          setColumn={setColumn}
          columns={poSearchColumns.map((label) => ({ value: label, label }))}
          sort={sort}
          setSort={setSort}
          sorts={[
            { value: "date", label: "PO date" },
            { value: "delivery", label: "Required delivery" },
            { value: "id", label: "PO number" },
            { value: "supplier", label: "Supplier" },
            { value: "amount", label: "PO total" },
          ]}
          direction={direction}
          setDirection={setDirection}
          extra={
            <ModernDatePicker label="PO date" value={selectedDate} onChange={setSelectedDate} />
          }
        />
        <ListHead text={`${list.length} purchase orders`} />
        <div className="stack">
          {list.map((o) => (
            <button
              className="doc result-card"
              key={o.id}
              onClick={() => {
                triggerPrintWithDetails("PO", o.id);
                setSelected(o);
              }}
            >
              <div>
                <small>{o.id}</small>
                <Pill status={o.status} tone={o.status === "Accepted" ? "green" : "blue"} />
              </div>
              <h3>
                {o.subject} / {o.supplier}
              </h3>
              <footer>
                <span>
                  <small>PO DATE</small>
                  <b>{formatDate(o.date)}</b>
                </span>
                <span>
                  <small>REQ DELIVERY</small>
                  <b>{formatDate(o.delivery)}</b>
                </span>
                <span>
                  <small>PO TOTAL</small>
                  <b>{o.amount}</b>
                </span>
                <Icon name="next" />
              </footer>
            </button>
          ))}
          {!list.length && (
            <div className="empty">
              <Icon name="search" size={30} />
              <b>{appliedQuery ? "No purchase orders found" : "Search to load purchase orders"}</b>
              <small>
                {appliedQuery
                  ? "Try another search value or filter."
                  : "Enter 0 as the Search Value to see the latest purchase orders."}
              </small>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function OrderList() {
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [column, setColumn] = useState("Part #");
  const [sort, setSort] = useState("part");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const [entry, setEntry] = useState("");
  const [entryOptions, setEntryOptions] = useState<string[]>([]);
  const [parValues, setParValues] = useState(false);
  const [showOnHand, setShowOnHand] = useState(false);
  useEffect(() => {
    const receiveEntries = (event: Event) => {
      const entries = (event as CustomEvent<{ entries?: string[] }>).detail?.entries;
      if (Array.isArray(entries)) setEntryOptions(entries.filter(Boolean));
    };
    window.addEventListener("birchstreet:order-sheet-entries", receiveEntries);
    window.dispatchEvent(new CustomEvent("birchstreet:request-order-sheet-entries"));
    return () => window.removeEventListener("birchstreet:order-sheet-entries", receiveEntries);
  }, []);
  const list = useMemo(
    () =>
      orderRows
        .filter(
          (record) =>
            Boolean(entry && appliedQuery.trim()) && matchesColumn(record, column, appliedQuery),
        )
        .filter((record) => !entry || record.location === entry)
        .sort((a, b) =>
          compareValues(a[sort as keyof typeof a], b[sort as keyof typeof b], direction),
        ),
    [appliedQuery, column, entry, sort, direction],
  );
  return (
    <>
      <Header title="Order List" />
      <div className="content">
        <section className="entry-panel">
          <label>
            <span>Select Entry</span>
            <select
              value={entry}
              onChange={(e) => {
                const nextEntry = e.target.value;
                setEntry(nextEntry);
                setQuery("");
                setAppliedQuery("");
                window.dispatchEvent(
                  new CustomEvent("birchstreet:select-order-sheet-entry", {
                    detail: { entry: nextEntry },
                  }),
                );
              }}
              disabled={!entryOptions.length}
            >
              <option value="">
                {entryOptions.length ? "Select Entry" : "Loading entries from BirchStreet…"}
              </option>
              {entryOptions.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        </section>
        <FilterTools
          query={query}
          setQuery={setQuery}
          onSearch={() => setAppliedQuery(query)}
          searchDisabled={!entry}
          belowSearch={
            <label className="outside-toggle">
              <input
                type="checkbox"
                checked={showOnHand}
                onChange={(e) => setShowOnHand(e.target.checked)}
              />
              <span>Show on hand quantities</span>
            </label>
          }
          column={column}
          setColumn={setColumn}
          columns={[
            { value: "Part #", label: "Part #" },
            { value: "Description", label: "Description" },
            { value: "uom", label: "Req UOM" },
            { value: "quantity", label: "Quantity" },
            { value: "source", label: "Source type" },
            { value: "location", label: "Storeroom" },
            { value: "category", label: "Category name" },
          ]}
          sort={sort}
          setSort={setSort}
          sorts={[
            { value: "part", label: "Part #" },
            { value: "description", label: "Description" },
            { value: "uom", label: "Req UOM" },
            { value: "quantity", label: "Quantity" },
            { value: "source", label: "Source type" },
            { value: "location", label: "Storeroom" },
            { value: "category", label: "Category" },
          ]}
          direction={direction}
          setDirection={setDirection}
          extra={
            <>
              <label className="native-check">
                <input
                  type="checkbox"
                  checked={parValues}
                  onChange={(e) => setParValues(e.target.checked)}
                />
                <span>Par values</span>
              </label>
              <div className="action-strip advanced-actions">
                {[
                  "Create REQ",
                  "Add to REQ",
                  "Clear all qty",
                  "Item Search",
                  "Add Item",
                  "More",
                ].map((action) => (
                  <button key={action}>{action}</button>
                ))}
              </div>
            </>
          }
        />
        {!entry && (
          <p className="order-instruction">Select the appropriate store from Select Entry first.</p>
        )}
        {entry && !appliedQuery && (
          <p className="order-instruction">Enter a Search Value, then tap Search.</p>
        )}
        <ListHead text={`${list.length} order list items`} />
        <div className="stack">
          {list.map((item) => (
            <article className="inventory-row" key={item.part}>
              <div className="row-top">
                <span>PART # {item.part}</span>
                <Pill status={item.source} tone={item.source === "Storeroom" ? "green" : "blue"} />
              </div>
              <h3>{item.description}</h3>
              <div className="data-grid">
                <span>
                  <small>REQ UOM</small>
                  <b>{item.uom}</b>
                </span>
                <span>
                  <small>QUANTITY</small>
                  <b>{item.quantity}</b>
                </span>
                <span>
                  <small>CATEGORY</small>
                  <b>{item.category}</b>
                </span>
                {showOnHand && (
                  <span>
                    <small>ON HAND</small>
                    <b>{item.quantity * 3}</b>
                  </span>
                )}
              </div>
              <footer>
                <span>
                  <Icon name="building" size={14} /> {item.location}
                </span>
                <time>{item.date}</time>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}

function ItemList() {
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [column, setColumn] = useState("Part #");
  const [sort, setSort] = useState("part");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const list = useMemo(
    () =>
      itemRows
        .filter((record) => matchesColumn(record, column, appliedQuery))
        .sort((a, b) =>
          compareValues(a[sort as keyof typeof a], b[sort as keyof typeof b], direction),
        ),
    [appliedQuery, column, sort, direction],
  );
  return (
    <>
      <Header title="Item List" />
      <div className="content">
        <FilterTools
          query={query}
          setQuery={setQuery}
          onSearch={() => setAppliedQuery(query)}
          column={column}
          setColumn={setColumn}
          columns={[
            { value: "Base UOM", label: "Base UOM" },
            { value: "Category ID", label: "Category ID" },
            { value: "Category name", label: "Category name" },
            { value: "Commodity", label: "Commodity" },
            { value: "Description", label: "Description" },
            { value: "Part #", label: "Part #" },
          ]}
          sort={sort}
          setSort={setSort}
          sorts={[
            { value: "part", label: "Part #" },
            { value: "description", label: "Description" },
            { value: "supplier", label: "Supplier name" },
            { value: "onHand", label: "On Hand Qty" },
            { value: "invUom", label: "Inventory UOM" },
            { value: "orderUom", label: "Order UOM" },
            { value: "price", label: "Price" },
            { value: "category", label: "Category name" },
          ]}
          direction={direction}
          setDirection={setDirection}
          extra={
            <div className="action-strip advanced-actions">
              {[
                "Item Request",
                "Add to OS",
                "Remove from OS",
                "Print",
                "Create PO",
                "Add to PO",
              ].map((action) => (
                <button key={action}>{action}</button>
              ))}
            </div>
          }
        />
        <ListHead text={`${list.length} inventory items`} />
        <div className="stack">
          {list.map((item) => (
            <article className="inventory-row" key={item.part}>
              <div className="row-top">
                <span>PART # {item.part}</span>
                <b>${item.price.toFixed(2)}</b>
              </div>
              <h3>{item.description}</h3>
              <p className="supplier">{item.supplier}</p>
              <div className="data-grid">
                <span>
                  <small>ON HAND</small>
                  <b>{item.onHand}</b>
                </span>
                <span>
                  <small>INV UOM</small>
                  <b>{item.invUom}</b>
                </span>
                <span>
                  <small>ORDER UOM</small>
                  <b>{item.orderUom}</b>
                </span>
              </div>
              <footer>
                <span>{item.category}</span>
                <time>Updated {item.date}</time>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}

function Inbox() {
  const [mode, setMode] = useState("Inbox");
  const messages = [
    ["Inventory Transactions Report", "Your requested report is ready to view.", "16:07"],
    ["REQ approved with changes", "REQ-MAM-000039827 · HK-S&J PO#22393", "07:26"],
    ["Inventory Extension Report", "On Hand Quantity report completed.", "Yesterday"],
  ];
  return (
    <>
      <Header title="Inbox & approvals" />
      <div className="content">
        <div className="segments">
          {["Inbox", "Approvals"].map((x) => (
            <button className={mode === x ? "active" : ""} onClick={() => setMode(x)} key={x}>
              {x} <i>3</i>
            </button>
          ))}
        </div>
        {mode === "Inbox" ? (
          <div className="messages">
            {messages.map((m, i) => (
              <button className={i < 2 ? "unread" : ""} key={m[0]}>
                <i />
                <span className="message-icon">
                  <Icon name="inbox" />
                </span>
                <span>
                  <b>{m[0]}</b>
                  <small>{m[1]}</small>
                </span>
                <time>{m[2]}</time>
              </button>
            ))}
          </div>
        ) : (
          <div className="stack approvals">
            {reqs.map((r) => (
              <article key={r.id}>
                <div>
                  <Pill status="Pending review" tone="amber" />
                  <small>{r.id}</small>
                </div>
                <h3>{r.title}</h3>
                <p>
                  {r.area} · {r.amount}
                </p>
                <footer>
                  <button>Disapprove</button>
                  <button>
                    <Icon name="check" size={16} /> Approve
                  </button>
                </footer>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function More({ exit }: { exit: () => void }) {
  const menu: [IconName, string, string][] = [
    ["box", "Inventory", "Stock, transfers and adjustments"],
    ["sheet", "Order sheets", "Build and submit orders"],
    ["chart", "Reports", "Inventory and receiving reports"],
    ["settings", "Portal settings", "Server detected automatically · Subscriber 458"],
    ["help", "Help & support", "Guides and account help"],
  ];
  return (
    <>
      <Header title="More" />
      <div className="content">
        <section className="profile">
          <Logo size={58} />
          <div>
            <b>Shibumon A. Bhaskaran</b>
            <span>Marketplace 458 / 2754</span>
            <small>Maafushivaru Resort</small>
          </div>
        </section>
        <div className="menu">
          {menu.map((m) => (
            <button key={m[1]}>
              <span>
                <Icon name={m[0]} />
              </span>
              <div>
                <b>{m[1]}</b>
                <small>{m[2]}</small>
              </div>
              <Icon name="next" />
            </button>
          ))}
        </div>
        <button className="exit" onClick={exit}>
          <Icon name="logout" /> Sign out
        </button>
        <p className="version">Outrigger Birchstreet · Version 1.0</p>
      </div>
    </>
  );
}

function Settings({
  exit,
  theme,
  setTheme,
}: {
  exit: () => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}) {
  return (
    <>
      <Header title="Settings" />
      <div className="content">
        <section className="profile">
          <Logo size={58} />
          <div>
            <b>Shibumon A. Bhaskaran</b>
            <span>Marketplace 458 / 2754</span>
            <small>Maafushivaru Resort</small>
          </div>
        </section>
        <section className="settings-card">
          <div>
            <span className="settings-icon">
              <Icon name="settings" />
            </span>
            <div>
              <b>Appearance</b>
              <small>Choose your app theme</small>
            </div>
          </div>
          <div className="theme-choice">
            <button className={theme === "light" ? "active" : ""} onClick={() => setTheme("light")}>
              Light
            </button>
            <button className={theme === "dark" ? "active" : ""} onClick={() => setTheme("dark")}>
              Dark
            </button>
          </div>
        </section>
        <section className="settings-card session-setting">
          <div>
            <span className="settings-icon">
              <Icon name="lock" />
            </span>
            <div>
              <b>Session security</b>
              <small>Automatically signs out after 5 minutes</small>
            </div>
          </div>
        </section>
        <button className="exit" onClick={exit}>
          <Icon name="logout" /> Log out
        </button>
        <p className="version">Outrigger Birchstreet · Subscriber 458</p>
      </div>
    </>
  );
}

function Shell({
  exit,
  theme,
  setTheme,
}: {
  exit: () => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}) {
  const [tab, setTab] = useState<Tab>("requests");
  useEffect(() => {
    const timeout = window.setTimeout(exit, 5 * 60 * 1000);
    return () => window.clearTimeout(timeout);
  }, [exit]);
  const screens = {
    requests: <Requests />,
    orders: <Orders />,
    orderList: <OrderList />,
    items: <ItemList />,
    settings: <Settings exit={exit} theme={theme} setTheme={setTheme} />,
    inbox: <Inbox />,
    more: <More exit={exit} />,
  };
  const nav: [Tab, string, IconName][] = [
    ["requests", "Requests", "file"],
    ["orders", "POs", "cart"],
    ["orderList", "Order List", "sheet"],
    ["items", "Items", "box"],
    ["settings", "Settings", "settings"],
  ];
  return (
    <main className="shell">
      <div className="screen">{screens[tab]}</div>
      <nav>
        {nav.map((n) => (
          <button className={tab === n[0] ? "active" : ""} onClick={() => setTab(n[0])} key={n[0]}>
            <span>
              <Icon name={n[2]} />
            </span>
            <small>{n[1]}</small>
          </button>
        ))}
      </nav>
    </main>
  );
}

export default function App() {
  const [inside, setInside] = useState(false);
  const exit = useCallback(() => setInside(false), []);
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("outrigger-theme") as "light" | "dark") || "light",
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("outrigger-theme", theme);
  }, [theme]);
  return inside ? (
    <Shell exit={exit} theme={theme} setTheme={setTheme} />
  ) : (
    <Login enter={() => setInside(true)} />
  );
}
