import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LogOut,
  Loader2,
  CheckCircle2,
  XCircle,
  Send,
  Copy,
  ChevronDown,
  Search as SearchIcon,
  ExternalLink,
} from "lucide-react";
import {
  adminMe,
  adminListBookings,
  adminUpdateBooking,
  adminCreatePaymentLink,
  adminStats,
  setAuthToken,
} from "../lib/api";
import { toast } from "sonner";

const STATUS_TABS = [
  { key: "all", label: "All", value: undefined },
  { key: "pending", label: "Pending", value: "pending" },
  { key: "confirmed", label: "Confirmed", value: "confirmed" },
  { key: "awaiting_payment", label: "Awaiting Payment", value: "awaiting_payment" },
  { key: "paid", label: "Paid", value: "paid" },
  { key: "cancelled", label: "Cancelled", value: "cancelled" },
];

const STATUS_PILL = {
  pending: "bg-[#F4F1EA] text-[#1A1A1A]",
  confirmed: "bg-[#1A1A1A] text-white",
  awaiting_payment: "bg-[#D4AF37]/15 text-[#8C7211] border border-[#D4AF37]/40",
  paid: "bg-[#1A1A1A] text-[#D4AF37]",
  cancelled: "bg-black/[0.06] text-[#1A1A1A]/50 line-through",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState(null);

  const reload = async () => {
    const tabValue = STATUS_TABS.find((t) => t.key === tab)?.value;
    const [list, s] = await Promise.all([adminListBookings(tabValue), adminStats()]);
    setBookings(list);
    setStats(s);
    setLoading(false);
  };

  useEffect(() => {
    adminMe()
      .then(setAdmin)
      .catch(() => {
        setAuthToken(null);
        navigate("/admin/login");
      });
  }, [navigate]);

  useEffect(() => {
    if (admin) reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin, tab]);

  const logout = () => {
    setAuthToken(null);
    navigate("/admin/login");
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return bookings;
    return bookings.filter(
      (b) =>
        b.full_name.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q) ||
        b.villa_name.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q)
    );
  }, [bookings, search]);

  const updateStatus = async (id, status, note = "") => {
    try {
      await adminUpdateBooking(id, { status, admin_note: note });
      toast.success(`Marked as ${status.replace("_", " ")}.`);
      reload();
    } catch {
      toast.error("Could not update status");
    }
  };

  const sendPaymentLink = async (id) => {
    try {
      const { pay_url } = await adminCreatePaymentLink(id);
      // Override with the public origin so the link is shareable
      const publicUrl = `${window.location.origin}/pay/${id}`;
      await navigator.clipboard.writeText(publicUrl).catch(() => {});
      toast.success("Payment link generated and copied to clipboard.");
      reload();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not create payment link");
    }
  };

  const copyLink = async (id) => {
    const url = `${window.location.origin}/pay/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  if (!admin) return <div className="pt-40 container-luxe">Loading…</div>;

  return (
    <div data-testid="admin-dashboard" className="bg-[#FAFAFA] min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-black/5">
        <div className="container-luxe flex h-20 items-center justify-between">
          <div className="flex items-baseline gap-4">
            <Link to="/" className="font-serif text-2xl">Amara</Link>
            <span className="text-[10px] uppercase tracking-[0.32em] text-[#D4AF37]">Concierge Console</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="hidden sm:inline text-xs text-[#1A1A1A]/60">{admin.email}</span>
            <button onClick={logout} data-testid="admin-logout" className="text-xs uppercase tracking-[0.28em] text-[#1A1A1A]/60 hover:text-[#1A1A1A] inline-flex items-center gap-2">
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="container-luxe py-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="label-eyebrow">Booking Requests</p>
            <h1 className="mt-3 font-serif text-5xl tracking-tight">Reservations</h1>
            <p className="mt-3 text-sm text-[#1A1A1A]/60 max-w-xl">
              Review incoming booking requests, confirm availability, and send secure Stripe payment links to guests.
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <SearchIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40" />
            <input
              data-testid="admin-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guest, villa, ID…"
              className="w-full pl-10 pr-4 py-3 rounded-full bg-white border border-black/10 text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard label="Total" value={stats.total_requests} />
            <StatCard label="Pending" value={stats.pending} />
            <StatCard label="Confirmed" value={stats.confirmed} />
            <StatCard label="Awaiting Payment" value={stats.awaiting_payment} />
            <StatCard label="Paid" value={stats.paid} />
            <StatCard label="Revenue" value={`$${stats.revenue.toLocaleString()}`} accent />
          </div>
        )}

        {/* Tabs */}
        <div className="mt-10 flex flex-wrap gap-2 border-b border-black/5 pb-5">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              data-testid={`tab-${t.key}`}
              onClick={() => setTab(t.key)}
              className={`text-xs uppercase tracking-[0.24em] rounded-full px-4 py-2 transition-all ${
                tab === t.key
                  ? "bg-[#1A1A1A] text-white"
                  : "bg-transparent text-[#1A1A1A]/70 hover:text-[#1A1A1A]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="mt-12 flex items-center justify-center text-[#1A1A1A]/60"><Loader2 className="animate-spin mr-2" size={16} /> Loading…</div>
        ) : filtered.length === 0 ? (
          <p className="mt-20 text-center text-[#1A1A1A]/60 text-sm">No booking requests in this view.</p>
        ) : (
          <div className="mt-10 luxe-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="admin-bookings-table">
                <thead className="bg-[#F4F1EA] text-[10px] uppercase tracking-[0.24em] text-[#1A1A1A]/60">
                  <tr>
                    <th className="text-left px-6 py-4">Guest</th>
                    <th className="text-left px-6 py-4">Villa</th>
                    <th className="text-left px-6 py-4">Dates</th>
                    <th className="text-left px-6 py-4">Total</th>
                    <th className="text-left px-6 py-4">Status</th>
                    <th className="text-right px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => (
                    <BookingRow
                      key={b.id}
                      b={b}
                      open={openId === b.id}
                      onToggle={() => setOpenId(openId === b.id ? null : b.id)}
                      onConfirm={() => updateStatus(b.id, "confirmed")}
                      onCancel={() => updateStatus(b.id, "cancelled")}
                      onSendPaymentLink={() => sendPaymentLink(b.id)}
                      onCopyLink={() => copyLink(b.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BookingRow({ b, open, onToggle, onConfirm, onCancel, onSendPaymentLink, onCopyLink }) {
  return (
    <>
      <tr data-testid={`booking-row-${b.id}`} className="border-t border-black/5 hover:bg-[#FAFAFA] transition-colors">
        <td className="px-6 py-5">
          <p className="font-medium">{b.full_name}</p>
          <p className="text-xs text-[#1A1A1A]/50">{b.email}</p>
        </td>
        <td className="px-6 py-5">
          <p className="font-medium">{b.villa_name}</p>
          <p className="text-xs text-[#1A1A1A]/50">{b.villa_location} · {b.guests} guests</p>
        </td>
        <td className="px-6 py-5">
          <p>{b.check_in}</p>
          <p className="text-xs text-[#1A1A1A]/50">to {b.check_out}</p>
        </td>
        <td className="px-6 py-5 font-medium">${b.total.toLocaleString()}</td>
        <td className="px-6 py-5">
          <span className={`text-[10px] uppercase tracking-[0.28em] px-3 py-1.5 rounded-full whitespace-nowrap ${STATUS_PILL[b.status] || "bg-black/5"}`}>
            {b.status.replace("_", " ")}
          </span>
        </td>
        <td className="px-6 py-5 text-right">
          <div className="inline-flex items-center gap-2 flex-wrap justify-end">
            {b.status === "pending" && (
              <>
                <button data-testid={`confirm-${b.id}`} onClick={onConfirm} className="text-[10px] uppercase tracking-[0.24em] px-3 py-2 rounded-full bg-[#1A1A1A] text-white hover:bg-[#D4AF37] hover:text-[#1A1A1A] transition-colors inline-flex items-center gap-1.5">
                  <CheckCircle2 size={12} /> Confirm
                </button>
                <button data-testid={`cancel-${b.id}`} onClick={onCancel} className="text-[10px] uppercase tracking-[0.24em] px-3 py-2 rounded-full bg-transparent border border-black/10 hover:border-[#1A1A1A] inline-flex items-center gap-1.5">
                  <XCircle size={12} /> Reject
                </button>
              </>
            )}
            {b.status === "confirmed" && (
              <button data-testid={`send-link-${b.id}`} onClick={onSendPaymentLink} className="text-[10px] uppercase tracking-[0.24em] px-3 py-2 rounded-full bg-[#D4AF37] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors inline-flex items-center gap-1.5">
                <Send size={12} /> Send payment link
              </button>
            )}
            {b.status === "awaiting_payment" && (
              <button data-testid={`copy-link-${b.id}`} onClick={onCopyLink} className="text-[10px] uppercase tracking-[0.24em] px-3 py-2 rounded-full bg-[#1A1A1A] text-white inline-flex items-center gap-1.5">
                <Copy size={12} /> Copy link
              </button>
            )}
            <button onClick={onToggle} aria-label="toggle details" className="w-8 h-8 inline-flex items-center justify-center rounded-full border border-black/10 hover:border-[#1A1A1A]">
              <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
          </div>
        </td>
      </tr>
      {open && (
        <tr className="bg-[#FAFAFA]">
          <td colSpan={6} className="px-6 py-6 border-t border-black/5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <Detail label="Booking ID" value={b.id} mono />
              <Detail label="Phone" value={b.phone} />
              <Detail label="Created" value={new Date(b.created_at).toLocaleString()} />
              <Detail label="Subtotal" value={`$${b.subtotal.toLocaleString()}`} />
              <Detail label="Cleaning fee" value={`$${b.cleaning_fee}`} />
              <Detail label="Taxes" value={`$${b.taxes.toLocaleString()}`} />
              <Detail label="Special requests" value={b.special_requests || "—"} full />
              {b.admin_note && <Detail label="Admin note" value={b.admin_note} full />}
              <div className="md:col-span-3 flex items-center gap-3 pt-2 border-t border-black/5 mt-2">
                {b.status === "awaiting_payment" || b.status === "paid" ? (
                  <a
                    href={`/pay/${b.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs uppercase tracking-[0.28em] text-[#D4AF37] hover:text-[#1A1A1A] inline-flex items-center gap-1.5"
                  >
                    Open payment page <ExternalLink size={12} />
                  </a>
                ) : null}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className={`luxe-card p-6 ${accent ? "bg-[#1A1A1A] text-white border-transparent" : ""}`}>
      <p className={`text-[10px] uppercase tracking-[0.28em] ${accent ? "text-[#D4AF37]" : "text-[#1A1A1A]/50"}`}>{label}</p>
      <p className="mt-3 font-serif text-3xl">{value}</p>
    </div>
  );
}

function Detail({ label, value, mono, full }) {
  return (
    <div className={full ? "md:col-span-3" : ""}>
      <p className="text-[10px] uppercase tracking-[0.24em] text-[#1A1A1A]/50">{label}</p>
      <p className={`mt-1 ${mono ? "font-mono text-xs break-all" : ""}`}>{value}</p>
    </div>
  );
}
