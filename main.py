import os
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Tesfa Credit Union API",
    version="1.0.0",
    description="Backend API for the Tesfa Credit Union application.",
)

# Set FRONTEND_ORIGINS on Render to a comma-separated list of your deployed
# frontend URLs, e.g. https://tesfa-frontend.onrender.com
origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", "*").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=origins != ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "app": "Tesfa Credit Union",
        "status": "online",
        "message": "Tesfa backend is running",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "tesfa-backend",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/dashboard")
async def dashboard():
    """Safe starter dashboard endpoint for frontend integration.

    Financial figures are placeholders until a real database/accounting source
    is connected; no financial records are invented by this API.
    """
    return {
        "status": "ok",
        "organization": "Tesfa Credit Union",
        "summary": {
            "members": None,
            "branches": None,
            "total_deposits": None,
            "total_loans": None,
        },
        "notice": "Connect the production database to populate financial data.",
    }
