from dataclasses import dataclass
from typing import Dict, Any
import uuid
import json

@dataclass
class CheckoutSessionRequest:
    amount: float
    currency: str
    success_url: str
    cancel_url: str
    metadata: Dict[str, Any]

@dataclass
class CheckoutSessionResponse:
    session_id: str
    url: str

@dataclass
class CheckoutStatusResponse:
    status: str
    payment_status: str
    amount_total: int
    currency: str
    metadata: Dict[str, Any]

class StripeCheckout:
    def __init__(self, api_key: str, webhook_url: str):
        self.api_key = api_key
        self.webhook_url = webhook_url

    async def create_checkout_session(self, request: CheckoutSessionRequest) -> CheckoutSessionResponse:
        session_id = f"cs_test_{uuid.uuid4().hex}"
        return CheckoutSessionResponse(
            session_id=session_id,
            url=f"https://example.com/checkout/{session_id}",
        )

    async def get_checkout_status(self, session_id: str) -> CheckoutStatusResponse:
        # Simulate a pending payment session until webhook or external system updates it.
        return CheckoutStatusResponse(
            status="open",
            payment_status="pending",
            amount_total=0,
            currency="usd",
            metadata={},
        )

    async def handle_webhook(self, body: bytes, signature: str):
        try:
            payload = json.loads(body.decode("utf-8"))
        except Exception as exc:
            raise ValueError("Invalid webhook payload") from exc

        class Event:
            pass

        event = Event()
        event.session_id = payload.get("session_id")
        event.payment_status = payload.get("payment_status")
        event.metadata = payload.get("metadata", {})
        return event
