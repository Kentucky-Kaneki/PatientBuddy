from fastapi import FastAPI, Request
from fastapi.responses import Response
from twilio.twiml.messaging_response import MessagingResponse
import requests
import os
import uuid
from PIL import Image
import io
from dotenv import load_dotenv
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# adjust path to backend/.env
load_dotenv(os.path.join(BASE_DIR, "../backend/.env"))


TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")

app = FastAPI()

# ----------------------------
# FILE STORAGE
# ----------------------------
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ----------------------------
# TEMP IN-MEMORY STORAGE
# ----------------------------

# phone_number -> session state
sessions = {}

# phone_number -> profiles (pretend this comes from website DB)
user_profiles = {
    "+919999999999": ["Self", "Father", "Mother"]  # example user
}

# ----------------------------
# WHATSAPP WEBHOOK
# ----------------------------

@app.post("/whatsapp")
async def whatsapp_webhook(request: Request):
    form = await request.form()

    body = form.get("Body", "").strip()
    num_media = int(form.get("NumMedia", 0))
    media_url = form.get("MediaUrl0")
    media_type = form.get("MediaContentType0")
    from_number = form.get("From")  # whatsapp:+91XXXXXXXXXX

    phone_number = from_number.replace("whatsapp:", "")
    body_lower = body.lower()

    resp = MessagingResponse()

    # ----------------------------
    # INIT SESSION
    # ----------------------------
    if phone_number not in sessions:
        sessions[phone_number] = {
            "state": "IDLE",
            "last_file": None
        }

    session = sessions[phone_number]

    # ----------------------------
    # STEP 0: GREETING / HELP
    # ----------------------------
    if body_lower in ["hi", "hello", "start", "help","hey"]:
        resp.message(
            "👋 Hello! I’m *MedReport Assistant*.\n\n"
            "Here’s what I can do:\n"
            "📄 Analyze medical lab reports (PDF/image)\n"
            "👨‍👩‍👧 Support multiple family profiles\n"
            "📊 Highlight abnormal values\n"
            "🧠 Explain results in simple language\n\n"
            "👉 Just upload a lab report to get started."
        )
        return Response(
            content=str(resp),
            media_type="application/xml"
        )

    # ----------------------------
    # STEP 1: MEDIA UPLOAD
    # ----------------------------
    if num_media > 0 and media_url:

        try:
            # 1️⃣ Download WhatsApp media
            img_bytes = requests.get(
                media_url,
                auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
            ).content


            # 2️⃣ Open image (jpg / jpeg / webp)
            img = Image.open(io.BytesIO(img_bytes))

            # 3️⃣ FORCE convert to PNG (backend expects this)
            img.convert("RGB").save("uploaded.png", "PNG")

            # 4️⃣ Store canonical path
            session["state"] = "AWAITING_PROFILE"
            session["last_file"] = "uploaded.png"

            # 5️⃣ Ask for profile
            profiles = user_profiles.get(phone_number, ["Self"])
            profile_text = "\n".join(
                [f"{i+1}️⃣ {p}" for i, p in enumerate(profiles)]
            )

            resp.message(
                "📄 Report received!\n\n"
                "Whose report is this?\n"
                f"{profile_text}"
            )

        except Exception:
            resp.message(
                "❌ I couldn’t read this image.\n"
                "Please send a clear photo of the report."
            )

    # ----------------------------
    # STEP 2: PROFILE SELECTION
    # ----------------------------
    elif session["state"] == "AWAITING_PROFILE" and body.isdigit():
        profiles = user_profiles.get(phone_number, ["Self"])
        choice = int(body) - 1

        if 0 <= choice < len(profiles):
            selected_profile = profiles[choice]
            session["state"] = "IDLE"

            try:
                with open(session["last_file"], "rb") as f:
                    backend_response = requests.post(
                    "http://localhost:8000/upload",
                    files={"file": f},
                    timeout=180
                )

                data = backend_response.json()
                ocr_text = data.get("ocr_text", "")

                resp.message(
                    f"📄 *OCR Result ({selected_profile})*:\n\n{ocr_text}"
                )


            except Exception:
                resp.message(
                    "⚠️ The report was saved, but analysis failed.\n"
                    "Please try again later."
                )
        else:
            resp.message("❌ Invalid choice. Please select a valid profile number.")

    # ----------------------------
    # STEP 3: NORMAL TEXT
    # ----------------------------
    elif body:
        resp.message(
            "👋 Hi!\n"
            "Upload a lab report (PDF or image) to get started.\n"
            "Type *help* to see what I can do."
        )

    # ----------------------------
    # FALLBACK
    # ----------------------------
    else:
        resp.message("Please upload a lab report (PDF or image).")

    return Response(
        content=str(resp),
        media_type="application/xml"
    )
