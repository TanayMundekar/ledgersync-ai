import os
import json
from typing import List, Dict, Any
import google.generativeai as genai
from dotenv import load_dotenv

# 1. Load Environment Variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("CRITICAL ERROR: No GEMINI_API_KEY found in .env file.")

# 2. Configure SDK
genai.configure(api_key=api_key)

# 3. Initialize Enterprise Model
# Using models/gemini-3.5-flash for verified stability and quota allocation
model = genai.GenerativeModel(
    model_name='models/gemini-3.6-flash',
    system_instruction=(
        "You are LedgerSync AI, an enterprise financial Copilot. "
        "You provide concise, factual, and strictly data-grounded responses. "
        "You do not hallucinate financial numbers, invoices, or vendor records. "
        "Always respond in valid JSON format when specifically requested."
    )
)

# --- FEATURE 1: PASSIVE BACKGROUND ANOMALY DETECTION ---
def analyze_invoice_anomaly(amount: float, erp_amount: float) -> dict:
    """
    Analyzes mathematical variance between billed invoice amount and ERP record.
    Returns structured JSON with status and confidence score.
    """
    prompt = f"""
    Analyze this financial discrepancy:
    - Invoice Amount: {amount}
    - ERP Expected Amount: {erp_amount}
    
    Rule 1: If the difference is exactly 0, the status is "Matched" with 100.0 confidence.
    Rule 2: If the difference is small (e.g., likely tax rounding or minor shipping fee), the status is "Flagged" with a confidence score between 60.0 and 99.0.
    Rule 3: If the difference is large or suspicious, the status is "Mismatch" with a low confidence score (e.g., 10.0 to 59.0).
    
    Return ONLY a valid JSON object with exactly two keys: "status" (string) and "ai_confidence" (float).
    Example: {{"status": "Flagged", "ai_confidence": 85.5}}
    """
    try:
        response = model.generate_content(prompt)
        clean_text = response.text.strip().replace("```json", "").replace("```", "")
        return json.loads(clean_text)
    except Exception as e:
        print(f"AI Analysis Failed: {e}")
        return {"status": "Pending", "ai_confidence": 0.0}

# --- FEATURE 2: ACTIVE AUTO-RECONCILIATION ---
def suggest_reconciliation(invoice_number: str, amount: float, erp_amount: float) -> dict:
    """
    Analyzes specific ledger discrepancy and suggests actionable business resolution.
    Returns plain-English explanation and button action label.
    """
    variance = round(abs(amount - erp_amount), 2)
    prompt = f"""
    You are an AI financial controller. Analyze this specific mismatch:
    - Invoice Number: {invoice_number}
    - Billed Amount: {amount}
    - ERP Expected Amount: {erp_amount}
    - Variance: {variance}
    
    Deduce a logical business reason for this discrepancy (e.g., standard 18% GST, 5% late fee, freight/shipping, or data entry typo). 
    Provide a "Suggested Match" resolution for the UI button.
    
    Return ONLY a valid JSON object with exactly two keys: 
    - "explanation" (a brief, 1-2 sentence plain-English analysis)
    - "suggested_action" (a short 2-3 word button label, e.g., "Apply GST", "Approve Freight Charge", "Flag as Mismatch")
    """
    try:
        response = model.generate_content(prompt)
        clean_text = response.text.strip().replace("```json", "").replace("```", "")
        return json.loads(clean_text)
    except Exception as e:
        print(f"AI Reconciliation Failed: {e}")
        return {
            "explanation": f"Discrepancy of {variance} detected. Could not connect to AI for automated deduction.", 
            "suggested_action": "Manual Review Required"
        }

# --- FEATURE 3: INTERACTIVE RAG COPILOT ---
def ask_copilot(user_query: str, records_context: List[Dict[str, Any]]) -> str:
    """
    Retrieves dynamic database context and answers user queries with factual grounding.
    """
    prompt = f"""
    DATABASE CONTEXT (Active Ledgers & Vendors):
    {json.dumps(records_context, indent=2)}

    USER QUESTION:
    "{user_query}"

    INSTRUCTIONS:
    Answer the user question accurately based ONLY on the DATABASE CONTEXT above.
    If the requested invoice, vendor, or discrepancy is not present in the context, explicitly state that it was not found.
    Format the response cleanly with Markdown (bullet points, bold highlights, currency values) suitable for a FinTech dashboard.
    """
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"LedgerSync Copilot encountered an error: {str(e)}"

# --- FEATURE 4: MULTIMODAL VISION OCR ---
def extract_invoice_data(image_bytes: bytes, mime_type: str) -> dict:
    """
    Multimodal Vision AI: Parses a physical invoice image into structured ledger fields.
    """
    prompt = """
    You are an enterprise OCR and data extraction AI for a FinTech platform.
    Analyze this invoice image and extract the essential fields.
    
    Return ONLY a valid JSON object with exactly these keys:
    - "invoice_number": (string or null, the unique invoice identifier, e.g., "INV-2026-001")
    - "amount": (float or null, the total final billed amount)
    - "vendor_name": (string or null, the business entity issuing the invoice)
    - "tax_amount": (float or null, tax/GST amount if itemized)
    
    Rules:
    1. Do not include markdown code block syntax (no ```json or ```).
    2. Convert amounts to plain numbers without currency symbols (e.g., 1450.50).
    3. If any field cannot be determined, set its value to null.
    """
    image_part = {
        "mime_type": mime_type,
        "data": image_bytes
    }
    try:
        response = model.generate_content([prompt, image_part])
        clean_text = response.text.strip().replace("```json", "").replace("```", "")
        return json.loads(clean_text)
    except Exception as e:
        print(f"Vision AI Failed: {e}")
        return {
            "invoice_number": None,
            "amount": None,
            "vendor_name": None,
            "tax_amount": None
        }