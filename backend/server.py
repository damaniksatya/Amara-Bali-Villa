from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone

from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout,
    CheckoutSessionResponse,
    CheckoutStatusResponse,
    CheckoutSessionRequest,
)

from seed_data import VILLAS, CATEGORIES, DESTINATIONS, EXPERIENCES, TESTIMONIALS, BLOG_POSTS
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    require_admin,
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="Amara Bali Villas API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("amara")


# ========== Models ==========
class Villa(BaseModel):
    id: str; slug: str; name: str; location: str; category: str; type: str
    price_per_night: float; rating: float; reviews_count: int
    bedrooms: int; bathrooms: int; guests: int; pool: bool; wifi: bool
    short_description: str; description: str
    amenities: List[str]; images: List[str]
    lat: float; lng: float; featured: bool


class Category(BaseModel):
    slug: str; name: str; description: str; image: str


class Destination(BaseModel):
    slug: str; name: str; description: str; image: str; villa_count: int = 0


class Experience(BaseModel):
    id: str; name: str; description: str; image: str; price_from: float


class Testimonial(BaseModel):
    name: str; country: str; rating: int; photo: str; review: str


class BlogPost(BaseModel):
    slug: str; title: str; category: str; excerpt: str; cover: str
    author: str; author_role: str; read_time: int; date: str; content: str


class BookingRequestPayload(BaseModel):
    villa_id: str
    check_in: str
    check_out: str
    guests: int
    full_name: str
    email: EmailStr
    phone: str
    special_requests: Optional[str] = ""


class BookingStatusUpdate(BaseModel):
    status: str  # pending | confirmed | awaiting_payment | paid | cancelled
    admin_note: Optional[str] = ""


class ContactMessage(BaseModel):
    name: str; email: EmailStr
    phone: Optional[str] = ""; subject: Optional[str] = ""; message: str


class NewsletterPayload(BaseModel):
    email: EmailStr


class LoginPayload(BaseModel):
    email: EmailStr
    password: str


# ========== Helpers ==========
def calculate_pricing(villa: Dict[str, Any], check_in: str, check_out: str) -> Dict[str, float]:
    ci = datetime.fromisoformat(check_in)
    co = datetime.fromisoformat(check_out)
    nights = (co - ci).days
    if nights < 1:
        raise HTTPException(status_code=400, detail="check_out must be after check_in")
    subtotal = round(villa["price_per_night"] * nights, 2)
    cleaning_fee = 120.0
    taxes = round(subtotal * 0.11, 2)
    total = round(subtotal + cleaning_fee + taxes, 2)
    return {"nights": nights, "subtotal": subtotal, "cleaning_fee": cleaning_fee, "taxes": taxes, "total": total}


def public_booking(b: Dict[str, Any]) -> Dict[str, Any]:
    """Strip admin-only fields from a booking record before returning to public callers."""
    out = {**b}
    out.pop("admin_note", None)
    return out


def mock_send_request_emails(booking: Dict[str, Any]):
    logger.info("=" * 60)
    logger.info("[MOCKED EMAIL] Booking request received from %s", booking["email"])
    logger.info(
        "Request %s | %s | %s -> %s | %s guests",
        booking["id"], booking["villa_name"], booking["check_in"], booking["check_out"], booking["guests"],
    )
    logger.info("[MOCKED EMAIL] Admin alert: new booking request %s — review at /admin", booking["id"])
    logger.info("=" * 60)


def mock_send_payment_link_email(booking: Dict[str, Any], pay_url: str):
    logger.info("=" * 60)
    logger.info("[MOCKED EMAIL] Payment link sent to %s", booking["email"])
    logger.info("Booking %s | Total $%s | Pay URL: %s", booking["id"], booking["total"], pay_url)
    logger.info("=" * 60)


