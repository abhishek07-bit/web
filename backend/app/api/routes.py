from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.database import get_db
from app.models.models import InterviewSession, Question, Answer, User
from app.auth.routes import get_current_user
from app.services import ai_service

router = APIRouter()


class SetupRequest(BaseModel):
    role: str
    company: str
    persona: str
    rigorLevel: int
    skills: list[str] = []


class AnswerRequest(BaseModel):
    text: str
    confidence: str
    duration: int


@router.post("/setup")
async def setup_interview(
    req: SetupRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = InterviewSession(
        user_id=current_user.id,
        role=req.role,
        company=req.company,
        persona=req.persona,
        rigor_level=req.rigorLevel,
        status="setup",
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Generate questions using AI fallback stack
    try:
        ai_questions = await ai_service.generate_interview_questions(
            role=req.role,
            company=req.company,
            persona=req.persona,
            rigor_level=req.rigorLevel,
            skills=req.skills,
            num_questions=5,
        )
    except Exception as e:
        # Use hardcoded fallback if all AI providers fail
        ai_questions = ai_service._fallback_questions(req.role, req.company, 5)

    for i, q in enumerate(ai_questions):
        question = Question(
            session_id=session.id,
            category=q.get("category", "General"),
            text=q.get("text", "Tell me about yourself."),
            sub_prompt=q.get("sub_prompt"),
            time_limit=q.get("time_limit", 300),
            order_num=i + 1,
        )
        db.add(question)

    session.status = "active"
    db.commit()

    return {"sessionId": session.id, "status": "active", "questionCount": len(ai_questions)}


@router.get("/{session_id}/questions")
def get_questions(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id,
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    questions = db.query(Question).filter(Question.session_id == session_id).order_by(Question.order_num).all()

    return [
        {
            "id": q.id,
            "category": q.category,
            "text": q.text,
            "subPrompt": q.sub_prompt,
            "timeLimit": q.time_limit,
            "order": q.order_num,
        }
        for q in questions
    ]


@router.post("/answer/{question_id}")
async def submit_answer(
    question_id: str,
    req: AnswerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    # Evaluate answer using AI
    session = db.query(InterviewSession).filter(InterviewSession.id == question.session_id).first()
    try:
        evaluation = await ai_service.evaluate_answer(
            question=question.text,
            answer=req.text,
            role=session.role if session else "Software Engineer",
            company=session.company if session else "Tech Company",
        )
    except Exception:
        evaluation = {"score": 70, "feedback": "Response recorded.", "strengths": [], "improvements": []}

    answer = Answer(
        question_id=question_id,
        text=req.text,
        confidence=req.confidence,
        duration=req.duration,
        score=evaluation.get("score", 70),
        feedback_text=evaluation.get("feedback", ""),
    )
    db.add(answer)
    db.commit()

    return {
        "status": "submitted",
        "score": answer.score,
        "feedback": evaluation.get("feedback", ""),
        "strengths": evaluation.get("strengths", []),
        "improvements": evaluation.get("improvements", []),
    }


@router.get("/{session_id}/feedback")
async def get_feedback(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id,
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Gather questions and answers
    questions = db.query(Question).filter(Question.session_id == session_id).order_by(Question.order_num).all()
    question_ids = [q.id for q in questions]
    answers = db.query(Answer).filter(Answer.question_id.in_(question_ids)).all()
    answer_map = {a.question_id: a for a in answers}
    
    qa_pairs = []
    for q in questions:
        answer = answer_map.get(q.id)
        qa_pairs.append({
            "category": q.category,
            "question": q.text,
            "answer": answer.text if answer else "No answer provided.",
        })

    # Generate AI feedback
    try:
        feedback = await ai_service.generate_session_feedback(
            questions_and_answers=qa_pairs,
            role=session.role,
            company=session.company,
        )
    except Exception:
        feedback = ai_service._fallback_feedback()

    return {
        "sessionId": session_id,
        **feedback,
    }

@router.get("/company/{company_name}")
async def get_company_prep(
    company_name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        # We can reuse ai_service to generate this, but for now we'll do a simple mock
        # if the AI service doesn't have a specific method.
        # Ideally, we'd add `generate_company_prep` to ai_service.
        prep = await ai_service.generate_company_prep(company_name)
    except Exception as e:
        print(f"Error generating company prep: {e}")
        # Fallback
        prep = {
            "company": company_name,
            "description": f"A targeted preparation path for {company_name}.",
            "isFallback": True,
            "corePhilosophy": [
                {"title": "Leadership Principles", "desc": "Focus on data-driven decision making and bias for action.", "icon": "Brain"},
                {"title": "System Design Focus", "desc": "Expect heavy focus on scalability and high availability.", "icon": "Code"},
                {"title": "Behavioral Expectations", "desc": "Strong emphasis on conflict resolution and cross-functional collaboration.", "icon": "Globe"}
            ],
            "targetedScenarios": [
                {"title": "Design a globally distributed system.", "category": "System Design", "time": "45 mins", "desc": "Focus on synchronization strategies."},
                {"title": "Find the longest valid sequence.", "category": "Algorithms", "time": "20 mins", "desc": "Requires dynamic programming."},
                {"title": "Tell me about a time you failed.", "category": "Behavioral", "time": "15 mins", "desc": "Assess framing of ambiguity and learning."}
            ]
        }
    return prep
