import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/villas", label: "Villa" },
  { to: "/about", label: "About Us" },
  { to: "/experiences", label: "Experience" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const transparent = isHome && !scrolled;
  const textCls = transparent ? "text-white" : "text-[#1A1A1A]";
  const barCls = transparent
    ? "bg-transparent border-transparent"
    : "bg-white/85 backdrop-blur-xl border-black/5";

  return (
    <header
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-500 ${barCls}`}
    >
      <div className="container-luxe flex h-20 items-center justify-between">
        <Link to="/" data-testid="navbar-logo" className={`flex items-center gap-2 ${textCls}`}>
          <span className="font-serif text-2xl tracking-tight">Amara</span>
          <span className="text-xs uppercase tracking-[0.4em] opacity-70">Bali</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-9">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={`nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
              className={({ isActive }) =>
                `text-sm tracking-wide transition-opacity duration-300 ${textCls} ${
                  isActive ? "opacity-100" : "opacity-70 hover:opacity-100"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex">
          <Link
            to="/villas"
            data-testid="navbar-book-now"
            className={
              transparent
                ? "inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-medium text-[#1A1A1A] transition-colors duration-300 hover:bg-[#D4AF37]"
                : "btn-gold !py-2.5 !px-6"
            }
          >
            Book Now
          </Link>
        </div>

        <button
          data-testid="navbar-mobile-toggle"
          onClick={() => setOpen((v) => !v)}
          className={`lg:hidden ${textCls}`}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-white border-t border-black/5">
          <div className="container-luxe py-6 flex flex-col gap-4">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                data-testid={`nav-mobile-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-base text-[#1A1A1A] py-2 border-b border-black/5"
              >
                {l.label}
              </NavLink>
            ))}
            <Link to="/villas" data-testid="navbar-mobile-book-now" className="btn-gold mt-2 w-full">
              Book Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
