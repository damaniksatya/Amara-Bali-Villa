import { Link } from "react-router-dom";
import { Star, BedDouble, Bath, Users, MapPin, Heart } from "lucide-react";
import { useState } from "react";

export default function VillaCard({ villa, eager = false }) {
  const [fav, setFav] = useState(false);

  return (
    <Link
      to={`/villas/${villa.slug}`}
      data-testid={`villa-card-${villa.slug}`}
      className="group block luxe-card"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={villa.images[0]}
          alt={villa.name}
          loading={eager ? "eager" : "lazy"}
          className="w-full h-full object-cover img-zoom"
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setFav((v) => !v);
          }}
          data-testid={`villa-wishlist-${villa.slug}`}
          aria-label="Add to wishlist"
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center transition-transform duration-300 hover:scale-110"
        >
          <Heart size={16} className={fav ? "fill-[#D4AF37] text-[#D4AF37]" : "text-[#1A1A1A]"} />
        </button>
        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur text-[10px] uppercase tracking-[0.24em] text-[#1A1A1A]">
          {villa.type}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-2xl leading-tight text-[#1A1A1A]">{villa.name}</h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-[#1A1A1A]/60">
              <MapPin size={13} /> {villa.location}, Bali
            </p>
          </div>
          <div className="flex items-center gap-1 text-sm text-[#1A1A1A]">
            <Star size={14} className="fill-[#D4AF37] text-[#D4AF37]" />
            <span className="font-medium">{villa.rating}</span>
          </div>
        </div>

        <p className="mt-4 text-sm text-[#1A1A1A]/70 leading-relaxed line-clamp-2">
          {villa.short_description}
        </p>

        <div className="mt-5 flex items-center gap-5 text-xs text-[#1A1A1A]/60">
          <span className="flex items-center gap-1.5"><BedDouble size={13} /> {villa.bedrooms} bd</span>
          <span className="flex items-center gap-1.5"><Bath size={13} /> {villa.bathrooms} ba</span>
          <span className="flex items-center gap-1.5"><Users size={13} /> {villa.guests} guests</span>
        </div>

        <div className="mt-6 pt-5 border-t border-black/5 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#1A1A1A]/50">From</p>
            <p className="font-serif text-2xl text-[#1A1A1A]">
              ${villa.price_per_night.toLocaleString()}
              <span className="text-sm font-sans text-[#1A1A1A]/50"> /night</span>
            </p>
          </div>
          <span className="text-xs uppercase tracking-[0.28em] text-[#D4AF37] group-hover:text-[#1A1A1A] transition-colors">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}
