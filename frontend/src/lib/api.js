import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;
const TOKEN_KEY = "amara_admin_token";

const client = axios.create({ baseURL: API, headers: { "Content-Type": "application/json" } });

// Attach admin token if present
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  return config;
});

export const setAuthToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};
export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

// Public catalog
export const fetchVillas = (params = {}) => client.get("/villas", { params }).then((r) => r.data);
export const fetchVilla = (slug) => client.get(`/villas/${slug}`).then((r) => r.data);
export const fetchRelatedVillas = (slug) => client.get(`/villas/${slug}/related`).then((r) => r.data);
export const fetchCategories = () => client.get("/categories").then((r) => r.data);
export const fetchDestinations = () => client.get("/destinations").then((r) => r.data);
export const fetchExperiences = () => client.get("/experiences").then((r) => r.data);
export const fetchExperience = (id) => client.get(`/experiences/${id}`).then((r) => r.data);
export const fetchTestimonials = () => client.get("/testimonials").then((r) => r.data);
export const fetchBlog = (params = {}) => client.get("/blog", { params }).then((r) => r.data);
export const fetchBlogPost = (slug) => client.get(`/blog/${slug}`).then((r) => r.data);

// Admin content
export const adminListExperiences = () => client.get("/admin/experiences").then((r) => r.data);
export const adminCreateExperience = (data) => client.post("/admin/experiences", data).then((r) => r.data);
export const adminUpdateExperience = (id, data) => client.patch(`/admin/experiences/${id}`, data).then((r) => r.data);
export const adminDeleteExperience = (id) => client.delete(`/admin/experiences/${id}`).then((r) => r.data);

export const adminListTestimonials = () => client.get("/admin/testimonials").then((r) => r.data);
export const adminCreateTestimonial = (data) => client.post("/admin/testimonials", data).then((r) => r.data);
export const adminUpdateTestimonial = (name, data) => client.patch(`/admin/testimonials/${encodeURIComponent(name)}`, data).then((r) => r.data);
export const adminDeleteTestimonial = (name) => client.delete(`/admin/testimonials/${encodeURIComponent(name)}`).then((r) => r.data);

export const adminListBlogPosts = () => client.get("/admin/blog").then((r) => r.data);
export const adminCreateBlogPost = (data) => client.post("/admin/blog", data).then((r) => r.data);
export const adminUpdateBlogPost = (slug, data) => client.patch(`/admin/blog/${slug}`, data).then((r) => r.data);
export const adminDeleteBlogPost = (slug) => client.delete(`/admin/blog/${slug}`).then((r) => r.data);

// Booking requests
export const createBookingRequest = (data) => client.post("/bookings", data).then((r) => r.data);
export const getBooking = (id) => client.get(`/bookings/${id}`).then((r) => r.data);

// Pay landing
export const fetchPayInfo = (id) => client.get(`/pay/${id}`).then((r) => r.data);
export const startPayCheckout = (id, origin_url) =>
  client.post(`/pay/${id}/checkout`, { origin_url }).then((r) => r.data);
export const getCheckoutStatus = (sessionId) =>
  client.get(`/payments/checkout/status/${sessionId}`).then((r) => r.data);

// Admin
export const adminLogin = (email, password) =>
  client.post("/auth/login", { email, password }).then((r) => r.data);
export const adminMe = () => client.get("/auth/me").then((r) => r.data);
export const adminListBookings = (status) =>
  client.get("/admin/bookings", { params: status ? { status } : {} }).then((r) => r.data);
export const adminUpdateBooking = (id, payload) =>
  client.patch(`/admin/bookings/${id}`, payload).then((r) => r.data);
export const adminCreatePaymentLink = (id) =>
  client.post(`/admin/bookings/${id}/payment-link`).then((r) => r.data);
export const adminStats = () => client.get("/admin/stats").then((r) => r.data);

// Misc
export const sendContact = (data) => client.post("/contact", data).then((r) => r.data);
export const subscribeNewsletter = (email) => client.post("/newsletter", { email }).then((r) => r.data);

export default client;
