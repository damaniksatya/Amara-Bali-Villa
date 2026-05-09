import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star, ShieldCheck, Sparkles, Compass, Lock, Headphones, BadgeCheck } from "lucide-react";
import SearchForm from "../components/SearchForm";
import VillaCard from "../components/VillaCard";
import {
  fetchVillas,
  fetchCategories,
  fetchDestinations,
  fetchTestimonials,
  fetchBlog,
} from "../lib/api";

const HERO_IMAGE = "https://images.unsplash.com/photo-1728049006562-236e5b0dddea?crop=entropy&cs=srgb&fm=jpg&q=85&w=2400";

const BENEFITS = [
  { icon: BadgeCheck, title: "Verified Luxury Villas", desc: "Each villa is personally inspected by our local team before listing." },
  { icon: ShieldCheck, title: "Best Price Guarantee", desc: "We will match — and beat — any like-for-like rate found elsewhere." },
  { icon: Sparkles, title: "Personalised Concierge", desc: "From private chefs to curated tours, we shape every day around you." },
  { icon: Compass, title: "Local Bali Experts", desc: "Our team has lived and worked across the island for over a decade." },
  { icon: Lock, title: "Secure Booking Process", desc: "Encrypted Stripe payments and clear, written booking confirmations." },
  { icon: Headphones, title: "24/7 Guest Support", desc: "On-island support every hour of your stay — by phone, email or WhatsApp." },
];

