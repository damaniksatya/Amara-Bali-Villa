# Amara Bali Villas — Product Requirements (PRD)

## Original Problem Statement
Premium luxury Bali villa booking website with tropical-luxury aesthetic and a
**concierge-style booking-REQUEST flow** (no instant booking). Guests submit a
request, admin manually reviews and sends a Stripe payment link, guest completes
payment, admin sees status update.

## User Choices
- Stripe: real test integration (`sk_test_emergent`) via emergentintegrations
- Email automation: MOCKED — booking-request, payment-link, and final-confirmation
  emails are written to backend logs only
- Auth: simple JWT bearer-token, single seeded admin (no public registration)
- Design: Cormorant Garamond + Outfit, charcoal/sand/beige with soft gold

## User Personas
- **Guest** — submits booking requests, receives concierge confirmation, pays via Stripe link
- **Concierge admin** — reviews requests, confirms/cancels, generates payment links

## Core Requirements
- Cinematic Bali aesthetic, sticky transparent navbar, generous spacing
- Single-page Booking REQUEST form (replaces 4-step instant flow)
- Elegant request-received page with booking ID and "what happens next"
- Admin dashboard: stats, tabbed status filters, search, per-row actions
  (Confirm / Reject / Send payment link / Copy link)
- Public `/pay/:id` landing page (only available after admin marks awaiting_payment)
- Stripe-hosted secure checkout from `/pay/:id`
- Final confirmation page after payment with booking ID and check-in info

## What's Been Implemented (2026-02 → 2026-05)
- Backend (`/app/backend/server.py` + `auth.py`):
  - Public catalog: villas, categories, destinations, experiences, testimonials, blog
  - Booking-request lifecycle (pending → confirmed → awaiting_payment → paid / cancelled)
  - Stripe checkout via emergentintegrations + idempotent payment finalisation +
    demo fallback for the Emergent test-proxy retrieve limitation
  - Admin endpoints: list/update bookings, generate payment link, stats
  - JWT bearer auth with bcrypt-hashed admin (single seed)
  - Mocked emails: request received, payment link, final confirmation
  - Validation: check_out > check_in, guests within villa capacity
- Frontend (`/app/frontend/src/`):
  - Public pages: Home, Villas, VillaDetail, BookingRequest, BookingRequestSuccess,
    PayBooking, BookingSuccess, About, Experiences, Blog, BlogDetail, Contact
  - Admin: AdminLogin (split-screen), AdminDashboard (stats + tabbed table + actions)
  - Components: Navbar (sticky transparent on home), Footer (with Concierge Login link),
    SearchForm, VillaCard, sonner toasts, floating WhatsApp
  - Tailwind palette: charcoal #1A1A1A, gold #D4AF37, beige #F4F1EA, sand #E6D5C3
  - JWT token persisted in localStorage; axios interceptor attaches Bearer header

## Mocked Integrations (highlight)
- **Email automation is MOCKED** — booking-request, payment-link and confirmation
  emails are logged to backend logs only (`mock_send_*` in server.py).
  Replace with Resend / SendGrid in production.
- **Stripe checkout status retrieval** falls back to "paid" when the Emergent test
  proxy returns "No such session" (limitation of `sk_test_emergent`). Use a real
  Stripe key in production to drop the fallback.

## Prioritised Backlog
- P1: Real email provider (Resend / SendGrid) replacing the mock
- P1: Sortable/exportable bookings (CSV) and per-guest history view
- P1: SMS / WhatsApp delivery of payment link from admin (Twilio)
- P2: Multi-admin support (more than one concierge), audit log of status changes
- P2: Calendar availability blocking once a booking is paid
- P2: Guest accounts + wishlist persistence (currently in-memory hearts)
- P3: Multi-currency display (IDR/EUR), multi-language (EN/ID/FR/RU)
- P3: Trip-builder bundling experiences into the booking request

## Test Credentials
See `/app/memory/test_credentials.md`.
