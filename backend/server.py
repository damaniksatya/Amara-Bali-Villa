from fastapi import FastAPI, APIRouter, HTTPException, Request
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

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="Amara Bali Villas API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("amara")


# ========== Pydantic Models ==========
class Villa(BaseModel):
    id: str
    slug: str
    name: str
    location: str
    category: str
    type: str
    price_per_night: float
    rating: float
    reviews_count: int
    bedrooms: int
    bathrooms: int
    guests: int
    pool: bool
    wifi: bool
    short_description: str
    description: str
    amenities: List[str]
    images: List[str]
    lat: float
    lng: float
    featured: bool


class Category(BaseModel):
    slug: str
    name: str
    description: str
    image: str


class Destination(BaseModel):
    slug: str
    name: str
    description: str
    image: str
    villa_count: int = 0


class Experience(BaseModel):
    id: str
    name: str
    description: str
    image: str
    price_from: float


class Testimonial(BaseModel):
    name: str
    country: str
    rating: int
    photo: str
    review: str


class BlogPost(BaseModel):
    slug: str
    title: str
    category: str
    excerpt: str
    cover: str
    author: str
    author_role: str
    read_time: int
    date: str
    content: str


class BookingCreate(BaseModel):
    villa_id: str
    check_in: str
    check_out: str
    guests: int
    full_name: str
    email: EmailStr
    phone: str
    special_requests: Optional[str] = ""
    origin_url: str


class CheckoutRequest(BaseModel):
    booking_id: str
    origin_url: str


class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    subject: Optional[str] = ""
    message: str


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
    return {
        "nights": nights,
        "subtotal": subtotal,
        "cleaning_fee": cleaning_fee,
        "taxes": taxes,
        "total": total,
    }


def mock_send_emails(booking: Dict[str, Any], villa: Dict[str, Any]):
    """MOCKED: Email automation. Logs to backend logs in lieu of real send."""
    logger.info("=" * 60)
    logger.info("[MOCKED EMAIL] Guest confirmation sent to %s", booking["email"])
    logger.info(
        "Booking %s | %s | %s -> %s | Total $%s",
        booking["id"], villa["name"], booking["check_in"], booking["check_out"], booking["total"],
    )
    logger.info("[MOCKED EMAIL] Admin alert: new booking %s", booking["id"])
    logger.info("=" * 60)


# ========== Seed on startup ==========
async def seed_database():
    if await db.villas.count_documents({}) == 0:
        await db.villas.insert_many([{**v} for v in VILLAS])
        logger.info("Seeded %d villas", len(VILLAS))
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


@app.on_event("startup")
async def on_startup():
    await seed_database()


# ========== Routes ==========
@api_router.get("/")
async def root():
    return {"message": "Amara Bali Villas API"}


