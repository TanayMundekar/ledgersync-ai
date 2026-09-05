## LedgerSync AI

LedgerSync AI is an automated financial reconciliation engine designed to resolve multi-way matching discrepancies between purchase orders, goods receipt notes (GRNs), and vendor invoices. It leverages deterministic logic alongside LLM-based OCR to flag compliance risks and accelerate month-end closures.

### System Architecture

The application is built on a decoupled client-server architecture, separating the UI presentation layer from the data processing and AI orchestration layer.

*   **Frontend (React, Vite, Tailwind CSS, Framer Motion):** Handles high-density data visualization, state management, and the enterprise glassmorphic UI.
*   **Backend (Python, FastAPI, Uvicorn):** Manages RESTful API routing, strict payload validation, and core business logic.
*   **Database (SQLite):** Provides lightweight local relational data storage and strict foreign key enforcement.
*   **AI Integrations (Google Gemini API):** Powers unstructured document parsing (OCR) and generates human-readable variance diagnostics.

### Technical Roadmap

The current iteration serves as a complete MVP, the following architectural improvements are planned for deployment:

*   **Database Migration:** Transition from local SQLite to a managed PostgreSQL instance to enforce robust row-level security and true multi-tenancy.
*   **Service Abstraction:** Decouple inline fetch requests into a dedicated API client layer and custom React hooks for cleaner state management.
*   **Authentication:** Implement formal OAuth2/JWT workflows integrating with enterprise Single Sign-On (SSO) providers.

### Local Setup Instructions

The repository contains both the client and server applications. Two terminal sessions are required to run the environment locally.

**1. Initialize the Backend**
```bash
cd ledgersync-backend
python -m venv venv
venv\Scripts\activate 
pip install -r requirements.txt
uvicorn main:app --reload
```
The FastAPI server will initialize on http://127.0.0.1:8000

**2. Initialize the Frontend**
```bash
cd ledgersync-dashboard
npm install
npm run dev
```
The Vite development server will initialize on http://localhost:5173
