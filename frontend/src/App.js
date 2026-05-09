import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Villas from "./pages/Villas";
import VillaDetail from "./pages/VillaDetail";
import Booking from "./pages/Booking";
import BookingSuccess from "./pages/BookingSuccess";
import About from "./pages/About";
import Experiences from "./pages/Experiences";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Contact from "./pages/Contact";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/villas" element={<Villas />} />
          <Route path="/villas/:slug" element={<VillaDetail />} />
          <Route path="/booking/:villaSlug" element={<Booking />} />
          <Route path="/booking/success" element={<BookingSuccess />} />
          <Route path="/about" element={<About />} />
          <Route path="/experiences" element={<Experiences />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
