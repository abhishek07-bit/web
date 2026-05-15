import os
import io
from pypdf import PdfReader
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import Resume, User
from app.auth.routes import get_current_user
from app.core.config import settings

router = APIRouter()

# A simple list of skills to match against for extraction
COMMON_SKILLS = [
    "Python", "Java", "C++", "C#", "JavaScript", "TypeScript", "React", "Angular", "Vue",
    "Node.js", "Express", "Django", "FastAPI", "Flask", "Spring Boot", "Ruby on Rails",
    "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "Cassandra",
    "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Terraform", "Jenkins", "Git",
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "NLP", "Computer Vision",
    "System Design", "Microservices", "REST API", "GraphQL", "Agile", "Scrum",
    "HTML", "CSS", "SASS", "Tailwind", "Next.js", "Nuxt.js", "Redux", "Zustand"
]

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if file.size and file.size > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max 5MB.")

    if not file.filename or not file.filename.lower().endswith((".pdf", ".docx")):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")

    # Save file
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, f"{current_user.id}_{file.filename}")
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    extracted_skills = []
    parsed_text_str = ""
    
    import asyncio
    
    def extract_pdf_text(b_content):
        text = ""
        reader = PdfReader(io.BytesIO(b_content))
        for page in reader.pages:
            text += page.extract_text() + " "
        return text

    def extract_docx_text(b_content):
        from docx import Document
        doc = Document(io.BytesIO(b_content))
        return " ".join([p.text for p in doc.paragraphs])

    # Real PDF parsing
    if file.filename.lower().endswith(".pdf"):
        try:
            parsed_text_str = await asyncio.get_event_loop().run_in_executor(None, extract_pdf_text, content)
        except Exception as e:
            raise HTTPException(status_code=422, detail="Failed to parse PDF document.")
            
    # Real DOCX parsing
    elif file.filename.lower().endswith(".docx"):
        try:
            parsed_text_str = await asyncio.get_event_loop().run_in_executor(None, extract_docx_text, content)
        except Exception as e:
            raise HTTPException(status_code=422, detail="Failed to parse DOCX document.")

    if parsed_text_str:
        text_lower = parsed_text_str.lower()
        # Extract skills by matching against the common skills list
        for skill in COMMON_SKILLS:
            if skill.lower() in text_lower:
                extracted_skills.append(skill)
    # Deduplicate and sort
    extracted_skills = sorted(list(set(extracted_skills)))

    resume = Resume(
        user_id=current_user.id,
        file_name=file.filename,
        file_path=file_path,
        file_size=len(content),
        skills=extracted_skills,
        experience=[],
        parsed_text=parsed_text_str
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return {
        "id": resume.id,
        "fileName": resume.file_name,
        "fileSize": f"{len(content) / 1024 / 1024:.1f} MB",
        "skills": resume.skills,
        "uploadedAt": resume.uploaded_at.isoformat(),
    }


@router.get("/skills")
def get_skills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.uploaded_at.desc())
        .first()
    )
    if not resume:
        return {"skills": [], "message": "No resume uploaded yet"}

    return {"skills": resume.skills, "fileName": resume.file_name}

from app.services.ai_service import analyze_resume, analyze_job_match
from pydantic import BaseModel

class MatchRequest(BaseModel):
    jobDescription: str

@router.post("/analyze/{resume_id}")
async def run_resume_analysis(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    if not resume.parsed_text:
        raise HTTPException(status_code=400, detail="Resume text could not be parsed previously")
        
    # Check if already analyzed to save AI credits
    if resume.analysis:
        return resume.analysis
        
    analysis_result = await analyze_resume(resume.parsed_text)
    
    # Save back to DB
    resume.analysis = analysis_result
    db.commit()
    
    return analysis_result

@router.post("/match/{resume_id}")
async def match_resume_to_job(
    resume_id: str,
    req: MatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    if not resume.parsed_text:
        raise HTTPException(status_code=400, detail="Resume text could not be parsed previously")
        
    match_result = await analyze_job_match(resume.parsed_text, req.jobDescription)
    return match_result