export default function Home() {
  const [villas, setVillas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [blog, setBlog] = useState([]);

  useEffect(() => {
    Promise.all([
      fetchVillas({ featured: true }),
      fetchCategories(),
      fetchDestinations(),
      fetchTestimonials(),
      fetchBlog(),
    ])
      .then(([v, c, d, t, b]) => {
        setVillas(v.slice(0, 6));
        setCategories(c);
        setDestinations(d);
        setTestimonials(t);
        setBlog(b.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative min-h-[100vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMAGE} alt="Luxury Bali villa" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70" />
        </div>
        <div className="relative container-luxe pb-12 md:pb-16 pt-32 w-full">
          <div className="max-w-3xl text-white animate-fade-up">
            <p className="text-xs uppercase tracking-[0.4em] text-[#D4AF37]" data-testid="hero-eyebrow">A Curated Collection of Bali Villas</p>
            <h1 className="mt-6 font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
              Find Your Perfect <em className="italic font-light">Luxury Villa</em> in Bali
            </h1>
            <p className="mt-6 text-base sm:text-lg text-white/80 max-w-xl leading-relaxed">
              Handpicked private estates with personalised hospitality — staffed, considered and quietly extraordinary.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/villas" data-testid="hero-cta-browse" className="btn-gold">Browse Villas</Link>
              <Link to="/experiences" data-testid="hero-cta-experiences" className="inline-flex items-center justify-center rounded-full border border-white/40 text-white px-7 py-3 text-sm font-medium tracking-wide hover:bg-white hover:text-[#1A1A1A] transition-all duration-300">
                View Experiences
              </Link>
            </div>
          </div>

          <div className="mt-12 md:mt-16 max-w-5xl">
            <SearchForm variant="hero" />
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-24 sm:py-32 bg-[#FAFAFA]">
        <div className="container-luxe">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="label-eyebrow">Collections</p>
              <h2 className="mt-4 font-serif text-4xl sm:text-5xl tracking-tight">Curated by Occasion</h2>
            </div>
            <p className="max-w-md text-sm text-[#1A1A1A]/60 leading-relaxed">
              Six considered collections, each shaped around a way of staying — from oceanfront to highland sanctuary.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((c, i) => (
              <Link
                key={c.slug}
                to={`/villas?category=${c.slug}`}
                data-testid={`category-card-${c.slug}`}
                className="group relative overflow-hidden rounded-2xl aspect-[4/5] block"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <img src={c.image} alt={c.name} className="absolute inset-0 w-full h-full object-cover img-zoom" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-7 text-white">
                  <h3 className="font-serif text-3xl">{c.name}</h3>
                  <p className="mt-2 text-sm text-white/75 max-w-xs">{c.description}</p>
                  <div className="mt-5 flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-[#D4AF37]">
                    Explore <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section className="py-24 sm:py-32 bg-[#F4F1EA]">
        <div className="container-luxe">
          <div className="text-center max-w-2xl mx-auto">
            <p className="label-eyebrow">Destinations</p>
            <h2 className="mt-4 font-serif text-4xl sm:text-5xl tracking-tight">Where Will You Stay?</h2>
            <p className="mt-6 text-[#1A1A1A]/60 leading-relaxed">
              Four corners of Bali, each with its own pace and personality. Choose the rhythm that suits the trip.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((d) => (
              <Link
                key={d.slug}
                to={`/villas?location=${d.name.split(" ")[0]}`}
                data-testid={`destination-card-${d.slug}`}
                className="group block luxe-card"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img src={d.image} alt={d.name} className="w-full h-full object-cover img-zoom" />
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-2xl">{d.name}</h3>
                  <p className="mt-2 text-sm text-[#1A1A1A]/60 line-clamp-2 leading-relaxed">{d.description}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.28em] text-[#1A1A1A]/50">{d.villa_count} villas</span>
                    <span className="text-xs uppercase tracking-[0.28em] text-[#D4AF37] group-hover:text-[#1A1A1A]">Discover →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED VILLAS */}
      <section className="py-24 sm:py-32 bg-[#FAFAFA]">
        <div className="container-luxe">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="label-eyebrow">Featured</p>
              <h2 className="mt-4 font-serif text-4xl sm:text-5xl tracking-tight">Villas of the Season</h2>
            </div>
            <Link to="/villas" data-testid="featured-view-all" className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] hover:text-[#1A1A1A] transition-colors">
              View Full Collection →
            </Link>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {villas.map((v) => (
              <VillaCard key={v.id} villa={v} />
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-24 sm:py-32 bg-[#1A1A1A] text-white">
        <div className="container-luxe">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.32em] text-[#D4AF37]">Why Amara</p>
            <h2 className="mt-4 font-serif text-4xl sm:text-5xl tracking-tight">A Quietly Considered Way to Travel</h2>
            <p className="mt-6 text-white/60 leading-relaxed">
              Fifteen years of hospitality on the island, distilled into six promises that shape every stay.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden">
            {BENEFITS.map((b, i) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  data-testid={`benefit-${i}`}
                  className="p-10 bg-[#1A1A1A] hover:bg-[#252525] transition-colors duration-500"
                >
                  <Icon size={28} className="text-[#D4AF37]" strokeWidth={1.4} />
                  <h3 className="mt-6 font-serif text-2xl">{b.title}</h3>
                  <p className="mt-3 text-sm text-white/60 leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 sm:py-32 bg-[#F4F1EA]">
        <div className="container-luxe">
          <div className="text-center max-w-2xl mx-auto">
            <p className="label-eyebrow">Guest Stories</p>
            <h2 className="mt-4 font-serif text-4xl sm:text-5xl tracking-tight">Words From Our Guests</h2>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t, i) => (
              <article
                key={i}
                data-testid={`testimonial-${i}`}
                className="bg-white rounded-2xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                <div className="flex gap-1 text-[#D4AF37]">
                  {Array.from({ length: t.rating }).map((_, idx) => <Star key={idx} size={14} className="fill-[#D4AF37]" />)}
                </div>
                <p className="mt-6 font-serif text-2xl italic text-[#1A1A1A] leading-relaxed">
                  &ldquo;{t.review}&rdquo;
                </p>
                <div className="mt-8 flex items-center gap-4 pt-6 border-t border-black/5">
                  <img src={t.photo} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-xs text-[#1A1A1A]/50">{t.country}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section className="py-24 sm:py-32 bg-[#FAFAFA]">
        <div className="container-luxe">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="label-eyebrow">Journal</p>
              <h2 className="mt-4 font-serif text-4xl sm:text-5xl tracking-tight">Travel Inspiration & Bali Guides</h2>
            </div>
            <Link to="/blog" data-testid="blog-view-all" className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] hover:text-[#1A1A1A] transition-colors">
              All Articles →
            </Link>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-7">
            {blog.map((p) => (
              <Link
                key={p.slug}
                to={`/blog/${p.slug}`}
                data-testid={`blog-card-${p.slug}`}
                className="group luxe-card block"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={p.cover} alt={p.title} className="w-full h-full object-cover img-zoom" />
                </div>
                <div className="p-7">
                  <p className="text-[10px] uppercase tracking-[0.32em] text-[#D4AF37]">{p.category} · {p.read_time} min read</p>
                  <h3 className="mt-4 font-serif text-2xl leading-tight">{p.title}</h3>
                  <p className="mt-3 text-sm text-[#1A1A1A]/60 line-clamp-2 leading-relaxed">{p.excerpt}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors">
                    Read More <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