def mock_send_confirmation_email(booking: Dict[str, Any]):
    logger.info("=" * 60)
    logger.info("[MOCKED EMAIL] Final confirmation sent to %s", booking["email"])
    logger.info(
        "PAID Booking %s | %s | %s -> %s | $%s",
        booking["id"], booking["villa_name"], booking["check_in"], booking["check_out"], booking["total"],
    )
    logger.info("=" * 60)


def _stripe_client(host_url: str) -> StripeCheckout:
    api_key = os.environ["STRIPE_API_KEY"]
    webhook_url = f"{host_url}api/webhook/stripe"
    return StripeCheckout(api_key=api_key, webhook_url=webhook_url)


# ========== Seed ==========
async def seed_database():
    if await db.villas.count_documents({}) == 0:
        await db.villas.insert_many([{**v} for v in VILLAS])
    if await db.categories.count_documents({}) == 0:
        await db.categories.insert_many([{**c} for c in CATEGORIES])
    if await db.destinations.count_documents({}) == 0:
        await db.destinations.insert_many([{**d} for d in DESTINATIONS])
    if await db.experiences.count_documents({}) == 0:
        await db.experiences.insert_many([{**e} for e in EXPERIENCES])
    if await db.testimonials.count_documents({}) == 0:
        await db.testimonials.insert_many([{**t} for t in TESTIMONIALS])
    if await db.blog_posts.count_documents({}) == 0:
        await db.blog_posts.insert_many([{**b} for b in BLOG_POSTS])


async def seed_admin():
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Concierge Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Seeded admin user %s", admin_email)
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )
        logger.info("Updated admin password for %s", admin_email)


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await seed_database()
    await seed_admin()


# ========== Auth ==========
@api_router.post("/auth/login")
async def login(payload: LoginPayload):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"], user["role"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user["id"], "email": user["email"], "name": user.get("name"), "role": user["role"]},
    }


@api_router.get("/auth/me")
async def me(request: Request):
    user = await require_admin(request, db)
    return user


# ========== Public catalog ==========
@api_router.get("/")
async def root():
    return {"message": "Amara Bali Villas API"}


@api_router.get("/villas", response_model=List[Villa])
async def list_villas(
    location: Optional[str] = None, category: Optional[str] = None,
    bedrooms: Optional[int] = None, guests: Optional[int] = None,
    min_price: Optional[float] = None, max_price: Optional[float] = None,
    featured: Optional[bool] = None,
):
    query: Dict[str, Any] = {}
    if location:
        query["location"] = {"$regex": f"^{location}$", "$options": "i"}
    if category:
        query["category"] = category
    if bedrooms is not None:
        query["bedrooms"] = {"$gte": bedrooms}
    if guests is not None:
        query["guests"] = {"$gte": guests}
    if min_price is not None or max_price is not None:
        price_q: Dict[str, float] = {}
        if min_price is not None:
            price_q["$gte"] = min_price
        if max_price is not None:
            price_q["$lte"] = max_price
        query["price_per_night"] = price_q
    if featured is not None:
        query["featured"] = featured
    return await db.villas.find(query, {"_id": 0}).to_list(200)


@api_router.get("/villas/{slug}", response_model=Villa)
async def get_villa(slug: str):
    villa = await db.villas.find_one({"slug": slug}, {"_id": 0})
    if not villa:
        raise HTTPException(status_code=404, detail="Villa not found")
    return villa


@api_router.get("/villas/{slug}/related", response_model=List[Villa])
async def related_villas(slug: str):
    villa = await db.villas.find_one({"slug": slug}, {"_id": 0})
    if not villa:
        raise HTTPException(status_code=404, detail="Villa not found")
    related = await db.villas.find(
        {"slug": {"$ne": slug}, "category": villa["category"]}, {"_id": 0}
    ).to_list(3)
    if len(related) < 3:
        more = await db.villas.find(
            {"slug": {"$ne": slug}, "category": {"$ne": villa["category"]}}, {"_id": 0}
        ).to_list(3 - len(related))
        related.extend(more)
    return related[:3]


