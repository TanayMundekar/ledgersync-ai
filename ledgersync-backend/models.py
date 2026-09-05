from typing import List, Optional
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base

# --- USERS TABLE ---
class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column()
    role: Mapped[str] = mapped_column(default="Viewer")  

# --- VENDORS TABLE ---
class Vendor(Base):
    __tablename__ = "vendors"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(index=True)
    gstin: Mapped[str] = mapped_column(unique=True, index=True)
    
    # STRICT TYPING: We explicitly tell Python this is a "List" of Invoices
    invoices: Mapped[List["Invoice"]] = relationship(back_populates="vendor")

# --- INVOICES TABLE ---
class Invoice(Base):
    __tablename__ = "invoices"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    invoice_number: Mapped[str] = mapped_column(unique=True, index=True)
    
    amount: Mapped[float] = mapped_column()
    
    # STRICT TYPING: We use "Optional" to explicitly state this can be null/empty
    erp_amount: Mapped[Optional[float]] = mapped_column()
    
    status: Mapped[str] = mapped_column(default="Pending")
    
    # STRICT TYPING: We use "Optional" here too
    ai_confidence: Mapped[Optional[float]] = mapped_column()
    
    vendor_id: Mapped[int] = mapped_column(ForeignKey("vendors.id"))
    
    # STRICT TYPING: We explicitly tell Python this points to a single "Vendor"
    vendor: Mapped["Vendor"] = relationship(back_populates="invoices")