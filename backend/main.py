from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pytesseract
from PIL import Image, ImageEnhance, ImageFilter
import shutil
import os
import json
import pickle
import re
from pydantic import BaseModel

from groq import Groq
from sentence_transformers import SentenceTransformer
import faiss
from dotenv import load_dotenv

# ================= LOAD ENV =================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

# ================= TESSERACT PATH =================
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# ================= APP =================
app = FastAPI()

# ================= CORS =================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins temporarily
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= GROQ CLIENT =================
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ================= EMBEDDING MODEL =================
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# ================= LOAD FAISS INDEX =================
faiss_index = faiss.read_index("faiss_index/index.faiss")
with open("faiss_index/texts.pkl", "rb") as f:
    knowledge_texts = pickle.load(f)

# ================= BRAND TO GENERIC MAPPING =================
BRAND_TO_GENERIC = {
    "panrace": "paracetamol",
    "crocin": "paracetamol",
    "dolo": "paracetamol",
    "tylenol": "paracetamol",
    "calpol": "paracetamol",
    "amoxil": "amoxicillin",
    "mox": "amoxicillin",
    "augmentin": "amoxicillin",
}

# ================= STANDARD DOSAGE INFO =================
STANDARD_DOSAGES = {
    "paracetamol": {
        "dosage": "500mg-1000mg per dose",
        "frequency": "every 4-6 hours (max 4 times daily)",
        "max_daily": "4000mg per day",
        "notes": "Take after food"
    },
    "amoxicillin": {
        "dosage": "250mg-500mg per dose",
        "frequency": "three times daily (every 8 hours)",
        "max_daily": "1500mg per day for mild infections",
        "notes": "Complete the full course"
    },
    "ibuprofen": {
        "dosage": "200mg-400mg per dose",
        "frequency": "every 4-6 hours",
        "max_daily": "1200mg per day",
        "notes": "Take with food"
    },
    "cetirizine": {
        "dosage": "10mg per dose",
        "frequency": "once daily",
        "max_daily": "10mg per day",
        "notes": "May cause drowsiness"
    }
}

# ================= SAFE JSON EXTRACTOR =================
def extract_json(text: str):
    """
    Safely extract JSON array from LLM output
    """
    match = re.search(r"\[.*\]", text, re.DOTALL)
    if not match:
        raise ValueError("No JSON array found in LLM response")
    return json.loads(match.group())

# ================= LLM PARSER (ENHANCED) =================
def parse_prescription_with_llm(ocr_text: str):
    """
    Extract medicines with proper dosage, frequency, duration
    """

    prompt = f"""
You are an expert medical prescription parser. Analyze this doctor's prescription OCR text carefully.

INSTRUCTIONS:
1. **Fix OCR errors**: "panrace" → "paracetamol", "amol" → "amoxicillin", etc.
2. **Convert brands to generics**: Crocin → paracetamol, Dolo → paracetamol, Mox → amoxicillin
3. **Parse dosing patterns**:
   - "1-0-1" or "1 0 1" = morning-none-evening (2 times daily)
   - "1-1-1" or "1 1 1" = morning-afternoon-evening (3 times daily)
   - "0-0-1" = evening only (once daily)
   - "6-1" might mean "1 tablet 6 times" or dosing instruction
4. **Extract information**:
   - DOSAGE: Amount per dose (e.g., "500mg", "1 tablet", "1 capsule")
   - FREQUENCY: Times per day (e.g., "twice daily", "three times daily", "every 8 hours")
   - DURATION: Total treatment period (e.g., "5 days", "1 week")
5. **Medical abbreviations**:
   - BD/BID = twice daily
   - TDS/TID = three times daily  
   - QD/OD = once daily
   - QID = four times daily
   - HS = at bedtime
   - AC = before meals
   - PC = after meals

CRITICAL: If dosage/frequency/duration information exists in the text, extract it. Don't leave fields empty unless truly absent.

Return ONLY valid JSON (no markdown, no extra text):

[
  {{
    "medicine": "generic_name_lowercase",
    "dosage": "amount_per_dose",
    "frequency": "times_per_day",
    "duration": "total_duration"
  }}
]

PRESCRIPTION TEXT:
{ocr_text}
"""

    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=1000,
    )

    return extract_json(response.choices[0].message.content)

