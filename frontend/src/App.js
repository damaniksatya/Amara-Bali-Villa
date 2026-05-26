import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Toaster } from "./components/ui/sonner";

import Home from "./pages/Home";
import Villas from "./pages/Villas";
import VillaDetail from "./pages/VillaDetail";
import BookingRequest from "./pages/BookingRequest";
import BookingRequestSuccess from "./pages/BookingRequestSuccess";
import PayBooking from "./pages/PayBooking";
import BookingSuccess from "./pages/BookingSuccess";
import About from "./pages/About";
import Experiences from "./pages/Experiences";
import ExperienceDetail from "./pages/ExperienceDetail";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminContent from "./pages/AdminContent";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [pathname]);
  return null;
}

function ChromeShell({ children }) {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");
  return (
    <div className="App">
      {!isAdmin && <Navbar />}
      <main>{children}</main>
      {!isAdmin && <Footer />}
      {!isAdmin && (
        <a
          data-testid="whatsapp-floating"
          href="https://wa.me/6281000000000?text=Hello%20Amara%20Bali%2C%20I%20would%20like%20to%20enquire%20about%20a%20villa."
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-[#25D366] text-white px-5 py-3 text-sm shadow-2xl hover:scale-105 transition-transform"
        >
          <svg viewBox="0 0 32 32" width="18" height="18" fill="currentColor"><path d="M16.001 3.2c-7.07 0-12.8 5.73-12.8 12.8 0 2.26.6 4.47 1.74 6.41L3.2 28.8l6.6-1.73a12.74 12.74 0 0 0 6.2 1.59h.01c7.06 0 12.79-5.73 12.79-12.8 0-3.42-1.33-6.63-3.75-9.05A12.7 12.7 0 0 0 16.001 3.2zm0 23.36h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-3.92 1.03 1.05-3.82-.25-.4a10.62 10.62 0 1 1 8.92 4.9zm5.83-7.93c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.71.16s-.81 1.04-.99 1.25c-.18.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.57-.94-.84-1.58-1.87-1.77-2.19-.18-.32-.02-.5.14-.66.14-.14.32-.37.48-.55.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.55-.08-.16-.71-1.71-.97-2.34-.26-.62-.52-.53-.71-.54l-.61-.01c-.21 0-.55.08-.84.4s-1.1 1.07-1.1 2.62 1.13 3.04 1.29 3.25c.16.21 2.22 3.39 5.39 4.75.75.32 1.34.51 1.8.66.76.24 1.45.21 2 .13.61-.09 1.89-.77 2.16-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37z"/></svg>
          WhatsApp
        </a>
      )}
      <Toaster position="top-center" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ChromeShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/villas" element={<Villas />} />
          <Route path="/villas/:slug" element={<VillaDetail />} />
          <Route path="/booking/:villaSlug" element={<BookingRequest />} />
          <Route path="/booking/request-received/:id" element={<BookingRequestSuccess />} />
          <Route path="/booking/success" element={<BookingSuccess />} />
          <Route path="/pay/:id" element={<PayBooking />} />
          <Route path="/about" element={<About />} />
          <Route path="/experiences" element={<Experiences />} />
          <Route path="/experiences/:id" element={<ExperienceDetail />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/content" element={<AdminContent />} />
        </Routes>
      </ChromeShell>
    </BrowserRouter>
  );
}

export default App;
