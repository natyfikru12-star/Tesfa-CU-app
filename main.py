import os
from datetime import datetime, timezone
from decimal import Decimal

import psycopg
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from psycopg.rows import dict_row


app = FastAPI(
    title="Tesfa Credit Union API",
    version="2.0.0",
    description="Database-backed API for Tesfa Credit Union",
)


# -----------------------------
# CORS
# -----------------------------

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


# -----------------------------
# PostgreSQL
# -----------------------------

DATABASE_URL = os.getenv("DATABASE_URL")


def get_connection():
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is not configured")

    return psycopg.connect(
        DATABASE_URL,
        row_factory=dict_row,
    )


def initialize_database():
    with get_connection() as conn:
        with conn.cursor() as cur:

            cur.execute("""
                CREATE TABLE IF NOT EXISTS branches (
                    id BIGSERIAL PRIMARY KEY,
                    name VARCHAR(150) NOT NULL,
                    code VARCHAR(50) UNIQUE,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
            """)

            cur.execute("""
                CREATE TABLE IF NOT EXISTS members (
                    id BIGSERIAL PRIMARY KEY,
                    branch_id BIGINT REFERENCES branches(id),
                    full_name VARCHAR(200) NOT NULL,
                    phone VARCHAR(50),
                    email VARCHAR(200),
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
            """)

            cur.execute("""
                CREATE TABLE IF NOT EXISTS accounts (
                    id BIGSERIAL PRIMARY KEY,
                    member_id BIGINT NOT NULL REFERENCES members(id),
                    balance NUMERIC(18,2) NOT NULL DEFAULT 0,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
            """)

            cur.execute("""
                CREATE TABLE IF NOT EXISTS loans (
                    id BIGSERIAL PRIMARY KEY,
                    member_id BIGINT NOT NULL REFERENCES members(id),
                    amount NUMERIC(18,2) NOT NULL DEFAULT 0,
                    status VARCHAR(30) NOT NULL DEFAULT 'pending',
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
            """)

        conn.commit()


@app.on_event("startup")
def startup():
    initialize_database()


# -----------------------------
# Basic endpoints
# -----------------------------

@app.get("/")
def root():
    return {
        "app": "Tesfa Credit Union",
        "status": "online",
        "message": "Tesfa backend is running",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
                cur.fetchone()

        database_status = "connected"

    except Exception as exc:
        database_status = f"error: {type(exc).__name__}"

    return {
        "status": "ok",
        "service": "tesfa-backend",
        "database": database_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# -----------------------------
# Dashboard
# -----------------------------

@app.get("/api/dashboard")
def dashboard():
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:

                cur.execute("SELECT COUNT(*) AS count FROM members")
                members = cur.fetchone()["count"]

                cur.execute("SELECT COUNT(*) AS count FROM branches")
                branches = cur.fetchone()["count"]

                cur.execute("""
                    SELECT COALESCE(SUM(balance), 0) AS total
                    FROM accounts
                """)
                total_deposits = cur.fetchone()["total"]

                cur.execute("""
                    SELECT COALESCE(SUM(amount), 0) AS total
                    FROM loans
                """)
                total_loans = cur.fetchone()["total"]

        return {
            "status": "ok",
            "organization": "Tesfa Credit Union",
            "summary": {
                "members": members,
                "branches": branches,
                "total_deposits": float(
                    total_deposits or Decimal("0")
                ),
                "total_loans": float(
                    total_loans or Decimal("0")
                ),
            },
            "database": "connected",
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {type(exc).__name__}",
        )