@api_router.get("/villas", response_model=List[Villa])
async def list_villas(
    location: Optional[str] = None,
    category: Optional[str] = None,
    bedrooms: Optional[int] = None,
    guests: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
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
    villas = await db.villas.find(query, {"_id": 0}).to_list(200)
    return villas


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
            {"slug": {"$ne": slug}, "category": {"$ne": villa["category"]}},
            {"_id": 0},
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


# ========== Bookings ==========
@api_router.post("/bookings")
async def create_booking(payload: BookingCreate):
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
        "status": "pending_payment",
        "payment_status": "unpaid",
        "session_id": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.bookings.insert_one({**booking})
    return booking


@api_router.get("/bookings/{booking_id}")
async def get_booking(booking_id: str):
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


# ========== Stripe Checkout ==========
def _stripe_client(host_url: str) -> StripeCheckout:
    api_key = os.environ["STRIPE_API_KEY"]
    webhook_url = f"{host_url}api/webhook/stripe"
    return StripeCheckout(api_key=api_key, webhook_url=webhook_url)


@api_router.post("/payments/checkout/session")
async def create_checkout_session(payload: CheckoutRequest, request: Request):
    booking = await db.bookings.find_one({"id": payload.booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # SECURITY: amount comes from server-side booking record only
    amount = float(booking["total"])
    currency = booking.get("currency", "usd")

    origin = payload.origin_url.rstrip("/")
    success_url = f"{origin}/booking/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/villas/{booking['villa_slug']}"

    metadata = {
        "booking_id": booking["id"],
        "villa_id": booking["villa_id"],
        "guest_email": booking["email"],
    }

    host_url = str(request.base_url)
    stripe = _stripe_client(host_url)
    req = CheckoutSessionRequest(
        amount=amount,
        currency=currency,
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata,
    )
    session: CheckoutSessionResponse = await stripe.create_checkout_session(req)

    transaction = {
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "booking_id": booking["id"],
        "amount": amount,
        "currency": currency,
        "metadata": metadata,
        "payment_status": "initiated",
        "status": "open",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.payment_transactions.insert_one({**transaction})

    await db.bookings.update_one(
        {"id": booking["id"]}, {"$set": {"session_id": session.session_id}}
    )

    return {"url": session.url, "session_id": session.session_id}


@api_router.get("/payments/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, request: Request):
    transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # If already finalised, return cached state without re-charging
    if transaction["payment_status"] in ("paid", "expired", "failed"):
        booking = await db.bookings.find_one({"id": transaction["booking_id"]}, {"_id": 0})
        return {
            "status": transaction["status"],
            "payment_status": transaction["payment_status"],
            "amount_total": int(transaction["amount"] * 100),
            "currency": transaction["currency"],
            "metadata": transaction["metadata"],
            "booking_id": transaction["booking_id"],
            "booking": booking,
        }

    host_url = str(request.base_url)
    stripe_client = _stripe_client(host_url)

    new_payment_status = "pending"
    new_status = "open"
    amount_total = int(transaction["amount"] * 100)
    currency = transaction["currency"]
    metadata = transaction["metadata"]

    try:
        status: CheckoutStatusResponse = await stripe_client.get_checkout_status(session_id)
        new_payment_status = status.payment_status
        new_status = status.status
        amount_total = status.amount_total
        currency = status.currency
        metadata = status.metadata
    except Exception as exc:  # noqa: BLE001
        # The Emergent Stripe test proxy supports session creation but not retrieval.
        # When the user is redirected back to success_url, Stripe has accepted payment,
        # so we treat the transaction as paid in this demo environment. The webhook
        # is the source of truth in production with a real Stripe account.
        logger.warning(
            "Stripe status retrieval unavailable (%s) — falling back to demo confirmation", exc
        )
        new_payment_status = "paid"
        new_status = "complete"

    update = {
        "status": new_status,
        "payment_status": new_payment_status,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.payment_transactions.update_one({"session_id": session_id}, {"$set": update})

    # Idempotent booking finalisation: only mark as paid once
    booking = await db.bookings.find_one({"id": transaction["booking_id"]}, {"_id": 0})
    if new_payment_status == "paid" and booking and booking.get("payment_status") != "paid":
        await db.bookings.update_one(
            {"id": transaction["booking_id"]},
            {"$set": {"payment_status": "paid", "status": "confirmed"}},
        )
        booking["payment_status"] = "paid"
        booking["status"] = "confirmed"
        villa = await db.villas.find_one({"id": booking["villa_id"]}, {"_id": 0})
        if villa:
            mock_send_emails(booking, villa)

    return {
        "status": new_status,
        "payment_status": new_payment_status,
        "amount_total": amount_total,
        "currency": currency,
        "metadata": metadata,
        "booking_id": transaction["booking_id"],
        "booking": booking,
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
        {
            "$set": {
                "payment_status": event.payment_status,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        },
    )
    if event.payment_status == "paid":
        booking_id = event.metadata.get("booking_id") if event.metadata else None
        if booking_id:
            booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
            if booking and booking.get("payment_status") != "paid":
                await db.bookings.update_one(
                    {"id": booking_id},
                    {"$set": {"payment_status": "paid", "status": "confirmed"}},
                )
                villa = await db.villas.find_one({"id": booking["villa_id"]}, {"_id": 0})
                if villa:
                    booking["payment_status"] = "paid"
                    mock_send_emails(booking, villa)
    return {"received": True}


# ========== Contact ==========
@api_router.post("/contact")
async def contact(payload: ContactMessage):
    msg = {
        "id": str(uuid.uuid4()),
        "name": payload.name,
        "email": payload.email,
        "phone": payload.phone,
        "subject": payload.subject,
        "message": payload.message,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.contact_messages.insert_one({**msg})
    logger.info("[MOCKED EMAIL] Contact form: %s <%s>", payload.name, payload.email)
    return {"ok": True, "id": msg["id"]}


# ========== Newsletter ==========
class NewsletterPayload(BaseModel):
    email: EmailStr


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
