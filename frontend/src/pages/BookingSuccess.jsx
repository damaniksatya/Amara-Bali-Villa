import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, MapPin, Calendar, Mail, MessageCircle } from "lucide-react";
import { getCheckoutStatus } from "../lib/api";

export default function BookingSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [state, setState] = useState({ status: "polling", booking: null, payment_status: null });
  const attempts = useRef(0);

  useEffect(() => {
    if (!sessionId) {
      setState({ status: "error", booking: null, payment_status: null });
      return;
    }
    let cancelled = false;
    const poll = async () => {
      if (cancelled) return;
      try {
        const data = await getCheckoutStatus(sessionId);
        if (data.payment_status === "paid") {
          setState({ status: "paid", booking: data.booking, payment_status: "paid" });
          return;
        }
        if (data.status === "expired") {
          setState({ status: "expired", booking: data.booking, payment_status: data.payment_status });
          return;
        }
        attempts.current += 1;
        if (attempts.current >= 8) {
          setState({ status: "timeout", booking: data.booking, payment_status: data.payment_status });
          return;
        }
        setTimeout(poll, 2000);
      } catch {
        attempts.current += 1;
        if (attempts.current >= 5) {
          setState({ status: "error", booking: null, payment_status: null });
          return;
        }
        setTimeout(poll, 2000);
      }
    };
    poll();
    return () => { cancelled = true; };
  }, [sessionId]);

  if (state.status === "polling") {
    return (
      <div data-testid="booking-success-polling" className="pt-40 pb-24 container-luxe text-center">
        <Loader2 size={28} className="mx-auto text-[#D4AF37] animate-spin" />
        <h1 className="mt-8 font-serif text-4xl">Confirming your reservation…</h1>
        <p className="mt-3 text-[#1A1A1A]/60">Please hold on — this usually takes a few seconds.</p>
      </div>
    );
  }

  if (state.status === "expired" || state.status === "error" || state.status === "timeout") {
    return (
      <div data-testid="booking-success-error" className="pt-40 pb-24 container-luxe text-center">
        <h1 className="font-serif text-4xl">We couldn't confirm your booking</h1>
        <p className="mt-3 text-[#1A1A1A]/60">If your card was charged, please contact our concierge — we'll resolve this immediately.</p>
        <Link to="/contact" className="mt-8 btn-gold inline-flex">Contact Concierge</Link>
      </div>
    );
  }

  const b = state.booking;
  return (
    <div data-testid="booking-success" className="pt-32 pb-24">
      <div className="container-luxe">
        <div className="text-center">
          <CheckCircle2 size={48} className="mx-auto text-[#D4AF37]" strokeWidth={1.2} />
          <p className="mt-6 text-xs uppercase tracking-[0.4em] text-[#D4AF37]">Reservation confirmed</p>
          <h1 className="mt-4 font-serif text-5xl sm:text-6xl tracking-tight">Selamat datang, {b?.full_name?.split(" ")[0]}</h1>
          <p className="mt-6 text-[#1A1A1A]/70 max-w-xl mx-auto">
            Your villa stay is booked. We've sent a confirmation to <span className="font-medium">{b?.email}</span> with everything you need.
          </p>
        </div>

        <div className="mt-16 max-w-3xl mx-auto luxe-card overflow-hidden">
          {b && (
            <>
              <img src={b.villa_image} alt={b.villa_name} className="w-full aspect-[16/9] object-cover" />
              <div className="p-10">
                <p className="text-xs uppercase tracking-[0.32em] text-[#D4AF37]">Booking ID</p>
                <p className="mt-1 font-mono text-sm">{b.id}</p>

                <h2 className="mt-6 font-serif text-3xl">{b.villa_name}</h2>
                <p className="text-sm text-[#1A1A1A]/60 flex items-center gap-2"><MapPin size={13} /> {b.villa_location}, Bali</p>

                <div className="mt-8 grid grid-cols-2 gap-4 text-sm border-t border-black/5 pt-8">
                  <Stat icon={Calendar} label="Check-in" value={b.check_in} />
                  <Stat icon={Calendar} label="Check-out" value={b.check_out} />
                  <Stat icon={MapPin} label="Guests" value={b.guests} />
                  <Stat icon={Mail} label="Nights" value={b.nights} />
                </div>

                <div className="mt-8 border-t border-black/5 pt-6 space-y-2 text-sm">
                  <Row label={`Subtotal (${b.nights} nights)`} value={`$${b.subtotal.toLocaleString()}`} />
                  <Row label="Cleaning fee" value={`$${b.cleaning_fee}`} />
                  <Row label="Taxes" value={`$${b.taxes.toLocaleString()}`} />
                  <hr className="border-black/5" />
                  <Row label="Total paid" value={`$${b.total.toLocaleString()}`} bold />
                </div>

                <div className="mt-10 rounded-2xl bg-[#F4F1EA] p-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-[#D4AF37]">Check-in information</p>
                  <p className="mt-3 text-sm text-[#1A1A1A]/75 leading-relaxed">
                    Standard check-in is from 2:00 pm. Our concierge will reach out 48 hours before arrival
                    to arrange airport transfer, share the exact villa address, and finalise any pre-arrival
                    requests (chef menus, spa appointments, tours).
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-12 text-center flex flex-wrap justify-center gap-4">
          <a
            data-testid="success-whatsapp"
            href="https://wa.me/6281000000000"
            target="_blank"
            rel="noreferrer"
            className="btn-gold inline-flex items-center gap-2"
          >
            <MessageCircle size={16} /> WhatsApp Concierge
          </a>
          <Link to="/" data-testid="success-home" className="btn-ghost">Back to Home</Link>
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
