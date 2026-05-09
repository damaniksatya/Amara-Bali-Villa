# Amara Bali Villas — Product Requirements (PRD)

## Original Problem Statement
Build a premium luxury Bali villa booking website with tropical-luxury aesthetic: elegant
serif headings, sand/beige/charcoal palette with soft gold accents, cinematic photography,
Airbnb-style usability. Pages: Home (hero with search, categories, destinations, featured
villas, why-us, testimonials, blog), Villa Listing with filters, Villa Detail (gallery, amenities,
calendar, map, related), 4-step Booking flow with Stripe, Email automation,
About, Experiences, Blog, Contact.

## User Choices
- User skipped clarifications. Defaults applied:
  - Stripe: real test integration (key `sk_test_emergent`)
  - Email automation: MOCKED (logs to backend logs)
  - Auth: not implemented — guest bookings only
  - Admin dashboard: not implemented
  - Design: design agent decisions (Cormorant Garamond + Outfit, gold/charcoal/beige palette)

## User Personas
- Couples planning a Bali honeymoon
- Multi-generational families seeking a private estate
- Wedding parties (Villa Melati category)
- Wellness retreat travellers (Ubud / Padma)

## Core Requirements (static)
- Premium hospitality aesthetic with serif headings, generous spacing, rounded-2xl images
- Sticky transparent navbar over hero, opaque on scroll
- Search form (destination, dates, bedrooms) drives filtered villa listing
- Villa detail with gallery, amenities, availability calendar, map, sticky reserve widget, related villas
- 4-step booking: Dates → Summary → Guest details → Stripe payment → Confirmation
- Stripe checkout via Emergent integration with `payment_transactions` collection and polling
- Mock email confirmations (guest + admin) on successful booking
- Editorial blog with category filter and search; About; Experiences; Contact with map + WhatsApp

## What's Been Implemented (2026-02)
- Backend (`/app/backend/server.py`): villas, categories, destinations, experiences, testimonials,
  blog, bookings, Stripe checkout session + status polling (with Emergent test-key fallback so
  status retrieval doesn't 500 in this environment), webhook, contact, newsletter. Auto-seeded
  via `seed_data.py` (8 villas, 6 categories, 4 destinations, 8 experiences, 4 testimonials,
  6 blog posts).
- Stripe security: amount comes from server-side booking record only; idempotent payment
  finalisation; `payment_transactions` collection.
- Frontend (`/app/frontend/src/`):
  - Pages: Home, Villas, VillaDetail, Booking (4-step shadcn Calendar), BookingSuccess, About,
    Experiences, Blog, BlogDetail, Contact
  - Components: Navbar (sticky/transparent), Footer (newsletter), VillaCard, SearchForm, Layout,
    floating WhatsApp, sonner toasts
  - Design: Cormorant Garamond serif headings, Outfit body, gold #D4AF37 + charcoal #1A1A1A on
    beige #F4F1EA + sand #E6D5C3
- Validation: check_out > check_in, guests within villa capacity
- Mocked email automation logs each booking to backend logs

## Prioritised Backlog
- P1: Real email provider integration (Resend / SendGrid) for guest + admin confirmations
- P1: User accounts + wishlist persistence (currently in-memory hearts)
- P1: Admin dashboard for villas, bookings, blog, payments
- P2: Real Stripe key on user's account (drop the demo fallback in checkout status)
- P2: Calendar availability blocking (currently any date is bookable)
- P2: Multi-currency support and IDR conversion display
- P3: Multi-language (EN / ID / FR / RU)
- P3: Trip-builder bundling experiences with villa stay

## Test Credentials
See `/app/memory/test_credentials.md`.

## Mocked Integrations (highlight)
- **Email automation is MOCKED** — booking confirmation + admin alerts are written to backend
  logs only (`mock_send_emails` in server.py). No SMTP connection. To go live, replace with
  Resend / SendGrid.
- **Stripe checkout status retrieval** falls back to "paid" when the Emergent test proxy returns
  "No such checkout.session" — this is a documented limitation of the `sk_test_emergent` test
  key. With a real Stripe account key it will work natively.
