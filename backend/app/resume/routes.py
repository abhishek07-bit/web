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
    
    # Real PDF parsing
    if file.filename.lower().endswith(".pdf"):
        try:
            reader = PdfReader(io.BytesIO(content))
            for page in reader.pages:
                parsed_text_str += page.extract_text() + " "
                
            text_lower = parsed_text_str.lower()
            # Extract skills by matching against the common skills list
            for skill in COMMON_SKILLS:
                if skill.lower() in text_lower:
                    extracted_skills.append(skill)
        except Exception as e:
            print(f"Failed to parse PDF: {e}")
            extracted_skills = ["Parsing Error"]

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

from app.services.ai_service import analyze_resume

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
