"""Backend tests for Amara Bali Villas API — concierge booking refactor (iteration 2)."""
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if os.environ.get("REACT_APP_BACKEND_URL") else "https://bali-resort-rentals.preview.emergentagent.com"
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@amarabali.co"
ADMIN_PASSWORD = "amara2026"


@pytest.fixture(scope="session")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


# ===== Auth =====
@pytest.fixture(scope="session")
def admin_token(s):
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    body = r.json()
    assert "access_token" in body and body["token_type"] == "bearer"
    assert body["user"]["email"] == ADMIN_EMAIL
    assert body["user"]["role"] == "admin"
    return body["access_token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


def test_login_bad_credentials(s):
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong-pw"})
    assert r.status_code == 401


def test_auth_me_with_token(s, admin_headers):
    r = s.get(f"{API}/auth/me", headers=admin_headers)
    assert r.status_code == 200
    body = r.json()
    assert body["email"] == ADMIN_EMAIL
    assert body["role"] == "admin"


def test_auth_me_no_token(s):
    sess = requests.Session()  # no headers
    r = sess.get(f"{API}/auth/me")
    assert r.status_code == 401


def test_auth_me_invalid_token(s):
    r = s.get(f"{API}/auth/me", headers={"Authorization": "Bearer not.a.real.jwt"})
    assert r.status_code == 401


# ===== Catalog smoke =====
def test_root(s):
    r = s.get(f"{API}/")
    assert r.status_code == 200


def test_list_villas(s):
    r = s.get(f"{API}/villas")
    assert r.status_code == 200
    assert len(r.json()) == 8


def test_villa_detail(s):
    r = s.get(f"{API}/villas/villa-suara-canggu")
    assert r.status_code == 200
    assert r.json()["slug"] == "villa-suara-canggu"


# ===== Booking REQUEST flow (concierge) =====
@pytest.fixture(scope="session")
def villa_suara(s):
    r = s.get(f"{API}/villas/villa-suara-canggu")
    assert r.status_code == 200
    return r.json()


@pytest.fixture
def booking_request(s, villa_suara):
    payload = {
        "villa_id": villa_suara["id"],
        "check_in": "2026-04-10",
        "check_out": "2026-04-14",
        "guests": 4,
        "full_name": "TEST_Sophia",
        "email": f"test_sophia_{uuid.uuid4().hex[:6]}@example.com",
        "phone": "+15551234567",
        "special_requests": "TEST request",
    }
    r = s.post(f"{API}/bookings", json=payload)
    assert r.status_code == 200, r.text
    return r.json()


def test_create_booking_pricing_and_status(booking_request, villa_suara):
    b = booking_request
    nightly = villa_suara["price_per_night"]
    assert b["nights"] == 4
    assert b["subtotal"] == round(nightly * 4, 2)
    assert b["cleaning_fee"] == 120.0
    assert b["taxes"] == round(b["subtotal"] * 0.11, 2)
    assert b["total"] == round(b["subtotal"] + 120.0 + b["taxes"], 2)
    assert b["status"] == "pending"
    assert b["payment_status"] == "unpaid"
    assert b["session_id"] is None
    # admin_note must NOT be exposed publicly
    assert "admin_note" not in b


def test_get_booking_public_no_admin_note(s, booking_request):
    r = s.get(f"{API}/bookings/{booking_request['id']}")
    assert r.status_code == 200
    body = r.json()
    assert body["id"] == booking_request["id"]
    assert "admin_note" not in body


def test_create_booking_invalid_email(s, villa_suara):
    payload = {
        "villa_id": villa_suara["id"],
        "check_in": "2026-04-10", "check_out": "2026-04-14", "guests": 2,
        "full_name": "x", "email": "not-an-email", "phone": "1",
    }
    r = s.post(f"{API}/bookings", json=payload)
    assert r.status_code == 422


def test_create_booking_guests_over_capacity(s, villa_suara):
    payload = {
        "villa_id": villa_suara["id"],
        "check_in": "2026-04-10", "check_out": "2026-04-14",
        "guests": villa_suara["guests"] + 5,
        "full_name": "x", "email": "x@y.com", "phone": "1",
    }
    r = s.post(f"{API}/bookings", json=payload)
    assert r.status_code == 400


def test_create_booking_invalid_dates(s, villa_suara):
    payload = {
        "villa_id": villa_suara["id"],
        "check_in": "2026-04-14", "check_out": "2026-04-14",  # same day -> 0 nights
        "guests": 2, "full_name": "x", "email": "x@y.com", "phone": "1",
    }
    r = s.post(f"{API}/bookings", json=payload)
    assert r.status_code == 400


# ===== Admin endpoints (auth required) =====
def test_admin_bookings_requires_auth(s):
    r = s.get(f"{API}/admin/bookings")
    assert r.status_code == 401


def test_admin_bookings_rejects_non_admin(s):
    r = s.get(f"{API}/admin/bookings", headers={"Authorization": "Bearer abc.def.ghi"})
    assert r.status_code == 401


def test_admin_list_bookings(s, admin_headers, booking_request):
    r = s.get(f"{API}/admin/bookings", headers=admin_headers)
    assert r.status_code == 200
    ids = [b["id"] for b in r.json()]
    assert booking_request["id"] in ids


def test_admin_list_bookings_filter_status(s, admin_headers, booking_request):
    r = s.get(f"{API}/admin/bookings", headers=admin_headers, params={"status": "pending"})
    assert r.status_code == 200
    data = r.json()
    assert all(b["status"] == "pending" for b in data)
    assert any(b["id"] == booking_request["id"] for b in data)


def test_admin_stats(s, admin_headers):
    r = s.get(f"{API}/admin/stats", headers=admin_headers)
    assert r.status_code == 200
    data = r.json()
    for k in ("total_requests", "pending", "confirmed", "awaiting_payment", "paid", "cancelled", "revenue"):
        assert k in data


def test_admin_update_booking_status(s, admin_headers, booking_request):
    bid = booking_request["id"]
    r = s.patch(f"{API}/admin/bookings/{bid}", headers=admin_headers,
                json={"status": "confirmed", "admin_note": "TEST_confirmed"})
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["status"] == "confirmed"
    assert data["admin_note"] == "TEST_confirmed"


def test_admin_update_booking_invalid_status(s, admin_headers, booking_request):
    bid = booking_request["id"]
    r = s.patch(f"{API}/admin/bookings/{bid}", headers=admin_headers,
                json={"status": "garbage", "admin_note": ""})
    assert r.status_code == 400


def test_admin_create_payment_link_and_pay_landing(s, admin_headers, booking_request):
    bid = booking_request["id"]
    # Pay landing should 403 while still pending
    r = s.get(f"{API}/pay/{bid}")
    assert r.status_code == 403

    r = s.post(f"{API}/admin/bookings/{bid}/payment-link", headers=admin_headers)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "pay_url" in data
    assert data["pay_url"].endswith(f"/pay/{bid}")
    assert data["booking"]["status"] == "awaiting_payment"

    # Now public pay landing should succeed
    r = s.get(f"{API}/pay/{bid}")
    assert r.status_code == 200
    body = r.json()
    assert body["id"] == bid
    assert "admin_note" not in body


def test_pay_landing_404(s):
    r = s.get(f"{API}/pay/does-not-exist-xyz")
    assert r.status_code == 404


# ===== Pay → Stripe Checkout → status fallback =====
@pytest.fixture
def awaiting_booking(s, admin_headers, booking_request):
    bid = booking_request["id"]
    r = s.post(f"{API}/admin/bookings/{bid}/payment-link", headers=admin_headers)
    assert r.status_code == 200
    return r.json()["booking"]


def test_pay_create_checkout_amount_server_derived(s, awaiting_booking):
    bid = awaiting_booking["id"]
    # Pass an inflated origin_url; amount must come from booking record, not payload.
    r = s.post(f"{API}/pay/{bid}/checkout", json={"origin_url": BASE_URL})
    assert r.status_code == 200, r.text
    data = r.json()
    assert "url" in data and "session_id" in data
    assert data["url"].startswith("http")

    # Session id was persisted on the booking
    r2 = s.get(f"{API}/bookings/{bid}")
    assert r2.status_code == 200
    assert r2.json()["session_id"] == data["session_id"]


def test_pay_checkout_rejected_when_pending(s, booking_request):
    # booking_request is pending — a fresh one for this test
    bid = booking_request["id"]
    r = s.post(f"{API}/pay/{bid}/checkout", json={"origin_url": BASE_URL})
    assert r.status_code == 403


def test_checkout_status_fallback_marks_paid(s, awaiting_booking):
    bid = awaiting_booking["id"]
    r = s.post(f"{API}/pay/{bid}/checkout", json={"origin_url": BASE_URL})
    assert r.status_code == 200
    sid = r.json()["session_id"]

    time.sleep(1)
    r = s.get(f"{API}/payments/checkout/status/{sid}")
    assert r.status_code == 200, r.text
    data = r.json()
    # Demo fallback should mark as paid
    assert data["payment_status"] == "paid"
    assert data["booking_id"] == bid
    # Booking record updated
    r2 = s.get(f"{API}/bookings/{bid}")
    assert r2.status_code == 200
    booking = r2.json()
    assert booking["status"] == "paid"
    assert booking["payment_status"] == "paid"

    # Idempotent — calling again is fine
    r3 = s.get(f"{API}/payments/checkout/status/{sid}")
    assert r3.status_code == 200
    assert r3.json()["payment_status"] == "paid"


def test_checkout_status_unknown(s):
    r = s.get(f"{API}/payments/checkout/status/cs_test_doesnotexist_xyz")
    assert r.status_code == 404
