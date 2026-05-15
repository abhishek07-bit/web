from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.services import ai_service
from app.services.ai_service import AIProviderError
import os

app = FastAPI(
    title="PrepMate AI API",
    description="Adaptive Interview Preparation Platform API",
    version="1.0.0",
)

# CORS Middleware
# Restrict to explicitly allowed origins from environment
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

@app.exception_handler(AIProviderError)
async def ai_provider_exception_handler(request, exc: AIProviderError):
    return JSONResponse(
        status_code=503,
        content={"message": "AI Service Unavailable", "detail": str(exc)},
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
