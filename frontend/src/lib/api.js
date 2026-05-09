import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const client = axios.create({ baseURL: API, headers: { "Content-Type": "application/json" } });

export const fetchVillas = (params = {}) => client.get("/villas", { params }).then((r) => r.data);
export const fetchVilla = (slug) => client.get(`/villas/${slug}`).then((r) => r.data);
export const fetchRelatedVillas = (slug) => client.get(`/villas/${slug}/related`).then((r) => r.data);
export const fetchCategories = () => client.get("/categories").then((r) => r.data);
export const fetchDestinations = () => client.get("/destinations").then((r) => r.data);
export const fetchExperiences = () => client.get("/experiences").then((r) => r.data);
export const fetchTestimonials = () => client.get("/testimonials").then((r) => r.data);
export const fetchBlog = (params = {}) => client.get("/blog", { params }).then((r) => r.data);
export const fetchBlogPost = (slug) => client.get(`/blog/${slug}`).then((r) => r.data);
export const createBooking = (data) => client.post("/bookings", data).then((r) => r.data);
export const getBooking = (id) => client.get(`/bookings/${id}`).then((r) => r.data);
export const createCheckoutSession = (data) => client.post("/payments/checkout/session", data).then((r) => r.data);
export const getCheckoutStatus = (sessionId) => client.get(`/payments/checkout/status/${sessionId}`).then((r) => r.data);
export const sendContact = (data) => client.post("/contact", data).then((r) => r.data);
export const subscribeNewsletter = (email) => client.post("/newsletter", { email }).then((r) => r.data);

export default client;
