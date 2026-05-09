"""Backend tests for Amara Bali Villas API."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://bali-resort-rentals.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


# ---------------- root ----------------
def test_root(s):
    r = s.get(f"{API}/")
    assert r.status_code == 200
    assert "Amara" in r.json().get("message", "")


# ---------------- villas ----------------
def test_list_villas(s):
    r = s.get(f"{API}/villas")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == 8
    v = data[0]
    for k in ("id", "slug", "name", "location", "price_per_night", "bedrooms"):
        assert k in v


def test_villas_filter_location(s):
    r = s.get(f"{API}/villas", params={"location": "Canggu"})
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 1
    assert all(v["location"].lower() == "canggu" for v in data)


def test_villas_filter_category(s):
    r = s.get(f"{API}/villas", params={"category": "luxury"})
    assert r.status_code == 200
    data = r.json()
    assert all(v["category"] == "luxury" for v in data)
    assert len(data) >= 2


def test_villas_filter_bedrooms(s):
    r = s.get(f"{API}/villas", params={"bedrooms": 4})
    assert r.status_code == 200
    data = r.json()
    assert all(v["bedrooms"] >= 4 for v in data)


def test_villas_filter_featured(s):
    r = s.get(f"{API}/villas", params={"featured": "true"})
    assert r.status_code == 200
    data = r.json()
    assert all(v["featured"] is True for v in data)
    assert len(data) >= 4


def test_villa_detail(s):
    r = s.get(f"{API}/villas/villa-suara-canggu")
    assert r.status_code == 200
    v = r.json()
    assert v["slug"] == "villa-suara-canggu"
    assert v["name"] == "Villa Suara"


def test_villa_detail_404(s):
    r = s.get(f"{API}/villas/nope-villa")
    assert r.status_code == 404


def test_villa_related(s):
    r = s.get(f"{API}/villas/villa-suara-canggu/related")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) <= 3
    assert all(v["slug"] != "villa-suara-canggu" for v in data)


# ---------------- categories / destinations / experiences / testimonials ----------------
def test_categories(s):
    r = s.get(f"{API}/categories")
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 6


def test_destinations(s):
    r = s.get(f"{API}/destinations")
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 4
    for d in data:
        assert "villa_count" in d
        assert isinstance(d["villa_count"], int)
    # Canggu should have at least 2 (Suara + Laut)
    canggu = next((x for x in data if "Canggu" in x["name"]), None)
    assert canggu is not None
    assert canggu["villa_count"] >= 2


def test_experiences(s):
    r = s.get(f"{API}/experiences")
    assert r.status_code == 200
    assert len(r.json()) == 8


def test_testimonials(s):
    r = s.get(f"{API}/testimonials")
    assert r.status_code == 200
    assert len(r.json()) == 4


# ---------------- blog ----------------
def test_blog_list(s):
    r = s.get(f"{API}/blog")
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 6


def test_blog_filter_category(s):
    r = s.get(f"{API}/blog", params={"category": "Honeymoon"})
    assert r.status_code == 200
    data = r.json()
    assert all(b["category"] == "Honeymoon" for b in data)
    assert len(data) >= 1


def test_blog_search(s):
    r = s.get(f"{API}/blog", params={"q": "ubud"})
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 1


def test_blog_detail(s):
    r = s.get(f"{API}/blog/best-areas-to-stay-in-bali")
    assert r.status_code == 200
    p = r.json()
    assert p["slug"] == "best-areas-to-stay-in-bali"
    assert len(p["content"]) > 100


# ---------------- bookings ----------------
@pytest.fixture(scope="session")
def created_booking(s):
    payload = {
        "villa_id": "villa-suara-canggu",
        "check_in": "2026-03-01",
        "check_out": "2026-03-05",
        "guests": 4,
        "full_name": "TEST_Guest",
        "email": "test_guest@example.com",
        "phone": "+1234567890",
        "special_requests": "TEST",
        "origin_url": BASE_URL,
    }
    r = s.post(f"{API}/bookings", json=payload)
    assert r.status_code == 200, r.text
    return r.json()


def test_create_booking_pricing(created_booking):
    b = created_booking
    # 4 nights * 685 = 2740 ; cleaning 120 ; tax 11% of subtotal
    assert b["nights"] == 4
    assert b["subtotal"] == 2740.0
    assert b["cleaning_fee"] == 120.0
    assert b["taxes"] == round(2740.0 * 0.11, 2)
    assert b["total"] == round(2740.0 + 120.0 + b["taxes"], 2)
    assert b["status"] == "pending_payment"
    assert b["payment_status"] == "unpaid"
    assert b["session_id"] is None
    assert b["id"]


def test_get_booking(s, created_booking):
    bid = created_booking["id"]
    r = s.get(f"{API}/bookings/{bid}")
    assert r.status_code == 200
    assert r.json()["id"] == bid


def test_create_booking_invalid_villa(s):
    payload = {
        "villa_id": "nope",
        "check_in": "2026-03-01",
        "check_out": "2026-03-05",
        "guests": 2,
        "full_name": "x",
        "email": "x@y.com",
        "phone": "1",
        "origin_url": BASE_URL,
    }
    r = s.post(f"{API}/bookings", json=payload)
    assert r.status_code == 404


# ---------------- payments / Stripe ----------------
@pytest.fixture(scope="session")
def checkout_session(s, created_booking):
    payload = {"booking_id": created_booking["id"], "origin_url": BASE_URL}
    r = s.post(f"{API}/payments/checkout/session", json=payload)
    assert r.status_code == 200, r.text
    return r.json()


def test_checkout_session_returns_url(checkout_session):
    assert "url" in checkout_session
    assert "session_id" in checkout_session
    assert checkout_session["url"].startswith("http")
    assert checkout_session["session_id"]


def test_checkout_security_amount_from_server(s, created_booking, checkout_session):
    """Booking should retain server-computed total even after checkout creation."""
    bid = created_booking["id"]
    r = s.get(f"{API}/bookings/{bid}")
    assert r.status_code == 200
    b = r.json()
    # session_id was attached
    assert b["session_id"] == checkout_session["session_id"]
    # total unchanged (server-side)
    assert b["total"] == created_booking["total"]


def test_checkout_status_poll(s, checkout_session):
    sid = checkout_session["session_id"]
    # small wait so Stripe registers the session
    time.sleep(1)
    r = s.get(f"{API}/payments/checkout/status/{sid}")
    assert r.status_code == 200, r.text
    data = r.json()
    assert "payment_status" in data
    assert "status" in data
    assert "booking_id" in data
    # Unpaid initially
    assert data["payment_status"] in ("unpaid", "paid", "no_payment_required")


def test_checkout_status_unknown_session(s):
    r = s.get(f"{API}/payments/checkout/status/cs_test_doesnotexist_xyz")
    assert r.status_code == 404


# ---------------- contact / newsletter ----------------
def test_contact(s):
    payload = {
        "name": "TEST_Contact",
        "email": "test_contact@example.com",
        "phone": "+1",
        "subject": "hello",
        "message": "TEST message",
    }
    r = s.post(f"{API}/contact", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data.get("ok") is True
    assert "id" in data


def test_newsletter_upsert(s):
    payload = {"email": "test_newsletter@example.com"}
    r1 = s.post(f"{API}/newsletter", json=payload)
    assert r1.status_code == 200
    # Idempotent (upsert)
    r2 = s.post(f"{API}/newsletter", json=payload)
    assert r2.status_code == 200
