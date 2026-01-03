from fastapi import FastAPI, Request
from starlette.responses import HTMLResponse
from twilio.twiml.messaging_response import MessagingResponse

app = FastAPI()

@app.post("/whatsapp")
async def whatsapp_webhook(request: Request):
    form = await request.form()
    body = form.get("Body", "")

    print("INCOMING BODY:", body)

    resp = MessagingResponse()
    resp.message("✅ CONFIRMED: WhatsApp replies are working.")

    # HTMLResponse reliably sends body + headers
    return HTMLResponse(
        content=str(resp),
        media_type="text/xml"
    )
