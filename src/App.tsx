import { FormEvent, ReactNode, useMemo, useState } from "react";

type Tab = "home" | "requests" | "orders" | "orderList" | "items" | "inbox" | "more";
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
  | "refresh";

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

function Login({ enter }: { enter: () => void }) {
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (data.get("login") !== "test" || data.get("password") !== "test")
      return setError("Use test as both the Login ID and password.");
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
                defaultValue="test"
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
                defaultValue="test"
                placeholder="Enter your password"
              />
              <button type="button" onClick={() => setShow(!show)} aria-label="Show password">
                <Icon name="eye" />
              </button>
            </div>
          </label>
          {error && <p className="error">{error}</p>}
          <button className="sign-in">
            Sign in securely <Icon name="next" />
          </button>
        </form>
        <p className="secure">
          <Icon name="shield" size={17} /> Your credentials stay in the secure portal session.
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
}: {
  query: string;
  setQuery: (value: string) => void;
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
}) {
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
            type={/date|delivery/i.test(column) ? "date" : "text"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter Search Value"
          />
        </div>
      </div>
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
  const [column, setColumn] = useState("REQ number");
  const [view, setView] = useState("All My REQ's");
  const [sort, setSort] = useState("date");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const list = useMemo(
    () =>
      reqs
        .filter(
          (record) =>
            matchesColumn(record, column, query) &&
            (!view.includes("In Process") || record.status === "In process") &&
            (!view.includes("Approved") || record.status === "Approved"),
        )
        .sort((a, b) =>
          compareValues(a[sort as keyof typeof a], b[sort as keyof typeof b], direction),
        ),
    [query, column, view, sort, direction],
  );
  return (
    <>
      <Header title="Requisitions" />
      <div className="content">
        <FilterTools
          query={query}
          setQuery={setQuery}
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
            <label>
              <span>REQ view</span>
              <select value={view} onChange={(e) => setView(e.target.value)}>
                {reqViews.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          }
        />
        <ListHead text={`${list.length} requisitions`} />
        <div className="stack">
          {list.map((r) => (
            <Doc key={r.id} {...r} />
          ))}
          {!list.length && (
            <div className="empty">
              <Icon name="search" size={30} />
              <b>No requisitions found</b>
              <small>Try another search or filter.</small>
            </div>
          )}
        </div>
        <button className="fab" aria-label="Create requisition">
          <Icon name="plus" />
        </button>
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
function Doc({ id, title, area, amount, status, tone, date }: (typeof reqs)[number]) {
  return (
    <article className="doc">
      <div>
        <small>{id}</small>
        <Pill status={status} tone={tone} />
      </div>
      <h3>{title}</h3>
      <p>
        <span>
          <Icon name="building" size={14} /> {area}
        </span>
        <span>
          {new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </p>
      <footer>
        <small>Home currency</small>
        <b>{amount}</b>
        <Icon name="next" />
      </footer>
    </article>
  );
}

function Orders() {
  const [query, setQuery] = useState("");
  const [column, setColumn] = useState("PO number");
  const [view, setView] = useState("My Last 30 Days PO's");
  const [sort, setSort] = useState("date");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const list = useMemo(
    () =>
      orders
        .filter(
          (record) =>
            matchesColumn(record, column, query) &&
            (!view.includes("Accepted") || record.status === "Accepted") &&
            (!view.includes("In Process") || record.status === "Processing"),
        )
        .sort((a, b) =>
          compareValues(a[sort as keyof typeof a], b[sort as keyof typeof b], direction),
        ),
    [query, column, view, sort, direction],
  );
  return (
    <>
      <Header title="Purchase orders" />
      <div className="content">
        <FilterTools
          query={query}
          setQuery={setQuery}
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
            <label>
              <span>PO view</span>
              <select value={view} onChange={(e) => setView(e.target.value)}>
                {poViews.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          }
        />
        <ListHead text={`${list.length} purchase orders`} />
        <div className="stack">
          {list.map((o) => (
            <article className="doc" key={o.id}>
              <div>
                <small>{o.id}</small>
                <Pill status={o.status} tone={o.status === "Accepted" ? "green" : "blue"} />
              </div>
              <h3>{o.subject}</h3>
              <p>{o.supplier}</p>
              <footer>
                <small>{o.date.split("-").reverse().join("/")}</small>
                <b>{o.amount}</b>
                <Icon name="next" />
              </footer>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}

function OrderList() {
  const [query, setQuery] = useState("");
  const [column, setColumn] = useState("Part #");
  const [sort, setSort] = useState("part");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const [location, setLocation] = useState("");
  const [entry, setEntry] = useState("");
  const [parValues, setParValues] = useState(false);
  const [showOnHand, setShowOnHand] = useState(false);
  const list = useMemo(
    () =>
      orderRows
        .filter(
          (record) =>
            matchesColumn(record, column, query) && (!location || record.location === location),
        )
        .sort((a, b) =>
          compareValues(a[sort as keyof typeof a], b[sort as keyof typeof b], direction),
        ),
    [query, column, location, sort, direction],
  );
  return (
    <>
      <Header title="Order List" />
      <div className="content">
        <FilterTools
          query={query}
          setQuery={setQuery}
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
              <label>
                <span>Order Sheet</span>
                <select value={entry} onChange={(e) => setEntry(e.target.value)}>
                  <option value="">Select Entry</option>
                </select>
              </label>
              <label>
                <span>Location filter</span>
                <select value={location} onChange={(e) => setLocation(e.target.value)}>
                  <option value="">Select Locations</option>
                  {[...new Set(orderRows.map((item) => item.location))].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label className="native-check">
                <input
                  type="checkbox"
                  checked={parValues}
                  onChange={(e) => setParValues(e.target.checked)}
                />
                <span>Par values</span>
              </label>
              <label className="native-check">
                <input
                  type="checkbox"
                  checked={showOnHand}
                  onChange={(e) => setShowOnHand(e.target.checked)}
                />
                <span>Show on hand quantities</span>
              </label>
            </>
          }
        />
        <div className="action-strip">
          {["Create REQ", "Add to REQ", "Clear all qty", "Item Search", "Add Item", "More"].map(
            (action) => (
              <button key={action}>{action}</button>
            ),
          )}
        </div>
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
        <button className="fab" aria-label="Add order list item">
          <Icon name="plus" />
        </button>
      </div>
    </>
  );
}

function ItemList() {
  const [query, setQuery] = useState("");
  const [column, setColumn] = useState("Part #");
  const [sort, setSort] = useState("part");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const list = useMemo(
    () =>
      itemRows
        .filter((record) => matchesColumn(record, column, query))
        .sort((a, b) =>
          compareValues(a[sort as keyof typeof a], b[sort as keyof typeof b], direction),
        ),
    [query, column, sort, direction],
  );
  return (
    <>
      <Header title="Item List" />
      <div className="content">
        <FilterTools
          query={query}
          setQuery={setQuery}
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
        />
        <div className="action-strip">
          {["Item Request", "Add to OS", "Remove from OS", "Print", "Create PO", "Add to PO"].map(
            (action) => (
              <button key={action}>{action}</button>
            ),
          )}
        </div>
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

function Shell({ exit }: { exit: () => void }) {
  const [tab, setTab] = useState<Tab>("home");
  const screens = {
    home: <Home go={setTab} />,
    requests: <Requests />,
    orders: <Orders />,
    orderList: <OrderList />,
    items: <ItemList />,
    inbox: <Inbox />,
    more: <More exit={exit} />,
  };
  const nav: [Tab, string, IconName][] = [
    ["home", "Home", "home"],
    ["requests", "Requests", "file"],
    ["orders", "POs", "cart"],
    ["orderList", "Order List", "sheet"],
    ["items", "Items", "box"],
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
  return inside ? <Shell exit={() => setInside(false)} /> : <Login enter={() => setInside(true)} />;
}
