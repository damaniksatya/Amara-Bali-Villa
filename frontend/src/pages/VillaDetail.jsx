import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { format, differenceInCalendarDays } from "date-fns";
import {
  BedDouble,
  Bath,
  Users,
  Waves,
  Wifi,
  MapPin,
  Star,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { fetchVilla, fetchRelatedVillas } from "../lib/api";
import { Calendar } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import VillaCard from "../components/VillaCard";

export default function VillaDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [villa, setVilla] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [range, setRange] = useState({ from: undefined, to: undefined });
  const [guests, setGuests] = useState(2);

  useEffect(() => {
    fetchVilla(slug).then(setVilla).catch(() => navigate("/villas"));
    fetchRelatedVillas(slug).then(setRelated).catch(() => {});
  }, [slug, navigate]);

  if (!villa) {
    return <div className="pt-40 container-luxe">Loading…</div>;
  }

  const nights = range.from && range.to ? differenceInCalendarDays(range.to, range.from) : 0;
  const subtotal = nights * villa.price_per_night;
  const cleaningFee = 120;
  const taxes = Math.round(subtotal * 0.11 * 100) / 100;
  const total = subtotal + cleaningFee + taxes;

  const proceed = () => {
    if (!range.from || !range.to) return;
    const params = new URLSearchParams({
      check_in: format(range.from, "yyyy-MM-dd"),
      check_out: format(range.to, "yyyy-MM-dd"),
      guests: String(guests),
    });
    navigate(`/booking/${villa.slug}?${params.toString()}`);
  };

  return (
    <div data-testid="villa-detail-page" className="pt-24 pb-24">
      {/* Gallery */}
      <div className="bg-[#F4F1EA]">
        <div className="container-luxe py-8">
          <Link to="/villas" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#1A1A1A]/60 hover:text-[#D4AF37]">
            <ChevronLeft size={14} /> Back to Collection
          </Link>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-3 h-[60vh]">
            <div className="lg:col-span-8 relative rounded-2xl overflow-hidden">
              <img src={villa.images[activeImg]} alt={villa.name} className="w-full h-full object-cover" />
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={() => setActiveImg((i) => (i - 1 + villa.images.length) % villa.images.length)}
                  className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center"
                  aria-label="Previous image"
                  data-testid="gallery-prev"
                ><ChevronLeft size={16} /></button>
                <button
                  onClick={() => setActiveImg((i) => (i + 1) % villa.images.length)}
                  className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center"
                  aria-label="Next image"
                  data-testid="gallery-next"
                ><ChevronRight size={16} /></button>
              </div>
            </div>
            <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-3">
              {villa.images.slice(0, 4).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  data-testid={`gallery-thumb-${i}`}
                  className={`relative rounded-2xl overflow-hidden ${activeImg === i ? "ring-2 ring-[#D4AF37]" : ""}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover aspect-[4/3] lg:aspect-auto lg:h-full" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Title + Info + Booking widget */}
      <div className="container-luxe mt-14 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <p className="text-xs uppercase tracking-[0.32em] text-[#D4AF37]">{villa.type}</p>
          <h1 className="mt-4 font-serif text-5xl sm:text-6xl tracking-tight">{villa.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-[#1A1A1A]/70">
            <span className="flex items-center gap-2"><MapPin size={14} /> {villa.location}, Bali</span>
            <span className="flex items-center gap-2"><Star size={14} className="fill-[#D4AF37] text-[#D4AF37]" /> {villa.rating} · {villa.reviews_count} reviews</span>
          </div>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-5 gap-4 border-y border-black/5 py-8">
            <Stat icon={BedDouble} label="Bedrooms" value={villa.bedrooms} />
            <Stat icon={Bath} label="Bathrooms" value={villa.bathrooms} />
            <Stat icon={Users} label="Guests" value={villa.guests} />
            <Stat icon={Waves} label="Pool" value={villa.pool ? "Private" : "—"} />
            <Stat icon={Wifi} label="WiFi" value={villa.wifi ? "Yes" : "No"} />
          </div>

          <section className="mt-12">
            <h2 className="font-serif text-3xl">About this villa</h2>
            <div className="mt-5 text-[#1A1A1A]/75 leading-relaxed whitespace-pre-line">
              {villa.description}
            </div>
          </section>

          <section className="mt-14">
            <h2 className="font-serif text-3xl">Amenities</h2>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {villa.amenities.map((a) => (
                <div key={a} className="flex items-center gap-3 text-sm">
                  <Check size={16} className="text-[#D4AF37]" />
                  {a}
                </div>
              ))}
            </div>
          </section>

          <section className="mt-14">
            <h2 className="font-serif text-3xl">Availability</h2>
            <p className="mt-3 text-sm text-[#1A1A1A]/60">Select your dates to see total pricing.</p>
            <div className="mt-6 inline-block rounded-2xl border border-black/5 p-4 bg-white">
              <Calendar
                mode="range"
                numberOfMonths={2}
                selected={range}
                onSelect={(v) => setRange(v || { from: undefined, to: undefined })}
                disabled={{ before: new Date() }}
              />
            </div>
          </section>

          <section className="mt-14">
            <h2 className="font-serif text-3xl">Location</h2>
            <p className="mt-3 text-sm text-[#1A1A1A]/60">{villa.location}, Bali — exact address shared on booking.</p>
            <div className="mt-6 rounded-2xl overflow-hidden aspect-[16/9] border border-black/5">
              <iframe
                title="Villa location"
                src={`https://www.google.com/maps?q=${villa.lat},${villa.lng}&hl=en&z=12&output=embed`}
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
          </section>
        </div>

        {/* Sticky booking widget */}
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-32 luxe-card p-7" data-testid="booking-widget">
            <div className="flex items-baseline justify-between">
              <p className="font-serif text-3xl">${villa.price_per_night}<span className="text-sm font-sans text-[#1A1A1A]/50"> /night</span></p>
              <p className="text-sm flex items-center gap-1"><Star size={13} className="fill-[#D4AF37] text-[#D4AF37]" /> {villa.rating}</p>
            </div>

            <div className="mt-6 rounded-2xl border border-black/10 overflow-hidden">
              <Popover>
                <PopoverTrigger asChild>
                  <button data-testid="widget-dates" type="button" className="w-full grid grid-cols-2 text-left">
                    <div className="p-4 border-r border-black/10">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-[#1A1A1A]/50">Check-in</p>
                      <p className="mt-1 text-sm font-medium">{range.from ? format(range.from, "MMM d, yyyy") : "Select"}</p>
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-[#1A1A1A]/50">Check-out</p>
                      <p className="mt-1 text-sm font-medium">{range.to ? format(range.to, "MMM d, yyyy") : "Select"}</p>
                    </div>
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
              <div className="border-t border-black/10 p-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[#1A1A1A]/50">Guests</p>
                <select
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  data-testid="widget-guests"
                  className="mt-1 w-full bg-transparent text-sm font-medium focus:outline-none"
                >
                  {Array.from({ length: villa.guests }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? "guest" : "guests"}</option>
                  ))}
                </select>
              </div>
            </div>

            {nights > 0 && (
              <div className="mt-6 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-[#1A1A1A]/60">${villa.price_per_night} × {nights} nights</span><span>${subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-[#1A1A1A]/60">Cleaning fee</span><span>${cleaningFee}</span></div>
                <div className="flex justify-between"><span className="text-[#1A1A1A]/60">Taxes (11%)</span><span>${taxes.toLocaleString()}</span></div>
                <div className="flex justify-between pt-3 border-t border-black/10 font-medium"><span>Total</span><span>${total.toLocaleString()}</span></div>
              </div>
            )}

            <button
              data-testid="widget-reserve"
              onClick={proceed}
              disabled={!range.from || !range.to}
              className="mt-6 w-full btn-gold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reserve
            </button>
            <p className="mt-3 text-xs text-center text-[#1A1A1A]/50">You won't be charged yet</p>
          </div>
        </aside>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-24 container-luxe">
          <p className="label-eyebrow">You may also love</p>
          <h2 className="mt-4 font-serif text-4xl">Similar villas</h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-7">
            {related.map((v) => <VillaCard key={v.id} villa={v} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div>
      <Icon size={20} className="text-[#D4AF37]" strokeWidth={1.4} />
      <p className="mt-3 text-[10px] uppercase tracking-[0.28em] text-[#1A1A1A]/50">{label}</p>
      <p className="mt-1 text-base font-medium">{value}</p>
    </div>
  );
}
