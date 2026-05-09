import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import { fetchBlog } from "../lib/api";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [activeCat, setActiveCat] = useState("All");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (activeCat !== "All") params.category = activeCat;
    if (q) params.q = q;
    fetchBlog(params).then(setPosts).finally(() => setLoading(false));
  }, [activeCat, q]);

  const categories = ["All", "Travel Guide", "Travel Tips", "Honeymoon", "Food & Drink", "Weddings"];

  return (
    <div data-testid="blog-page" className="pt-32 pb-24">
      <div className="container-luxe">
        <p className="label-eyebrow">Journal</p>
        <h1 className="mt-4 font-serif text-5xl sm:text-7xl tracking-tight max-w-4xl leading-[1.05]">
          Travel inspiration & <em className="italic font-light">Bali guides</em>
        </h1>
        <p className="mt-8 max-w-2xl text-[#1A1A1A]/70 leading-relaxed">
          Editorial dispatches from our curators, concierges and chefs — slowly considered guides to the island we call home.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-6 sm:items-center sm:justify-between border-b border-black/5 pb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                data-testid={`blog-cat-${c.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and")}`}
                onClick={() => setActiveCat(c)}
                className={`text-xs uppercase tracking-[0.24em] rounded-full px-4 py-2 border transition-all ${
                  activeCat === c
                    ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                    : "bg-transparent text-[#1A1A1A] border-black/10 hover:border-[#1A1A1A]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40" />
            <input
              data-testid="blog-search"
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search articles…"
              className="w-full pl-10 pr-4 py-3 rounded-full bg-white border border-black/10 text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>

        {loading ? (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-7">
            {[1, 2, 3].map((i) => <div key={i} className="aspect-[4/3] rounded-2xl bg-[#F4F1EA] animate-pulse" />)}
          </div>
        ) : posts.length === 0 ? (
          <p className="mt-20 text-center text-[#1A1A1A]/60">No articles match your search.</p>
        ) : (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-7">
            {posts.map((p) => (
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
                  <p className="text-[10px] uppercase tracking-[0.32em] text-[#D4AF37]">{p.category} · {p.read_time} min</p>
                  <h3 className="mt-4 font-serif text-2xl leading-tight">{p.title}</h3>
                  <p className="mt-3 text-sm text-[#1A1A1A]/60 line-clamp-2 leading-relaxed">{p.excerpt}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors">
                    Read More <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
