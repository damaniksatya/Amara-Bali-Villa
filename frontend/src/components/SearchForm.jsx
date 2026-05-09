import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, MapPin, BedDouble, Search } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const DESTINATIONS = ["Any destination", "Canggu", "Seminyak", "Ubud", "Jimbaran", "Uluwatu"];

export default function SearchForm({ variant = "hero" }) {
  const navigate = useNavigate();
  const [dest, setDest] = useState("Any destination");
  const [bedrooms, setBedrooms] = useState("any");
  const [range, setRange] = useState({ from: undefined, to: undefined });

  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (dest && dest !== "Any destination") params.set("location", dest);
    if (bedrooms !== "any") params.set("bedrooms", bedrooms);
    if (range.from) params.set("check_in", format(range.from, "yyyy-MM-dd"));
    if (range.to) params.set("check_out", format(range.to, "yyyy-MM-dd"));
    navigate(`/villas?${params.toString()}`);
  };

  const wrapper =
    variant === "hero"
      ? "bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-3 md:p-4"
      : "bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.05)] border border-black/5 p-3 md:p-4";

  return (
    <form
      data-testid="search-form"
      onSubmit={submit}
      className={`${wrapper} grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-1`}
    >
      <div className="md:col-span-3 px-4 py-3 md:border-r md:border-black/10">
        <label className="text-[10px] uppercase tracking-[0.28em] text-[#1A1A1A]/50 flex items-center gap-2"><MapPin size={11} /> Destination</label>
        <Select value={dest} onValueChange={setDest}>
          <SelectTrigger data-testid="search-destination" className="border-0 px-0 h-auto py-1 text-sm font-medium text-[#1A1A1A] focus:ring-0 shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DESTINATIONS.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="md:col-span-5 px-4 py-3 md:border-r md:border-black/10">
        <label className="text-[10px] uppercase tracking-[0.28em] text-[#1A1A1A]/50 flex items-center gap-2"><CalendarIcon size={11} /> Dates</label>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              data-testid="search-dates"
              className="w-full text-left text-sm font-medium text-[#1A1A1A] py-1"
            >
              {range.from
                ? range.to
                  ? `${format(range.from, "MMM d")} – ${format(range.to, "MMM d, yyyy")}`
                  : format(range.from, "MMM d, yyyy")
                : "Add check-in & check-out"}
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
      </div>

      <div className="md:col-span-2 px-4 py-3 md:border-r md:border-black/10">
        <label className="text-[10px] uppercase tracking-[0.28em] text-[#1A1A1A]/50 flex items-center gap-2"><BedDouble size={11} /> Bedrooms</label>
        <Select value={bedrooms} onValueChange={setBedrooms}>
          <SelectTrigger data-testid="search-bedrooms" className="border-0 px-0 h-auto py-1 text-sm font-medium text-[#1A1A1A] focus:ring-0 shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any size</SelectItem>
            <SelectItem value="1">1+ bedroom</SelectItem>
            <SelectItem value="2">2+ bedrooms</SelectItem>
            <SelectItem value="3">3+ bedrooms</SelectItem>
            <SelectItem value="4">4+ bedrooms</SelectItem>
            <SelectItem value="5">5+ bedrooms</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="md:col-span-2 flex">
        <button
          data-testid="search-submit"
          type="submit"
          className="w-full h-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1A1A1A] text-white text-sm font-medium tracking-wide py-4 px-5 transition-colors duration-300 hover:bg-[#D4AF37] hover:text-[#1A1A1A]"
        >
          <Search size={15} /> Browse Villas
        </button>
      </div>
    </form>
  );
}
