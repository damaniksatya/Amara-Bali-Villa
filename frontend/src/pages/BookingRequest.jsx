import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { format, differenceInCalendarDays } from "date-fns";
import { ChevronLeft, Calendar as CalendarIcon, Check, Loader2, Sparkles } from "lucide-react";
import { Calendar } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { fetchVilla, createBookingRequest } from "../lib/api";
import { toast } from "sonner";

export default function BookingRequest() {
  const { villaSlug } = useParams();
  const navigate = useNavigate();
  const [villa, setVilla] = useState(null);
  const [busy, setBusy] = useState(false);
  const [range, setRange] = useState({ from: undefined, to: undefined });
  const [guests, setGuests] = useState(2);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", special_requests: "" });

  useEffect(() => {
    fetchVilla(villaSlug).then(setVilla).catch(() => navigate("/villas"));
  }, [villaSlug, navigate]);

  if (!villa) return <div className="pt-40 container-luxe">Loading…</div>;

  const nights = range.from && range.to ? Math.max(1, differenceInCalendarDays(range.to, range.from)) : 0;
  const subtotal = nights * villa.price_per_night;
  const cleaningFee = nights ? 120 : 0;
  const taxes = Math.round(subtotal * 0.11 * 100) / 100;
  const total = subtotal + cleaningFee + taxes;

  const valid = range.from && range.to && nights >= 1 && form.full_name && form.email && form.phone;

  const submit = async (e) => {
    e.preventDefault();
    if (!valid) {
      toast.error("Please complete all required fields.");
      return;
    }
    setBusy(true);
    try {
      const booking = await createBookingRequest({
        villa_id: villa.id,
        check_in: format(range.from, "yyyy-MM-dd"),
        check_out: format(range.to, "yyyy-MM-dd"),
        guests,
        ...form,
      });
      navigate(`/booking/request-received/${booking.id}`);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not submit. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="booking-request-page" className="pt-32 pb-24">
      <div className="container-luxe">
        <Link to={`/villas/${villa.slug}`} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#1A1A1A]/60 hover:text-[#D4AF37]">
          <ChevronLeft size={14} /> Back to {villa.name}
        </Link>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <p className="label-eyebrow">Concierge Reservation</p>
            <h1 className="mt-4 font-serif text-5xl tracking-tight">Request to stay at {villa.name}</h1>
            <p className="mt-6 text-[#1A1A1A]/65 leading-relaxed max-w-xl">
              Tell us when you'd like to come. Our team will personally check availability for your dates and
              return within a few hours with confirmation and a secure payment link.
            </p>

            <form onSubmit={submit} data-testid="booking-request-form" className="mt-12 space-y-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Stay dates" required>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button type="button" data-testid="input-dates" className="luxe-input text-left flex items-center gap-3">
                        <CalendarIcon size={14} className="text-[#D4AF37]" />
                        {range.from
                          ? range.to
                            ? `${format(range.from, "MMM d")} – ${format(range.to, "MMM d, yyyy")}`
                            : `${format(range.from, "MMM d, yyyy")} – select check-out`
                          : "Select check-in & check-out"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        numberOfMonths={2}
                        selected={range}
                        onSelect={(v) => setRange(v || { from: undefined, to: undefined })}
                        disabled={{ before: new Date() }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </Field>
                <Field label="Guests" required>
                  <select name="guests" data-testid="input-guests" value={guests} onChange={(e) => setGuests(parseInt(e.target.value))} className="luxe-input">
                    {Array.from({ length: villa.guests }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? "guest" : "guests"}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="border-t border-black/5 pt-7">
                <p className="label-eyebrow">Your details</p>
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Full name" required>
                    <input name="full_name" autoComplete="name" data-testid="input-full-name" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="luxe-input" />
                  </Field>
                  <Field label="Email" required>
                    <input name="email" autoComplete="email" type="email" data-testid="input-email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="luxe-input" />
                  </Field>
                  <Field label="Phone (incl. country code)" required>
                    <input name="phone" autoComplete="tel" type="tel" data-testid="input-phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="luxe-input" placeholder="+62 …" />
                  </Field>
                </div>
                <div className="mt-5">
                  <Field label="Special requests">
                    <textarea name="special_requests" data-testid="input-special-requests" rows={4} value={form.special_requests} onChange={(e) => setForm({ ...form, special_requests: e.target.value })} className="luxe-input" placeholder="Anniversary, dietary preferences, airport pickup, floating breakfast…" />
                  </Field>
                </div>
              </div>

              <button data-testid="submit-request" type="submit" disabled={busy || !valid} className="btn-gold inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {busy ? <><Loader2 size={15} className="animate-spin" /> Sending request…</> : <>Request Booking <Sparkles size={15} /></>}
              </button>

              <p className="text-xs text-[#1A1A1A]/50 leading-relaxed max-w-md">
                <Check size={12} className="inline text-[#D4AF37] mr-1.5" />
                You won't be charged at this stage. We'll only send a secure Stripe payment link
                once a member of our concierge team has confirmed availability.
              </p>
            </form>
          </div>

          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-32 luxe-card overflow-hidden">
              <img src={villa.images[0]} alt={villa.name} className="w-full aspect-[4/3] object-cover" />
              <div className="p-7">
                <p className="text-[10px] uppercase tracking-[0.32em] text-[#D4AF37]">{villa.type}</p>
                <h3 className="mt-2 font-serif text-2xl">{villa.name}</h3>
                <p className="text-sm text-[#1A1A1A]/60">{villa.location}, Bali</p>

                <div className="mt-6 pt-6 border-t border-black/5 space-y-2 text-sm">
                  <Row label="Rate" value={`$${villa.price_per_night}/night`} />
                  {nights > 0 && <>
                    <Row label={`${nights} nights subtotal`} value={`$${subtotal.toLocaleString()}`} />
                    <Row label="Cleaning fee" value={`$${cleaningFee}`} />
                    <Row label="Taxes (11%)" value={`$${taxes.toLocaleString()}`} />
                    <hr className="border-black/5" />
                    <Row label="Estimated total" value={`$${total.toLocaleString()}`} bold />
                  </>}
                </div>

                <p className="mt-6 text-xs text-[#1A1A1A]/50 leading-relaxed">
                  Final pricing is locked in by our concierge based on seasonality and any add-on
                  experiences you request. No payment is taken before confirmation.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .luxe-input {
          width: 100%; background: transparent;
          border: 1px solid rgba(0,0,0,0.10);
          border-radius: 12px; padding: 14px 16px;
          font-size: 14px; transition: border-color .25s ease;
        }
        .luxe-input:focus { outline: none; border-color: #D4AF37; }
      `}</style>
    </div>
  );
}

function Field({ label, children, required }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.28em] text-[#1A1A1A]/50">
        {label}{required && <span className="text-[#D4AF37]"> ·</span>}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className={`flex justify-between ${bold ? "font-medium" : "text-[#1A1A1A]/70"}`}>
      <span>{label}</span><span className={bold ? "text-[#1A1A1A]" : ""}>{value}</span>
    </div>
  );
}
