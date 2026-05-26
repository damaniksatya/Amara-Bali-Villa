"""Twilio WhatsApp helper for sending payment links."""
import logging
import os
import re
from typing import Dict, Any

from twilio.base.exceptions import TwilioRestException
from twilio.rest import Client

logger = logging.getLogger("amara.whatsapp")


def _normalise_to(phone: str) -> str:
    """Coerce a guest phone number to E.164 + whatsapp: prefix."""
    cleaned = re.sub(r"[^\d+]", "", phone or "")
    if not cleaned:
        raise ValueError("Phone number is empty")
    if not cleaned.startswith("+"):
        cleaned = "+" + cleaned.lstrip("0")
    return f"whatsapp:{cleaned}"


def _build_message(booking: Dict[str, Any], pay_url: str) -> str:
    first_name = booking["full_name"].split(" ")[0] if booking.get("full_name") else "there"
    return (
        f"Hello {first_name}, this is Amara Bali Concierge.\n\n"
        f"Your stay at *{booking['villa_name']}* in {booking['villa_location']} is "
        f"confirmed for {booking['check_in']} → {booking['check_out']} "
        f"({booking['nights']} nights, {booking['guests']} guests).\n\n"
        f"Total due: *${booking['total']:,.2f} USD*\n\n"
        f"Please complete your secure payment here:\n{pay_url}\n\n"
        f"Booking ID: {booking['id']}\n\n"
        f"Reply to this message any time — our team is on hand 24/7. "
        f"Selamat datang di Bali."
    )


def send_payment_link_whatsapp(booking: Dict[str, Any], pay_url: str) -> Dict[str, Any]:
    """
    Send a WhatsApp message with the Stripe payment link.

    Returns: {"sid", "status", "to", "from"} on success.
    Raises: ValueError for bad config / phone, TwilioRestException for Twilio errors.
    """
    sid = os.environ.get("TWILIO_ACCOUNT_SID")
    token = os.environ.get("TWILIO_AUTH_TOKEN")
    sender = os.environ.get("TWILIO_WHATSAPP_FROM")
    if not (sid and token and sender):
        raise ValueError("Twilio is not configured on the server")

    to_address = _normalise_to(booking.get("phone", ""))
    body = _build_message(booking, pay_url)

    client = Client(sid, token)
    message = client.messages.create(from_=sender, to=to_address, body=body)
    logger.info(
        "[Twilio] WhatsApp sent sid=%s to=%s status=%s",
        message.sid, to_address, message.status,
    )
    return {"sid": message.sid, "status": message.status, "to": to_address, "from": sender}
