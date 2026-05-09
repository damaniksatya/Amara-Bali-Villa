import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import { format, differenceInCalendarDays } from "date-fns";
import { Check, ChevronLeft, Loader2, Lock } from "lucide-react";
import { fetchVilla, createBooking, createCheckoutSession } from "../lib/api";
import { toast } from "sonner";

const STEPS = ["Dates & Guests", "Review Summary", "Guest Details", "Payment"];

export default function Booking() {
  const { villaSlug } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [villa, setVilla] = useState(null);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  const [checkIn, setCheckIn] = useState(params.get("check_in") || "");
  const [checkOut, setCheckOut] = useState(params.get("check_out") || "");
  const [guests, setGuests] = useState(parseInt(params.get("guests") || "2"));

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    special_requests: "",
  });

  useEffect(() => {
    fetchVilla(villaSlug).then(setVilla).catch(() => navigate("/villas"));
  }, [villaSlug, navigate]);

  if (!villa) return <div className="pt-40 container-luxe">Loading…</div>;

  const nights =
    checkIn && checkOut ? Math.max(1, differenceInCalendarDays(new Date(checkOut), new Date(checkIn))) : 0;
  const subtotal = nights * villa.price_per_night;
  const cleaningFee = 120;
  const taxes = Math.round(subtotal * 0.11 * 100) / 100;
  const total = subtotal + cleaningFee + taxes;

  const canNext = () => {
    if (step === 0) return checkIn && checkOut && guests > 0 && nights >= 1;
    if (step === 1) return true;
    if (step === 2) return form.full_name && form.email && form.phone;
    return true;
  };

  const submitPayment = async () => {
    setBusy(true);
    try {
      const booking = await createBooking({
        villa_id: villa.id,
        check_in: checkIn,
        check_out: checkOut,
        guests,
        ...form,
        origin_url: window.location.origin,
      });
      const session = await createCheckoutSession({
        booking_id: booking.id,
        origin_url: window.location.origin,
      });
      window.location.href = session.url;
    } catch (err) {
      toast.error("Could not start payment. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div data-testid="booking-page" className="pt-32 pb-24">
      <div className="container-luxe">
        <Link to={`/villas/${villa.slug}`} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#1A1A1A]/60 hover:text-[#D4AF37]">
          <ChevronLeft size={14} /> Back to {villa.name}
        </Link>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            {/* Stepper */}
            <div className="flex items-center gap-3 flex-wrap">
              {STEPS.map((label, i) => (
                <div key={label} className="flex items-center gap-3">
                  <div
                    data-testid={`step-${i}`}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      i < step
                        ? "bg-[#D4AF37] text-[#1A1A1A]"
                        : i === step
                        ? "bg-[#1A1A1A] text-white"
                        : "bg-black/5 text-[#1A1A1A]/50"
                    }`}
                  >
                    {i < step ? <Check size={14} /> : i + 1}
                  </div>
                  <span className={`text-xs uppercase tracking-[0.24em] ${i === step ? "text-[#1A1A1A]" : "text-[#1A1A1A]/40"}`}>
                    {label}
                  </span>
                  {i < STEPS.length - 1 && <span className="w-8 h-px bg-black/10" />}
                </div>
              ))}
            </div>

            <div className="mt-12">
              {step === 0 && (
                <div data-testid="booking-step-dates">
                  <h2 className="font-serif text-4xl">When are you coming?</h2>
                  <p className="mt-3 text-[#1A1A1A]/60">Pick check-in, check-out, and party size.</p>
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field label="Check-in">
                      <input
                        type="date"
                        data-testid="input-check-in"
                        min={format(new Date(), "yyyy-MM-dd")}
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="luxe-input"
                      />
                    </Field>
                    <Field label="Check-out">
                      <input
                        type="date"
                        data-testid="input-check-out"
                        min={checkIn || format(new Date(), "yyyy-MM-dd")}
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="luxe-input"
                      />
                    </Field>
                    <Field label="Guests">
                      <select
                        data-testid="input-guests"
                        value={guests}
                        onChange={(e) => setGuests(parseInt(e.target.value))}
                        className="luxe-input"
                      >
                        {Array.from({ length: villa.guests }).map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? "guest" : "guests"}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div data-testid="booking-step-summary">
                  <h2 className="font-serif text-4xl">Booking summary</h2>
                  <p className="mt-3 text-[#1A1A1A]/60">A clear breakdown of your stay.</p>
                  <div className="mt-8 luxe-card p-8 space-y-3 text-sm">
                    <Row label="Check-in" value={format(new Date(checkIn), "EEE, MMM d, yyyy")} />
                    <Row label="Check-out" value={format(new Date(checkOut), "EEE, MMM d, yyyy")} />
                    <Row label="Guests" value={`${guests} ${guests === 1 ? "guest" : "guests"}`} />
                    <Row label="Nights" value={nights} />
                    <hr className="my-3 border-black/5" />
                    <Row label={`$${villa.price_per_night} × ${nights} nights`} value={`$${subtotal.toLocaleString()}`} />
                    <Row label="Cleaning fee" value={`$${cleaningFee}`} />
                    <Row label="Taxes (11%)" value={`$${taxes.toLocaleString()}`} />
                    <hr className="my-3 border-black/5" />
                    <Row label="Total" value={`$${total.toLocaleString()}`} bold />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div data-testid="booking-step-guest">
                  <h2 className="font-serif text-4xl">Guest details</h2>
                  <p className="mt-3 text-[#1A1A1A]/60">We'll use these to personalise your stay.</p>
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Full name">
                      <input data-testid="input-full-name" type="text" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="luxe-input" />
                    </Field>
                    <Field label="Email">
                      <input data-testid="input-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="luxe-input" />
                    </Field>
                    <Field label="Phone">
                      <input data-testid="input-phone" type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="luxe-input" />
                    </Field>
                  </div>
                  <div className="mt-4">
                    <Field label="Special requests">
                      <textarea
                        data-testid="input-special-requests"
                        rows={4}
                        value={form.special_requests}
                        onChange={(e) => setForm({ ...form, special_requests: e.target.value })}
                        className="luxe-input"
                        placeholder="Anniversary, dietary preferences, airport pickup, etc."
                      />
                    </Field>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div data-testid="booking-step-payment">
                  <h2 className="font-serif text-4xl">Secure payment</h2>
                  <p className="mt-3 text-[#1A1A1A]/60">You'll be redirected to our secure payment partner Stripe.</p>
                  <div className="mt-8 luxe-card p-8">
                    <div className="flex items-center gap-3 text-sm text-[#1A1A1A]/70">
                      <Lock size={16} className="text-[#D4AF37]" /> Encrypted, PCI-compliant checkout
                    </div>
                    <p className="mt-6 text-2xl font-serif">${total.toLocaleString()} <span className="text-sm font-sans text-[#1A1A1A]/50">total</span></p>
                    <p className="mt-2 text-sm text-[#1A1A1A]/60">{villa.name} · {nights} nights · {guests} guests</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-12 flex items-center justify-between">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                data-testid="step-back"
                className="text-xs uppercase tracking-[0.3em] text-[#1A1A1A]/60 hover:text-[#1A1A1A] disabled:opacity-30"
              >
                ← Back
              </button>

              {step < 3 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canNext()}
                  data-testid="step-next"
                  className="btn-primary disabled:opacity-50"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={submitPayment}
                  disabled={busy}
                  data-testid="step-pay"
                  className="btn-gold disabled:opacity-50"
                >
                  {busy ? <><Loader2 size={16} className="animate-spin mr-2" /> Redirecting…</> : "Pay Now"}
                </button>
              )}
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-32 luxe-card overflow-hidden">
              <img src={villa.images[0]} alt={villa.name} className="w-full aspect-[4/3] object-cover" />
              <div className="p-6">
                <p className="text-[10px] uppercase tracking-[0.32em] text-[#D4AF37]">{villa.type}</p>
                <h3 className="mt-2 font-serif text-2xl">{villa.name}</h3>
                <p className="text-sm text-[#1A1A1A]/60">{villa.location}, Bali</p>
                {nights > 0 && (
                  <div className="mt-6 pt-6 border-t border-black/5 space-y-2 text-sm">
                    <Row label={`$${villa.price_per_night} × ${nights} nights`} value={`$${subtotal.toLocaleString()}`} />
                    <Row label="Cleaning fee" value={`$${cleaningFee}`} />
                    <Row label="Taxes" value={`$${taxes.toLocaleString()}`} />
                    <hr className="border-black/5" />
                    <Row label="Total" value={`$${total.toLocaleString()}`} bold />
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .luxe-input {
          @apply w-full bg-transparent border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37];
          width: 100%;
          background: transparent;
          border: 1px solid rgba(0,0,0,0.10);
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 14px;
          transition: border-color .25s ease;
        }
        .luxe-input:focus { outline: none; border-color: #D4AF37; }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.28em] text-[#1A1A1A]/50">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className={`flex justify-between ${bold ? "font-medium" : "text-[#1A1A1A]/70"}`}>
      <span>{label}</span>
      <span className={bold ? "text-[#1A1A1A]" : ""}>{value}</span>
    </div>
  );
}
