import { useState } from "react";
import { MessageCircle, Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { sendContact } from "../lib/api";
import { toast } from "sonner";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await sendContact(form);
      toast.success("Message sent — we'll be in touch within 24 hours.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      toast.error("Could not send. Please try again or message us on WhatsApp.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="contact-page" className="pt-32 pb-24">
      <div className="container-luxe">
        <p className="label-eyebrow">Contact</p>
        <h1 className="mt-4 font-serif text-5xl sm:text-7xl tracking-tight max-w-4xl leading-[1.05]">
          Hello, <em className="italic font-light">we'd love to hear from you</em>.
        </h1>
        <p className="mt-8 max-w-xl text-[#1A1A1A]/70 leading-relaxed">
          For villa availability, custom experiences, or anything else — drop us a line. Our concierge replies within a few hours, often faster.
        </p>
      </div>

      <div className="container-luxe mt-20 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <aside className="lg:col-span-4 space-y-10">
          <ContactItem icon={MessageCircle} label="WhatsApp" value="+62 819 0000 7777" href="https://wa.me/6281900007777" />
          <ContactItem icon={Mail} label="Email" value="stay@amarabali.co" href="mailto:stay@amarabali.co" />
          <ContactItem icon={Phone} label="Phone" value="+62 361 000 333" href="tel:+62361000333" />
          <ContactItem icon={MapPin} label="Atelier" value="Jl. Petitenget 88, Seminyak, Bali" />

          <div className="rounded-2xl overflow-hidden aspect-[4/3]">
            <iframe
              title="Atelier location"
              src="https://www.google.com/maps?q=-8.6755,115.1597&hl=en&z=14&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>
        </aside>

        <form onSubmit={submit} data-testid="contact-form" className="lg:col-span-8 luxe-card p-8 sm:p-12 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Your name">
              <input data-testid="contact-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="luxe-input" />
            </Field>
            <Field label="Email">
              <input data-testid="contact-email" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="luxe-input" />
            </Field>
            <Field label="Phone (optional)">
              <input data-testid="contact-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="luxe-input" />
            </Field>
            <Field label="Subject">
              <input data-testid="contact-subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="luxe-input" />
            </Field>
          </div>
          <Field label="Message">
            <textarea data-testid="contact-message" required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="luxe-input" placeholder="Tell us about your trip — dates, party size, preferred location, occasion…" />
          </Field>
          <button data-testid="contact-submit" disabled={busy} className="btn-gold inline-flex items-center gap-2">
            {busy ? <><Loader2 size={15} className="animate-spin" /> Sending…</> : <>Send message <Send size={15} /></>}
          </button>
        </form>
      </div>

      <style>{`
        .luxe-input {
          width: 100%; background: transparent;
          border: 1px solid rgba(0,0,0,0.10);
          border-radius: 12px; padding: 14px 16px;
          font-size: 14px; transition: border-color .25s ease;
        }
        .luxe-input:focus { outline: none; border-color: #D4AF37; }
      `}</style>
    </div>
  );
}

function ContactItem({ icon: Icon, label, value, href }) {
  const inner = (
    <>
      <p className="text-[10px] uppercase tracking-[0.28em] text-[#1A1A1A]/50 flex items-center gap-2"><Icon size={12} className="text-[#D4AF37]" /> {label}</p>
      <p className="mt-2 font-serif text-xl">{value}</p>
    </>
  );
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className="block hover:text-[#D4AF37] transition-colors">{inner}</a>
  ) : (
    <div>{inner}</div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.28em] text-[#1A1A1A]/50">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
