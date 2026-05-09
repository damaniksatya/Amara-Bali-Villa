import { Link } from "react-router-dom";
import { Instagram, Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { subscribeNewsletter } from "../lib/api";
import { toast } from "sonner";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    try {
      await subscribeNewsletter(email);
      toast.success("Welcome to the journal — we'll be in touch.");
      setEmail("");
    } catch {
      toast.error("Could not subscribe. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <footer data-testid="footer" className="bg-[#1A1A1A] text-white/80 mt-24">
      <div className="container-luxe py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <div className="flex items-baseline gap-3">
              <h3 className="font-serif text-3xl text-white">Amara Bali</h3>
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#D4AF37]">Est. 2011</span>
            </div>
            <p className="mt-6 text-sm leading-relaxed max-w-md text-white/60">
              A small collection of the most thoughtfully kept private villas across Bali — each
              hand-selected, each staffed, each curated by our local hospitality team.
            </p>
            <form data-testid="newsletter-form" onSubmit={submit} className="mt-10 flex max-w-md">
              <input
                data-testid="newsletter-email-input"
                type="email"
                required
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4AF37]"
              />
              <button
                data-testid="newsletter-submit"
                disabled={busy}
                className="ml-4 text-xs uppercase tracking-[0.3em] text-[#D4AF37] hover:text-white transition-colors duration-300"
              >
                {busy ? "..." : "Subscribe"}
              </button>
            </form>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs uppercase tracking-[0.32em] text-[#D4AF37]">Explore</h4>
            <ul className="mt-6 space-y-3 text-sm">
              <li><Link to="/villas" className="hover:text-white transition-colors">Villas</Link></li>
              <li><Link to="/experiences" className="hover:text-white transition-colors">Experiences</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Journal</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs uppercase tracking-[0.32em] text-[#D4AF37]">Destinations</h4>
            <ul className="mt-6 space-y-3 text-sm">
              <li><Link to="/villas?location=Canggu" className="hover:text-white transition-colors">Canggu</Link></li>
              <li><Link to="/villas?location=Seminyak" className="hover:text-white transition-colors">Seminyak</Link></li>
              <li><Link to="/villas?location=Ubud" className="hover:text-white transition-colors">Ubud</Link></li>
              <li><Link to="/villas?location=Jimbaran" className="hover:text-white transition-colors">Jimbaran</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs uppercase tracking-[0.32em] text-[#D4AF37]">Atelier</h4>
            <ul className="mt-6 space-y-3 text-sm text-white/60">
              <li className="flex items-start gap-3"><MapPin size={14} className="mt-0.5 text-[#D4AF37]" /> Jl. Petitenget 88, Seminyak, Bali</li>
              <li className="flex items-center gap-3"><Phone size={14} className="text-[#D4AF37]" /> +62 361 0000 333</li>
              <li className="flex items-center gap-3"><Mail size={14} className="text-[#D4AF37]" /> stay@amarabali.co</li>
              <li className="flex items-center gap-3"><Instagram size={14} className="text-[#D4AF37]" /> @amara.bali</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
          <p>© {new Date().getFullYear()} Amara Bali Villas. All rights reserved.</p>
          <p>Crafted with care in Bali — for stays remembered.</p>
        </div>
      </div>
    </footer>
  );
}
