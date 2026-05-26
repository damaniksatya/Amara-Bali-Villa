import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { fetchExperience, fetchExperiences } from "../lib/api";

export default function ExperienceDetail() {
  const { id } = useParams();
  const [experience, setExperience] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);

    fetchExperience(id)
      .then((data) => setExperience(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));

    fetchExperiences()
      .then((all) => setRelated(all.filter((item) => item.id !== id).slice(0, 3)))
      .catch(() => setRelated([]));
  }, [id]);

  if (loading) {
    return <div className="pt-40 container-luxe">Loading…</div>;
  }

  if (error || !experience) {
    return (
      <div className="pt-40 container-luxe text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-[#D4AF37]">Experience not found</p>
        <h1 className="mt-4 font-serif text-4xl">We could not find that experience.</h1>
        <Link to="/experiences" className="mt-8 inline-flex items-center gap-2 text-sm uppercase tracking-[0.28em] text-[#1A1A1A] hover:text-[#D4AF37]">
          <ArrowLeft size={14} /> Back to Experiences
        </Link>
      </div>
    );
  }

  return (
    <div data-testid="experience-detail-page" className="pt-24 pb-24">
      <div className="relative h-[60vh] overflow-hidden rounded-b-[3rem] bg-[#F4F1EA]">
        <img src={experience.image} alt={experience.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-10">
          <div className="container-luxe text-white">
            <Link to="/experiences" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/70 hover:text-[#D4AF37]">
              <ArrowLeft size={14} /> Back to Experiences
            </Link>
            <p className="mt-6 text-[10px] uppercase tracking-[0.32em] text-[#D4AF37]">Experience</p>
            <h1 className="mt-4 font-serif text-5xl sm:text-6xl tracking-tight max-w-4xl">{experience.name}</h1>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/80">{experience.description}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm uppercase tracking-[0.28em] text-white/90">From ${experience.price_from}</span>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-5 py-3 text-sm font-medium text-white shadow-lg shadow-[#D4AF37]/20 hover:bg-[#c9b35d] transition-colors">
                Enquire now <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-luxe mt-20 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <section>
            <h2 className="font-serif text-4xl">About this experience</h2>
            <p className="mt-6 max-w-3xl text-[#1A1A1A]/75 leading-relaxed whitespace-pre-line">{experience.description}</p>
          </section>

          <section className="mt-16">
            <h2 className="font-serif text-4xl">Need help adding it to your stay?</h2>
            <p className="mt-6 max-w-3xl text-[#1A1A1A]/75 leading-relaxed">
              Our concierge can help you book this experience alongside your villa stay. Send a message through the contact page and we’ll take care of timings, transport and any special requests.
            </p>
          </section>

          {related.length > 0 && (
            <section className="mt-16">
              <p className="label-eyebrow">Related experiences</p>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((item) => (
                  <Link key={item.id} to={`/experiences/${item.id}`} className="group luxe-card block overflow-hidden">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </div>
                    <div className="p-6">
                      <p className="text-[10px] uppercase tracking-[0.32em] text-[#D4AF37]">{item.name}</p>
                      <p className="mt-3 text-sm text-[#1A1A1A]/70 line-clamp-3">{item.description}</p>
                      <div className="mt-5 text-sm uppercase tracking-[0.28em] text-[#D4AF37] flex items-center gap-2">
                        View details <ArrowRight size={12} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:col-span-4 space-y-6">
          <div className="luxe-card p-7">
            <p className="text-xs uppercase tracking-[0.28em] text-[#1A1A1A]/50">What’s included</p>
            <ul className="mt-5 space-y-3 text-sm text-[#1A1A1A]/75 leading-relaxed">
              <li>Private coordination with our concierge team</li>
              <li>All bookings and confirmations handled on your behalf</li>
              <li>Flexible timing based on your villa schedule</li>
              <li>Local suppliers and premium service standards</li>
            </ul>
          </div>
          <div className="luxe-card p-7 bg-[#F4F1EA]">
            <p className="text-xs uppercase tracking-[0.28em] text-[#1A1A1A]/50">Starting price</p>
            <p className="mt-4 font-serif text-4xl">${experience.price_from}</p>
            <p className="mt-4 text-sm text-[#1A1A1A]/70">Please enquire to confirm availability and final price.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