# ================= STANDARD DOSAGE INFO FUNCTION =================
def get_standard_dosage_info(medicine_name: str):
    """
    Get standard dosage information as fallback
    """
    medicine_name = medicine_name.lower().strip()
    
    if medicine_name in STANDARD_DOSAGES:
        info = STANDARD_DOSAGES[medicine_name]
        return f"\n\nStandard Dosage Guidelines:\n\nTypical dose: {info['dosage']}\nFrequency: {info['frequency']}\nMaximum daily dose: {info['max_daily']}\nImportant note: {info['notes']}\n\nDisclaimer: These are general guidelines. Always follow your doctor's prescription."
    
    return ""

# ================= RAG MEDICINE INFO (ENHANCED) =================
def get_medicine_info_rag(medicine_name: str):
    """
    Retrieve medicine information using RAG with better matching
    """
    
    # Normalize medicine name
    medicine_name = medicine_name.lower().strip()
    
    # Check if it's a brand name and convert to generic
    original_name = medicine_name
    if medicine_name in BRAND_TO_GENERIC:
        medicine_name = BRAND_TO_GENERIC[medicine_name]
        print(f"Converted brand '{original_name}' → generic '{medicine_name}'")
    
    # Try exact match and common variations
    query_variations = [
        medicine_name,
        f"{medicine_name} uses",
        f"{medicine_name} medicine drug",
        f"{medicine_name} tablet",
        f"what is {medicine_name} used for"
    ]
    
    best_distance = float('inf')
    best_context = ""
    best_indices = []
    
    for query in query_variations:
        query_embedding = embedding_model.encode([query])
        distances, indices = faiss_index.search(query_embedding, k=5)
        
        if distances[0][0] < best_distance:
            best_distance = distances[0][0]
            best_indices = indices[0]
            best_context = "\n\n---\n\n".join([knowledge_texts[i] for i in indices[0]])
    
    # 🔍 DEBUG
    print(f"RAG DEBUG → Medicine: {medicine_name}, Best distance: {best_distance}")
    print(f"Top matching indices: {best_indices}")

    # 🚨 CONFIDENCE GATE
    if best_distance > 1.0:
        return f"⚠️ Limited information available for '{medicine_name}'. The system could not find reliable details in the knowledge base. Please consult a healthcare professional or pharmacist for accurate information."

    prompt = f"""
You are a medical information expert. Based on the context provided, give comprehensive information about {medicine_name}.

MEDICAL KNOWLEDGE BASE:
{best_context}

Please provide a clear, well-structured response covering:

1. What it is: Brief description of the medicine type/class
2. Primary uses: Main conditions it treats
3. How it works: Mechanism of action (if available in context)
4. Typical dosage: Standard doses for adults (if available in context)
5. Important warnings: Key side effects, contraindications, or precautions (if available in context)

FORMATTING REQUIREMENTS:
- Write in clear paragraphs WITHOUT asterisks, markdown formatting, or special characters
- Use simple section headers like "What it is:" or "Primary uses:" 
- Write naturally as if explaining to a patient
- Use proper sentences and paragraphs
- NO markdown symbols like **, ##, or ***
- NO bullet points - write in prose format
- If information is not available, say so naturally without asterisks

Requirements:
- Use ONLY information from the context above
- Write in clear, patient-friendly language
- Be accurate and professional
- Do NOT make up information

Write your response in plain text paragraphs only."""

    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=800,
    )

    detailed_info = response.choices[0].message.content
    
    # Add standard dosage information as supplement
    standard_info = get_standard_dosage_info(medicine_name)
    
    return detailed_info + standard_info

