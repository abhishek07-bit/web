from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.services import ai_service

app = FastAPI(
    title="PrepMate AI API",
    description="Adaptive Interview Preparation Platform API",
    version="1.0.0",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:8001",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "PrepMate AI API is running", "version": "1.0.0"}


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/api/ai/status")
async def ai_provider_status():
    """Check status of all AI providers in the fallback stack."""
    results = await ai_service.check_providers()
    working = [name for name, info in results.items() if info["status"] == "ok"]
    return {
        "stack_order": ["gemini", "groq", "openrouter", "cerebras"],
        "working_count": len(working),
        "providers": results,
    }


# Auth routes
from app.auth.routes import router as auth_router
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])

# Resume routes
from app.resume.routes import router as resume_router
app.include_router(resume_router, prefix="/api/resume", tags=["Resume"])

# Interview routes
from app.api.routes import router as interview_router
app.include_router(interview_router, prefix="/api/interview", tags=["Interview"])

# Analytics routes
from app.analytics.routes import router as analytics_router
app.include_router(analytics_router, prefix="/api/analytics", tags=["Analytics"])


@app.on_event("startup")
async def startup():
    from app.db.database import init_db
    import firebase_admin
    from firebase_admin import credentials
    import os

    # Init Database
    init_db()

    # Init Firebase
    service_account_path = "firebase-service-account.json"
    if os.path.exists(service_account_path):
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)
        print("[PrepMate] Firebase Admin initialized.")
    else:
        print("[PrepMate] Firebase Service Account not found. Firebase auth disabled.")