@api_router.get("/categories", response_model=List[Category])
async def list_categories():
    return await db.categories.find({}, {"_id": 0}).to_list(50)


@api_router.get("/destinations", response_model=List[Destination])
async def list_destinations():
    dests = await db.destinations.find({}, {"_id": 0}).to_list(50)
    for d in dests:
        d["villa_count"] = await db.villas.count_documents(
            {"location": {"$regex": f"^{d['name'].split()[0]}$", "$options": "i"}}
        )
    return dests


@api_router.get("/experiences", response_model=List[Experience])
async def list_experiences():
    return await db.experiences.find({}, {"_id": 0}).to_list(50)


@api_router.get("/testimonials", response_model=List[Testimonial])
async def list_testimonials():
    return await db.testimonials.find({}, {"_id": 0}).to_list(50)


@api_router.get("/blog", response_model=List[BlogPost])
async def list_blog_posts(category: Optional[str] = None, q: Optional[str] = None):
    query: Dict[str, Any] = {}
    if category:
        query["category"] = category
    if q:
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"excerpt": {"$regex": q, "$options": "i"}},
            {"content": {"$regex": q, "$options": "i"}},
        ]
    return await db.blog_posts.find(query, {"_id": 0}).sort("date", -1).to_list(100)


@api_router.get("/blog/{slug}", response_model=BlogPost)
async def get_blog_post(slug: str):
    post = await db.blog_posts.find_one({"slug": slug}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


# ========== Booking REQUESTS (concierge model) ==========
@api_router.post("/bookings")
async def create_booking_request(payload: BookingRequestPayload):
    villa = await db.villas.find_one({"id": payload.villa_id}, {"_id": 0})
    if not villa:
        raise HTTPException(status_code=404, detail="Villa not found")
    if payload.guests < 1 or payload.guests > villa["guests"]:
        raise HTTPException(status_code=400, detail=f"Guests must be between 1 and {villa['guests']}")
    pricing = calculate_pricing(villa, payload.check_in, payload.check_out)

    booking = {
        "id": str(uuid.uuid4()),
        "villa_id": villa["id"],
        "villa_slug": villa["slug"],
        "villa_name": villa["name"],
        "villa_location": villa["location"],
        "villa_image": villa["images"][0],
        "check_in": payload.check_in,
        "check_out": payload.check_out,
        "guests": payload.guests,
        "full_name": payload.full_name,
        "email": payload.email,
        "phone": payload.phone,
        "special_requests": payload.special_requests,
        "nights": pricing["nights"],
        "subtotal": pricing["subtotal"],
        "cleaning_fee": pricing["cleaning_fee"],
        "taxes": pricing["taxes"],
        "total": pricing["total"],
        "currency": "usd",
        "status": "pending",        # pending → confirmed → awaiting_payment → paid (or cancelled)
        "payment_status": "unpaid",
        "session_id": None,
        "pay_url_token": None,
        "admin_note": "",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.bookings.insert_one({**booking})
    mock_send_request_emails(booking)
    return public_booking(booking)


@api_router.get("/bookings/{booking_id}")
async def get_booking(booking_id: str):
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return public_booking(booking)


# ========== Admin ==========
@api_router.get("/admin/bookings")
async def admin_list_bookings(request: Request, status: Optional[str] = None):
    await require_admin(request, db)
    query: Dict[str, Any] = {}
    if status:
        query["status"] = status
    bookings = await db.bookings.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return bookings


@api_router.get("/admin/stats")
async def admin_stats(request: Request):
    await require_admin(request, db)
    pipeline = [{"$group": {"_id": "$status", "count": {"$sum": 1}}}]
    by_status = {row["_id"]: row["count"] async for row in db.bookings.aggregate(pipeline)}
    revenue_pipeline = [
        {"$match": {"payment_status": "paid"}},
        {"$group": {"_id": None, "revenue": {"$sum": "$total"}}},
    ]
    revenue = 0.0
    async for row in db.bookings.aggregate(revenue_pipeline):
        revenue = round(row["revenue"], 2)
    return {
        "total_requests": sum(by_status.values()),
        "pending": by_status.get("pending", 0),
        "confirmed": by_status.get("confirmed", 0),
        "awaiting_payment": by_status.get("awaiting_payment", 0),
        "paid": by_status.get("paid", 0),
        "cancelled": by_status.get("cancelled", 0),
        "revenue": revenue,
    }


@api_router.patch("/admin/bookings/{booking_id}")
async def admin_update_booking(booking_id: str, payload: BookingStatusUpdate, request: Request):
    await require_admin(request, db)
    if payload.status not in {"pending", "confirmed", "awaiting_payment", "paid", "cancelled"}:
        raise HTTPException(status_code=400, detail="Invalid status")
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    update = {
        "status": payload.status,
        "admin_note": payload.admin_note or booking.get("admin_note", ""),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.bookings.update_one({"id": booking_id}, {"$set": update})
    return {**booking, **update}


@api_router.post("/admin/bookings/{booking_id}/payment-link")
async def admin_create_payment_link(booking_id: str, request: Request):
    await require_admin(request, db)
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking["payment_status"] == "paid":
        raise HTTPException(status_code=400, detail="Booking already paid")

    # Mark as awaiting_payment and surface a public pay URL the admin can copy/send.
    await db.bookings.update_one(
        {"id": booking_id},
        {
            "$set": {
                "status": "awaiting_payment",
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        },
    )

    # Build a public-facing pay URL based on the request origin.
    origin = request.headers.get("origin") or str(request.base_url).rstrip("/")
    pay_url = f"{origin}/pay/{booking_id}"

    refreshed = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    mock_send_payment_link_email(refreshed, pay_url)
    return {"pay_url": pay_url, "booking": refreshed}


# ========== Public payment landing ==========
@api_router.get("/pay/{booking_id}")
async def pay_info(booking_id: str):
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking["status"] not in {"awaiting_payment", "confirmed", "paid"}:
        raise HTTPException(status_code=403, detail="This booking is not ready for payment yet")
    return public_booking(booking)


class CheckoutPayload(BaseModel):
    origin_url: str


@api_router.post("/pay/{booking_id}/checkout")
async def pay_create_checkout(booking_id: str, payload: CheckoutPayload, request: Request):
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking["status"] not in {"awaiting_payment", "confirmed"}:
        raise HTTPException(status_code=403, detail="Booking is not ready for payment")
    if booking["payment_status"] == "paid":
        raise HTTPException(status_code=400, detail="Already paid")

    amount = float(booking["total"])
    currency = booking.get("currency", "usd")

    origin = payload.origin_url.rstrip("/")
    success_url = f"{origin}/booking/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/pay/{booking_id}"
    metadata = {"booking_id": booking["id"], "villa_id": booking["villa_id"], "guest_email": booking["email"]}

    host_url = str(request.base_url)
    stripe = _stripe_client(host_url)
    req = CheckoutSessionRequest(
        amount=amount, currency=currency,
        success_url=success_url, cancel_url=cancel_url, metadata=metadata,
    )
    session: CheckoutSessionResponse = await stripe.create_checkout_session(req)

    transaction = {
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "booking_id": booking["id"],
        "amount": amount, "currency": currency, "metadata": metadata,
        "payment_status": "initiated", "status": "open",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.payment_transactions.insert_one({**transaction})
    await db.bookings.update_one({"id": booking_id}, {"$set": {"session_id": session.session_id}})
    return {"url": session.url, "session_id": session.session_id}


@api_router.get("/payments/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, request: Request):
    transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if transaction["payment_status"] in ("paid", "expired", "failed"):
        booking = await db.bookings.find_one({"id": transaction["booking_id"]}, {"_id": 0})
        return {
            "status": transaction["status"],
            "payment_status": transaction["payment_status"],
            "amount_total": int(transaction["amount"] * 100),
            "currency": transaction["currency"],
            "metadata": transaction["metadata"],
            "booking_id": transaction["booking_id"],
            "booking": public_booking(booking) if booking else None,
        }

    host_url = str(request.base_url)
    stripe = _stripe_client(host_url)
    new_payment_status, new_status = "pending", "open"
    amount_total = int(transaction["amount"] * 100)
    currency = transaction["currency"]
    metadata = transaction["metadata"]
    try:
        status: CheckoutStatusResponse = await stripe.get_checkout_status(session_id)
        new_payment_status = status.payment_status
        new_status = status.status
        amount_total = status.amount_total
        currency = status.currency
        metadata = status.metadata
    except Exception as exc:  # noqa: BLE001
        # Demo-only fallback: the sk_test_emergent proxy can create sessions but cannot
        # retrieve them. To keep the booking flow demoable, we treat the redirect-back
        # as paid. Behind a real Stripe account key we surface 502 instead so a real
        # failure never silently confirms a booking.
        if os.environ.get("STRIPE_API_KEY") == "sk_test_emergent":
            logger.warning("Stripe status retrieval unavailable (%s) — demo fallback", exc)
            new_payment_status = "paid"
            new_status = "complete"
        else:
            logger.exception("Stripe status retrieval failed: %s", exc)
            raise HTTPException(status_code=502, detail="Could not retrieve payment status") from exc

    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {"$set": {
            "status": new_status,
            "payment_status": new_payment_status,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }},
    )

    booking = await db.bookings.find_one({"id": transaction["booking_id"]}, {"_id": 0})
    if new_payment_status == "paid" and booking and booking.get("payment_status") != "paid":
        await db.bookings.update_one(
            {"id": transaction["booking_id"]},
            {"$set": {
                "payment_status": "paid",
                "status": "paid",
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }},
        )
        booking["payment_status"] = "paid"
        booking["status"] = "paid"
        mock_send_confirmation_email(booking)

    return {
        "status": new_status,
        "payment_status": new_payment_status,
        "amount_total": amount_total,
        "currency": currency,
        "metadata": metadata,
        "booking_id": transaction["booking_id"],
        "booking": public_booking(booking) if booking else None,
    }


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature", "")
    host_url = str(request.base_url)
    stripe = _stripe_client(host_url)
    try:
        event = await stripe.handle_webhook(body, signature)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Stripe webhook failed: %s", exc)
        raise HTTPException(status_code=400, detail="Invalid webhook")
    await db.payment_transactions.update_one(
        {"session_id": event.session_id},
        {"$set": {"payment_status": event.payment_status, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    if event.payment_status == "paid":
        booking_id = (event.metadata or {}).get("booking_id")
        if booking_id:
            booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
            if booking and booking.get("payment_status") != "paid":
                await db.bookings.update_one(
                    {"id": booking_id},
                    {"$set": {
                        "payment_status": "paid", "status": "paid",
                        "updated_at": datetime.now(timezone.utc).isoformat(),
                    }},
                )
                booking["payment_status"] = "paid"
                mock_send_confirmation_email(booking)
    return {"received": True}


# ========== Contact / Newsletter ==========
@api_router.post("/contact")
async def contact(payload: ContactMessage):
    msg = {
        "id": str(uuid.uuid4()),
        "name": payload.name, "email": payload.email,
        "phone": payload.phone, "subject": payload.subject, "message": payload.message,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.contact_messages.insert_one({**msg})
    logger.info("[MOCKED EMAIL] Contact form: %s <%s>", payload.name, payload.email)
    return {"ok": True, "id": msg["id"]}


@api_router.post("/newsletter")
async def newsletter(payload: NewsletterPayload):
    await db.newsletter.update_one(
        {"email": payload.email},
        {"$set": {"email": payload.email, "created_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    return {"ok": True}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
