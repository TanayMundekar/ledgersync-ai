from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

import auth
import ai_service
from database import engine, Base, SessionLocal
import models
import schemas

# 1. Lifespan Context Manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

# 2. FastAPI Application Initialization
app = FastAPI(
    title="LedgerSync AI API",
    version="1.0.0",
    lifespan=lifespan
)

# 3. CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Database Session Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==========================================
# 🚀 1. SYSTEM HEALTH & AI DIAGNOSTIC ROUTES
# ==========================================

@app.get("/", tags=["System"])
def read_root():
    return {
        "status": "online",
        "message": "LedgerSync AI Backend API is operational!"
    }

@app.get("/api/test-ai", tags=["System"])
def test_ai(invoice_amt: float = 5050.00, erp_amt: float = 5000.00):
    """
    Diagnostic math endpoint to verify live Gemini connectivity and variance calculation.
    """
    try:
        analysis = ai_service.analyze_invoice_anomaly(invoice_amt, erp_amt)
        return {
            "status": "success", 
            "invoice_amount": invoice_amt,
            "erp_amount": erp_amt,
            "ai_conclusion": analysis
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# ==========================================
# 🔒 2. AUTHENTICATION ENDPOINTS
# ==========================================

@app.post("/api/auth/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED, tags=["Auth"])
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email already registered"
        )
    
    hashed_pw = auth.hash_password(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_pw, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/auth/login", response_model=schemas.Token, tags=["Auth"])
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

# ==========================================
# 🏢 3. VENDOR ENDPOINTS
# ==========================================

@app.post("/api/vendors", response_model=schemas.VendorResponse, status_code=status.HTTP_201_CREATED, tags=["Vendors"])
def create_vendor(vendor: schemas.VendorCreate, db: Session = Depends(get_db)):
    existing_gstin = db.query(models.Vendor).filter(models.Vendor.gstin == vendor.gstin).first()
    if existing_gstin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Vendor with this GSTIN already exists"
        )
    
    db_vendor = models.Vendor(**vendor.model_dump())
    db.add(db_vendor)
    db.commit()
    db.refresh(db_vendor)
    return db_vendor

@app.get("/api/vendors", response_model=List[schemas.VendorResponse], tags=["Vendors"])
def get_vendors(db: Session = Depends(get_db)):
    return db.query(models.Vendor).all()

# ==========================================
# 📄 4. INVOICE CRUD & PASSIVE AI PIPELINE
# ==========================================

@app.post("/api/invoices", response_model=schemas.InvoiceResponse, status_code=status.HTTP_201_CREATED, tags=["Invoices"])
def create_invoice(invoice: schemas.InvoiceCreate, db: Session = Depends(get_db)):
    # 1. Foreign key integrity check
    db_vendor = db.query(models.Vendor).filter(models.Vendor.id == invoice.vendor_id).first()
    if not db_vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Vendor with id {invoice.vendor_id} does not exist"
        )
    
    # 2. Strict unique constraint check
    existing_invoice = db.query(models.Invoice).filter(models.Invoice.invoice_number == invoice.invoice_number).first()
    if existing_invoice:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invoice number already exists"
        )
    
    # 3. Passive AI Anomaly Interception
    invoice_data = invoice.model_dump()
    if invoice.amount is not None and invoice.erp_amount is not None:
        ai_result = ai_service.analyze_invoice_anomaly(invoice.amount, invoice.erp_amount)
        invoice_data["status"] = ai_result.get("status", "Pending")
        invoice_data["ai_confidence"] = ai_result.get("ai_confidence", 0.0)
    
    # 4. Database persistence
    db_invoice = models.Invoice(**invoice_data)
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

@app.get("/api/invoices", response_model=List[schemas.InvoiceResponse], tags=["Invoices"])
def get_invoices(db: Session = Depends(get_db)):
    return db.query(models.Invoice).all()

@app.get("/api/invoices/{invoice_id}", response_model=schemas.InvoiceResponse, tags=["Invoices"])
def get_invoice_by_id(invoice_id: int, db: Session = Depends(get_db)):
    db_invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if not db_invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Invoice with id {invoice_id} not found"
        )
    return db_invoice

@app.patch("/api/invoices/{invoice_id}", response_model=schemas.InvoiceResponse, tags=["Invoices"])
def update_invoice_status(invoice_id: int, new_status: str, db: Session = Depends(get_db)):
    db_invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if not db_invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Invoice with id {invoice_id} not found"
        )
    
    db_invoice.status = new_status
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

# ==========================================
# 🤖 5. ACTIVE AI COPILOT, RECONCILIATION & VISION
# ==========================================

@app.get("/api/invoices/{invoice_id}/reconcile", tags=["AI Copilot"])
def reconcile_invoice(invoice_id: int, db: Session = Depends(get_db)):
    """
    Feature 2: Analyzes mismatch variance and generates one-click UI resolution advice.
    """
    db_invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if not db_invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Invoice with id {invoice_id} not found"
        )
    
    analysis = ai_service.suggest_reconciliation(
        invoice_number=db_invoice.invoice_number,
        amount=db_invoice.amount,
        erp_amount=db_invoice.erp_amount
    )
    return {
        "invoice_id": invoice_id,
        "ai_reconciliation": analysis
    }

@app.post("/api/copilot/chat", response_model=schemas.CopilotChatResponse, tags=["AI Copilot"])
def copilot_chat(request: schemas.CopilotChatRequest, db: Session = Depends(get_db)):
    """
    Feature 3: Full RAG conversational assistant answering queries grounded in SQLite records.
    """
    invoices = db.query(models.Invoice).all()
    records_context = []
    
    for inv in invoices:
        vendor = db.query(models.Vendor).filter(models.Vendor.id == inv.vendor_id).first()
        records_context.append({
            "invoice_number": inv.invoice_number,
            "vendor_name": vendor.name if vendor else "Unknown",
            "vendor_gstin": vendor.gstin if vendor else "N/A",
            "billed_amount": inv.amount,
            "erp_amount": inv.erp_amount,
            "variance": round(abs(inv.amount - inv.erp_amount), 2) if (inv.amount is not None and inv.erp_amount is not None) else 0.0,
            "status": inv.status,
            "ai_confidence": inv.ai_confidence
        })
    
    ai_reply = ai_service.ask_copilot(
        user_query=request.message,
        records_context=records_context
    )
    return schemas.CopilotChatResponse(response=ai_reply)

@app.post("/api/invoices/upload", tags=["AI Vision"])
async def upload_invoice_vision(file: UploadFile = File(...)):
    """
    Feature 4: Multimodal OCR endpoint. Ingests raw document image and extracts structured schema.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid file format. Upload must be an image (JPEG, PNG, WebP)."
        )
    
    image_bytes = await file.read()
    
    extracted_data = ai_service.extract_invoice_data(
        image_bytes=image_bytes, 
        mime_type=file.content_type
    )
    
    return {
        "status": "success",
        "filename": file.filename,
        "ai_extraction": extracted_data
    }