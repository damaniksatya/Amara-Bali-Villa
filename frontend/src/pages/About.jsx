import { Link } from "react-router-dom";

const VALUES = [
  { title: "Slowness", desc: "We design every detail of a stay so guests arrive, exhale, and stop counting hours." },
  { title: "Locality", desc: "We work with Balinese artisans, growers and ceremonialists — and pay them above market." },
  { title: "Privacy", desc: "Each villa is yours alone. Staff are present only when wanted, never visible when not." },
  { title: "Care", desc: "Hospitality, in our reading, is the small acts: a flower at turndown, a chilled towel at the gate." },
];

const TEAM = [
  { name: "Made Wirawan", role: "Founder & Hospitality Director", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&q=85&w=800" },
  { name: "Putu Ayu", role: "Head of Villa Curation", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=srgb&fm=jpg&q=85&w=800" },
  { name: "Kadek Pradnyani", role: "Wedding & Events Curator", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=srgb&fm=jpg&q=85&w=800" },
  { name: "Wayan Suparta", role: "Concierge Lead", photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?crop=entropy&cs=srgb&fm=jpg&q=85&w=800" },
];

export default function About() {
  return (
    <div data-testid="about-page" className="pt-32 pb-24">
      {/* Hero */}
      <section className="container-luxe">
        <p className="label-eyebrow">Our Story</p>
        <h1 className="mt-4 font-serif text-5xl sm:text-7xl tracking-tight max-w-4xl leading-[1.05]">
          A small studio of <em className="italic font-light">hospitality</em>, rooted on the island of Bali.
        </h1>
        <p className="mt-8 max-w-2xl text-[#1A1A1A]/70 leading-relaxed">
          Amara was born in 2011 from a single villa in Seminyak and a notebook of guest preferences.
          Fifteen years on we curate a small portfolio across Canggu, Seminyak, Ubud, Jimbaran and Uluwatu —
          each property kept to the same exacting standards, each stay shaped by the same small team.
        </p>
      </section>

      {/* Image */}
      <section className="mt-20">
        <div className="relative aspect-[16/8] w-full overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1721050739056-fb12f9663f23?crop=entropy&cs=srgb&fm=jpg&q=85&w=2400"
            alt="Bali villa pool"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Numbers */}
      <section className="container-luxe mt-24 grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-6 text-center">
        {[
          ["15+", "Years on the island"],
          ["32", "Villas in our care"],
          ["4,800+", "Guests welcomed"],
          ["48", "Local staff & guides"],
        ].map(([n, l]) => (
          <div key={l}>
            <p className="font-serif text-5xl">{n}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.28em] text-[#1A1A1A]/50">{l}</p>
          </div>
        ))}
      </section>

      {/* Values */}
      <section className="container-luxe mt-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <p className="label-eyebrow">What guides us</p>
            <h2 className="mt-4 font-serif text-4xl sm:text-5xl tracking-tight">Four quiet values</h2>
          </div>
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
            {VALUES.map((v, i) => (
              <div key={v.title}>
                <p className="text-xs text-[#D4AF37] tracking-[0.32em] uppercase">0{i + 1}</p>
                <h3 className="mt-3 font-serif text-2xl">{v.title}</h3>
                <p className="mt-3 text-sm text-[#1A1A1A]/65 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="container-luxe mt-32">
        <p className="label-eyebrow">The Studio</p>
        <h2 className="mt-4 font-serif text-4xl sm:text-5xl tracking-tight max-w-2xl">A small team, on the ground.</h2>
        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map((m) => (
            <div key={m.name} className="luxe-card overflow-hidden">
              <div className="aspect-[3/4] overflow-hidden">
                <img src={m.photo} alt={m.name} className="w-full h-full object-cover img-zoom" />
              </div>
              <div className="p-5">
                <p className="font-serif text-xl">{m.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.24em] text-[#1A1A1A]/60">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-luxe mt-32">
        <div className="bg-[#1A1A1A] text-white rounded-2xl p-12 sm:p-20 text-center">
          <h2 className="font-serif text-4xl sm:text-5xl tracking-tight">Plan your stay with us</h2>
          <p className="mt-4 text-white/60 max-w-xl mx-auto">Speak with a curator, share your dates, and we'll shape the rest.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/villas" className="btn-gold">Browse Villas</Link>
            <Link to="/contact" className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-3 text-sm hover:bg-white hover:text-[#1A1A1A] transition-all">Contact us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
