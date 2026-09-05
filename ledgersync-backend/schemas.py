from typing import Optional
from pydantic import BaseModel, ConfigDict

# --- AUTH SCHEMAS ---
class UserCreate(BaseModel):
    email: str
    password: str
    role: str = "Viewer"

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

# --- VENDOR SCHEMAS ---
class VendorBase(BaseModel):
    name: str
    gstin: str

class VendorCreate(VendorBase):
    pass

class VendorResponse(VendorBase):
    id: int
    # Allows Pydantic to read SQLAlchemy objects
    model_config = ConfigDict(from_attributes=True)

# --- INVOICE SCHEMAS ---
class InvoiceBase(BaseModel):
    invoice_number: str
    amount: float
    erp_amount: Optional[float] = None
    status: str = "Pending"
    ai_confidence: Optional[float] = None
    vendor_id: int

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceResponse(InvoiceBase):
    id: int
    # Allows Pydantic to read SQLAlchemy objects
    model_config = ConfigDict(from_attributes=True)

# --- 🤖 AI COPILOT SCHEMAS ---
class CopilotChatRequest(BaseModel):
    message: str

class CopilotChatResponse(BaseModel):
    response: str