# ================= IMAGE PREPROCESSING =================
def preprocess_image(image_path: str):
    """
    Enhance image quality before OCR
    """
    # Skip preprocessing for PDFs
    if image_path.lower().endswith(".pdf"):
        return image_path

    img = Image.open(image_path)
    
    # Convert to grayscale
    img = img.convert("L")
    
    # Increase contrast
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(2.0)
    
    # Sharpen
    img = img.filter(ImageFilter.SHARPEN)
    
    # Increase brightness slightly
    enhancer = ImageEnhance.Brightness(img)
    img = enhancer.enhance(1.2)
    
    # Save preprocessed image
    processed_path = "processed_" + os.path.basename(image_path)
    img.save(processed_path)
    
    return processed_path

# ================= UPLOAD ENDPOINT =================
@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    try:
        print("RECEIVED FILE:", file.filename, file.content_type)
        image_path = "uploaded.png"

        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Preprocess image for better OCR
        processed_path = preprocess_image(image_path)
        
        # Run OCR on preprocessed image
        ocr_text = pytesseract.image_to_string(
            Image.open(processed_path),
            config='--psm 6'  # Assume uniform block of text
        )
        
        print("="*50)
        print("OCR TEXT:", ocr_text)
        print("="*50)

        try:
            parsed_medicines = parse_prescription_with_llm(ocr_text)
            print("PARSED MEDICINES:", json.dumps(parsed_medicines, indent=2))
        except Exception as e:
            print("LLM PARSE ERROR:", e)
            parsed_medicines = []

        response_data = {
            "ocr_text": ocr_text,
            "parsed_medicines": parsed_medicines,
            "status": "success"
        }
        
        print("SENDING RESPONSE:", json.dumps(response_data, indent=2))
        return response_data
        
    except Exception as e:
        print("UPLOAD ERROR:", str(e))
        import traceback
        traceback.print_exc()
        return {
            "ocr_text": "",
            "parsed_medicines": [],
            "status": "error",
            "error": str(e)
        }

# ================= MEDICINE INFO ENDPOINT =================
@app.get("/medicine/{name}")
def medicine_info(name: str):
    try:
        print(f"Medicine info requested for: {name}")
        info = get_medicine_info_rag(name)
        print(f"Medicine info retrieved successfully for: {name}")
        return {"info": info, "status": "success"}
    except Exception as e:
        print(f"RAG ERROR for {name}:", str(e))
        import traceback
        traceback.print_exc()
        return {
            "info": "Information currently unavailable. Please try again or consult a healthcare professional.",
            "status": "error",
            "error": str(e)
        }

# ================= HEALTH CHECK =================
@app.get("/")
def health_check():
    return {"status": "ok", "message": "Prescription Parser API is running"}

# ================= WHATSAPP ANALYSIS ENDPOINT =================
class WhatsAppAnalyzeRequest(BaseModel):
    file_path: str
    profile: str

@app.post("/whatsapp/analyze")
def whatsapp_analyze(req: WhatsAppAnalyzeRequest):
    """
    Endpoint used ONLY by WhatsApp bot.
    It receives a file path already saved by WhatsApp,
    runs OCR + LLM parsing, and returns a short summary.
    """

    # --- OCR ---
    processed_path = preprocess_image(req.file_path)
    ocr_text = pytesseract.image_to_string(
        Image.open(processed_path),
        config="--psm 6"
    )

    # --- LLM parsing ---
    try:
        medicines = parse_prescription_with_llm(ocr_text)
    except Exception:
        medicines = []

    # --- Build WhatsApp-safe summary ---
    if not medicines:
        return {
            "summary": (
                "⚠️ I couldn't clearly read this prescription.\n"
                "Please upload a clearer image or consult your doctor."
            )
        }

    lines = [f"📄 Prescription Summary ({req.profile})\n"]

    for med in medicines:
        lines.append(
            f"💊 {med['medicine'].title()}\n"
            f"• Dosage: {med['dosage'] or 'As prescribed'}\n"
            f"• Frequency: {med['frequency'] or 'As directed'}\n"
            f"• Duration: {med['duration'] or 'As advised'}\n"
        )

    lines.append(
        "⚠️ This is an AI-generated summary. Always follow your doctor's advice."
    )

    return {
        "summary": "\n".join(lines)
    }