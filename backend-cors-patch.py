# Add these imports near the top of your existing main.py
import os
from fastapi.middleware.cors import CORSMiddleware

# Add this immediately after: app = FastAPI(...)
# Set FRONTEND_ORIGINS on Render to your deployed frontend URL(s), comma-separated.
origins = [x.strip() for x in os.getenv("FRONTEND_ORIGINS", "").split(",") if x.strip()]
if not origins:
    origins = ["http://localhost:8000", "http://localhost:5500"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)
