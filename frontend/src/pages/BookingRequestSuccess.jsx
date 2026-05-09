import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, MessageCircle, MapPin, Calendar, Sparkles, Mail } from "lucide-react";
import { getBooking } from "../lib/api";

export default function BookingRequestSuccess() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getBooking(id).then(setBooking).catch(() => setError("Booking not found"));
  }, [id]);

  if (error) {
    return (
      <div className="pt-40 pb-24 container-luxe text-center">
        <h1 className="font-serif text-4xl">Request not found</h1>
        <p className="mt-3 text-[#1A1A1A]/60">Please check the link in your email or contact our concierge.</p>
        <Link to="/" className="mt-8 btn-gold inline-flex">Back to Home</Link>
      </div>
    );
  }
  if (!booking) return <div className="pt-40 container-luxe">Loading…</div>;

  return (
    <div data-testid="booking-request-success" className="pt-32 pb-24">
      <div className="container-luxe">
        <div className="text-center max-w-3xl mx-auto">
          <CheckCircle2 size={48} className="mx-auto text-[#D4AF37]" strokeWidth={1.2} />
          <p className="mt-6 text-xs uppercase tracking-[0.4em] text-[#D4AF37]">Request received</p>
          <h1 className="mt-4 font-serif text-5xl sm:text-6xl tracking-tight leading-[1.05]">
            Terima kasih, {booking.full_name.split(" ")[0]}.
          </h1>
          <p className="mt-6 font-serif text-2xl italic text-[#1A1A1A]/80 leading-relaxed">
            "Our team will personally check villa availability and contact you shortly with
            confirmation and a secure payment link."
          </p>
        </div>

        <div className="mt-16 max-w-2xl mx-auto luxe-card overflow-hidden">
          <img src={booking.villa_image} alt={booking.villa_name} className="w-full aspect-[16/9] object-cover" />
          <div className="p-10">
            <p className="text-xs uppercase tracking-[0.32em] text-[#D4AF37]">Booking request ID</p>
            <p className="mt-1 font-mono text-sm break-all" data-testid="request-id">{booking.id}</p>

            <h2 className="mt-6 font-serif text-3xl">{booking.villa_name}</h2>
            <p className="text-sm text-[#1A1A1A]/60 flex items-center gap-2"><MapPin size={13} /> {booking.villa_location}, Bali</p>

            <div className="mt-8 grid grid-cols-2 gap-4 text-sm border-t border-black/5 pt-8">
              <Stat icon={Calendar} label="Check-in" value={booking.check_in} />
              <Stat icon={Calendar} label="Check-out" value={booking.check_out} />
              <Stat icon={Sparkles} label="Guests" value={booking.guests} />
              <Stat icon={Mail} label="Status" value="Pending review" />
            </div>

            <div className="mt-10 rounded-2xl bg-[#F4F1EA] p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-[#D4AF37]">What happens next?</p>
              <ol className="mt-4 space-y-3 text-sm text-[#1A1A1A]/80 list-decimal pl-5 leading-relaxed">
                <li>Our concierge personally checks availability for your dates.</li>
                <li>You'll receive a confirmation email — usually within a few hours.</li>
                <li>We'll send a secure Stripe payment link to lock in the booking.</li>
                <li>Once paid, you'll receive your final confirmation with check-in details.</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center flex flex-wrap justify-center gap-4">
          <a
            data-testid="success-whatsapp"
            href={`https://wa.me/6281000000000?text=Hello%20Amara%20Bali%2C%20I%20just%20submitted%20booking%20request%20${booking.id}`}
            target="_blank"
            rel="noreferrer"
            className="btn-gold inline-flex items-center gap-2"
          >
            <MessageCircle size={16} /> WhatsApp Concierge
          </a>
          <Link to="/" className="btn-ghost">Back to Home</Link>
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
