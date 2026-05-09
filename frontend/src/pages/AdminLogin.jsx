import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2 } from "lucide-react";
import { adminLogin, setAuthToken, getAuthToken, adminMe } from "../lib/api";
import { toast } from "sonner";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@amarabali.co");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (getAuthToken()) {
      adminMe()
        .then(() => navigate("/admin"))
        .catch(() => setAuthToken(null));
    }
  }, [navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const data = await adminLogin(email, password);
      setAuthToken(data.access_token);
      toast.success("Welcome back.");
      navigate("/admin");
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="admin-login-page" className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1728049006562-236e5b0dddea?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600"
          alt="Bali villa"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-black/60" />
        <div className="relative z-10 p-16 self-end text-white">
          <p className="text-xs uppercase tracking-[0.4em] text-[#D4AF37]">Concierge Console</p>
          <h2 className="mt-4 font-serif text-5xl leading-[1.05]">Amara <em className="italic font-light">Bali</em></h2>
          <p className="mt-6 max-w-md text-white/70 leading-relaxed">
            For our hospitality team only. Sign in to manage booking requests and send secure payment links.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-20 bg-[#FAFAFA]">
        <form onSubmit={submit} data-testid="admin-login-form" className="w-full max-w-sm">
          <p className="label-eyebrow">Admin sign in</p>
          <h1 className="mt-3 font-serif text-4xl tracking-tight">Welcome back.</h1>
          <p className="mt-3 text-sm text-[#1A1A1A]/60">Enter your concierge credentials to continue.</p>

          <div className="mt-10 space-y-5">
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.28em] text-[#1A1A1A]/50">Email</span>
              <input
                data-testid="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full px-4 py-3 rounded-xl border border-black/10 focus:border-[#D4AF37] focus:outline-none text-sm"
                autoComplete="email"
              />
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.28em] text-[#1A1A1A]/50">Password</span>
              <input
                data-testid="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full px-4 py-3 rounded-xl border border-black/10 focus:border-[#D4AF37] focus:outline-none text-sm"
                autoComplete="current-password"
              />
            </label>
          </div>

          <button data-testid="admin-submit" disabled={busy} className="mt-8 btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-60">
            {busy ? <><Loader2 size={15} className="animate-spin" /> Signing in…</> : <><Lock size={14} /> Sign in</>}
          </button>
        </form>
      </div>
    </div>
  );
}
