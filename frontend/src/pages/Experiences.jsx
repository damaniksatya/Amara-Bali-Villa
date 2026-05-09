import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { fetchExperiences } from "../lib/api";

export default function Experiences() {
  const [items, setItems] = useState([]);
  useEffect(() => { fetchExperiences().then(setItems); }, []);

  return (
    <div data-testid="experiences-page" className="pt-32 pb-24">
      <div className="container-luxe">
        <p className="label-eyebrow">Experiences</p>
        <h1 className="mt-4 font-serif text-5xl sm:text-7xl tracking-tight max-w-4xl leading-[1.05]">
          The island, <em className="italic font-light">unhurriedly</em>.
        </h1>
        <p className="mt-8 max-w-2xl text-[#1A1A1A]/70 leading-relaxed">
          A small library of curated experiences — from floating breakfasts to sunrise temple ceremonies.
          Add any of the below to your stay; our concierge will arrange the rest.
        </p>
      </div>

      <div className="container-luxe mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {items.map((e, i) => (
          <article
            key={e.id}
            data-testid={`experience-card-${e.id}`}
            className="group luxe-card"
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img src={e.image} alt={e.name} className="w-full h-full object-cover img-zoom" />
            </div>
            <div className="p-7">
              <p className="text-xs text-[#D4AF37] tracking-[0.32em] uppercase">0{i + 1}</p>
              <h3 className="mt-3 font-serif text-2xl">{e.name}</h3>
              <p className="mt-3 text-sm text-[#1A1A1A]/65 line-clamp-3 leading-relaxed">{e.description}</p>
              <div className="mt-6 flex items-end justify-between pt-5 border-t border-black/5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[#1A1A1A]/50">From</p>
                  <p className="font-serif text-xl">${e.price_from}</p>
                </div>
                <Link
                  to="/contact"
                  data-testid={`experience-cta-${e.id}`}
                  className="text-xs uppercase tracking-[0.28em] text-[#D4AF37] inline-flex items-center gap-2 group-hover:text-[#1A1A1A]"
                >
                  Enquire <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
