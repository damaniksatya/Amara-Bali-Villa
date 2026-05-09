import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import VillaCard from "../components/VillaCard";
import SearchForm from "../components/SearchForm";
import { fetchVillas } from "../lib/api";
import { Slider } from "../components/ui/slider";
import { Checkbox } from "../components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

const AMENITIES = ["Private Pool", "Private Chef", "Beachfront", "WiFi", "Yoga Pavilion", "Spa Room"];
const TYPES = ["luxury", "beachfront", "family", "honeymoon", "wedding", "retreat"];

export default function Villas() {
  const [params, setParams] = useSearchParams();
  const [villas, setVillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([200, 1500]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sort, setSort] = useState("featured");

  const filters = useMemo(
    () => ({
      location: params.get("location") || undefined,
      category: params.get("category") || undefined,
      bedrooms: params.get("bedrooms") || undefined,
      guests: params.get("guests") || undefined,
    }),
    [params]
  );

  useEffect(() => {
    setLoading(true);
    const apiFilters = { ...filters };
    Object.keys(apiFilters).forEach((k) => apiFilters[k] === undefined && delete apiFilters[k]);
    fetchVillas(apiFilters)
      .then(setVillas)
      .finally(() => setLoading(false));
  }, [filters]);

  const filtered = useMemo(() => {
    let list = villas.filter(
      (v) => v.price_per_night >= priceRange[0] && v.price_per_night <= priceRange[1]
    );
    if (selectedAmenities.length) {
      list = list.filter((v) =>
        selectedAmenities.every((a) =>
          v.amenities.some((va) => va.toLowerCase().includes(a.toLowerCase()))
        )
      );
    }
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price_per_night - b.price_per_night);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price_per_night - a.price_per_night);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [villas, priceRange, selectedAmenities, sort]);

  const toggleAmenity = (a) => {
    setSelectedAmenities((p) => (p.includes(a) ? p.filter((x) => x !== a) : [...p, a]));
  };

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value && value !== "any") next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  const clearAll = () => {
    setParams(new URLSearchParams());
    setPriceRange([200, 1500]);
    setSelectedAmenities([]);
  };

  return (
    <div data-testid="villas-page" className="pt-32 pb-24">
      <div className="container-luxe">
        <div className="max-w-3xl">
          <p className="label-eyebrow">The Collection</p>
          <h1 className="mt-4 font-serif text-5xl sm:text-6xl tracking-tight">Bali Villas</h1>
          <p className="mt-6 text-[#1A1A1A]/60 leading-relaxed max-w-xl">
            A small, hand-picked portfolio of private villas across the island. Browse by location,
            occasion or amenity — or refine with the search below.
          </p>
        </div>

        <div className="mt-10">
          <SearchForm variant="page" />
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar filters */}
          <aside className="lg:col-span-3">
            <div className="sticky top-32 space-y-10">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-2xl">Filters</h3>
                <button
                  onClick={clearAll}
                  data-testid="clear-filters"
                  className="text-[10px] uppercase tracking-[0.3em] text-[#1A1A1A]/60 hover:text-[#D4AF37]"
                >
                  Clear all
                </button>
              </div>

              <div>
                <p className="label-eyebrow">Villa Type</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {TYPES.map((t) => {
                    const active = filters.category === t;
                    return (
                      <button
                        key={t}
                        data-testid={`filter-type-${t}`}
                        onClick={() => updateParam("category", active ? null : t)}
                        className={`text-xs uppercase tracking-[0.24em] rounded-full px-4 py-2 border transition-all duration-300 ${
                          active
                            ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                            : "bg-white text-[#1A1A1A] border-black/10 hover:border-[#1A1A1A]"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="label-eyebrow">Price per night</p>
                <div className="mt-6 px-1">
                  <Slider
                    data-testid="filter-price"
                    min={200}
                    max={2000}
                    step={50}
                    value={priceRange}
                    onValueChange={setPriceRange}
                  />
                  <div className="mt-3 flex justify-between text-xs text-[#1A1A1A]/60">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}+</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="label-eyebrow">Bedrooms</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["1", "2", "3", "4", "5"].map((b) => {
                    const active = filters.bedrooms === b;
                    return (
                      <button
                        key={b}
                        data-testid={`filter-bedrooms-${b}`}
                        onClick={() => updateParam("bedrooms", active ? null : b)}
                        className={`w-10 h-10 rounded-full text-sm border transition-all ${
                          active
                            ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                            : "bg-white text-[#1A1A1A] border-black/10 hover:border-[#1A1A1A]"
                        }`}
                      >
                        {b}+
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="label-eyebrow">Amenities</p>
                <div className="mt-4 space-y-3">
                  {AMENITIES.map((a) => (
                    <label key={a} className="flex items-center gap-3 cursor-pointer text-sm">
                      <Checkbox
                        data-testid={`filter-amenity-${a.replace(/\s+/g, "-").toLowerCase()}`}
                        checked={selectedAmenities.includes(a)}
                        onCheckedChange={() => toggleAmenity(a)}
                      />
                      {a}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Villa grid */}
          <div className="lg:col-span-9">
            <div className="flex items-center justify-between border-b border-black/5 pb-5">
              <p className="text-sm text-[#1A1A1A]/60" data-testid="villas-count">
                {loading ? "Loading…" : `${filtered.length} villas`}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-[0.28em] text-[#1A1A1A]/50">Sort</span>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-44 border-0 shadow-none focus:ring-0 text-sm" data-testid="villas-sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured first</SelectItem>
                    <SelectItem value="rating">Highest rated</SelectItem>
                    <SelectItem value="price-asc">Price low → high</SelectItem>
                    <SelectItem value="price-desc">Price high → low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-7">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-[4/3] rounded-2xl bg-[#F4F1EA] animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="mt-20 text-center">
                <p className="font-serif text-3xl">No villas match your filters</p>
                <p className="mt-3 text-[#1A1A1A]/60">Try widening the price range or clearing a filter.</p>
                <button onClick={clearAll} className="mt-8 btn-primary">Reset filters</button>
              </div>
            ) : (
              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-7">
                {filtered.map((v) => (
                  <VillaCard key={v.id} villa={v} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
