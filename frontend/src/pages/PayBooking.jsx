import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Lock, Loader2, MapPin, Calendar, Users, ShieldCheck } from "lucide-react";
import { fetchPayInfo, startPayCheckout } from "../lib/api";
import { toast } from "sonner";

export default function PayBooking() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchPayInfo(id)
      .then(setBooking)
      .catch((e) => setError(e?.response?.data?.detail || "Payment link is not active"));
  }, [id]);

  const pay = async () => {
    setBusy(true);
    try {
      const { url } = await startPayCheckout(id, window.location.origin);
      window.location.href = url;
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not start payment");
      setBusy(false);
    }
  };

  if (error) {
    return (
      <div className="pt-40 pb-24 container-luxe text-center">
        <h1 className="font-serif text-4xl">{error}</h1>
        <p className="mt-3 text-[#1A1A1A]/60">If you believe this is wrong, please reach out to our concierge.</p>
        <Link to="/contact" className="mt-8 btn-gold inline-flex">Contact us</Link>
      </div>
    );
  }
  if (!booking) return <div className="pt-40 container-luxe">Loading…</div>;

  const isPaid = booking.payment_status === "paid";

  return (
    <div data-testid="pay-page" className="pt-32 pb-24">
      <div className="container-luxe max-w-3xl">
        <p className="label-eyebrow">Secure payment</p>
        <h1 className="mt-4 font-serif text-5xl tracking-tight leading-[1.05]">
          Complete your <em className="italic font-light">{booking.villa_name}</em> reservation
        </h1>
        <p className="mt-6 text-[#1A1A1A]/65 leading-relaxed max-w-xl">
          Your concierge has confirmed availability. Settle the balance below to lock in your stay —
          payment is processed securely by Stripe.
        </p>

        <div className="mt-12 luxe-card overflow-hidden">
          <img src={booking.villa_image} alt={booking.villa_name} className="w-full aspect-[16/9] object-cover" />
          <div className="p-10">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-[#D4AF37]">Booking ID</p>
                <p className="mt-1 font-mono text-xs break-all">{booking.id}</p>
              </div>
              <span
                data-testid="booking-status"
                className={`text-[10px] uppercase tracking-[0.32em] px-3 py-1.5 rounded-full ${
                  isPaid ? "bg-[#1A1A1A] text-[#D4AF37]" : "bg-[#F4F1EA] text-[#1A1A1A]"
                }`}
              >
                {isPaid ? "Paid" : booking.status.replace("_", " ")}
              </span>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-5 text-sm pt-8 border-t border-black/5">
              <Stat icon={MapPin} label="Villa" value={`${booking.villa_name}, ${booking.villa_location}`} />
              <Stat icon={Users} label="Guests" value={booking.guests} />
              <Stat icon={Calendar} label="Check-in" value={booking.check_in} />
              <Stat icon={Calendar} label="Check-out" value={booking.check_out} />
            </div>

            <div className="mt-10 pt-8 border-t border-black/5 space-y-2 text-sm">
              <Row label={`${booking.nights} nights × $${(booking.subtotal / booking.nights).toFixed(0)}`} value={`$${booking.subtotal.toLocaleString()}`} />
              <Row label="Cleaning fee" value={`$${booking.cleaning_fee}`} />
              <Row label="Taxes (11%)" value={`$${booking.taxes.toLocaleString()}`} />
              <hr className="border-black/5" />
              <Row label="Total due" value={`$${booking.total.toLocaleString()}`} bold />
            </div>

            <div className="mt-10 flex items-center gap-3 text-xs text-[#1A1A1A]/60">
              <ShieldCheck size={16} className="text-[#D4AF37]" /> Encrypted, PCI-compliant Stripe checkout · 256-bit SSL
            </div>

            {isPaid ? (
              <Link to="/" className="mt-8 btn-ghost w-full inline-flex justify-center">Booking already paid · Back to Home</Link>
            ) : (
              <button
                onClick={pay}
                disabled={busy}
                data-testid="pay-now"
                className="mt-8 btn-gold w-full inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {busy ? <><Loader2 size={15} className="animate-spin" /> Opening secure checkout…</> : <><Lock size={14} /> Pay ${booking.total.toLocaleString()}</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div>
      <Icon size={16} className="text-[#D4AF37]" />
      <p className="mt-2 text-[10px] uppercase tracking-[0.28em] text-[#1A1A1A]/50">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
function Row({ label, value, bold }) {
  return (
    <div className={`flex justify-between ${bold ? "font-medium" : "text-[#1A1A1A]/70"}`}>
      <span>{label}</span><span className={bold ? "text-[#1A1A1A]" : ""}>{value}</span>
    </div>
  );
}
