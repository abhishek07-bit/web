from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import User, InterviewSession, Question, Answer
from app.auth.routes import get_current_user
import collections

router = APIRouter()

@router.get("/readiness")
def get_readiness(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Calculate real readiness score based on recent sessions
    sessions = db.query(InterviewSession).filter(InterviewSession.user_id == current_user.id, InterviewSession.status == "completed").order_by(InterviewSession.created_at.desc()).limit(10).all()
    
    if not sessions:
        return {"readinessScore": 0, "trend": 0, "criticalGaps": 0, "avgResolutionTime": "0m"}
    
    # Calculate average score
    total_score = sum((s.score or 0) for s in sessions)
    avg_score = int(total_score / len(sessions)) if sessions else 0
    
    # Calculate trend (compare last 5 to previous 5)
    recent = sessions[:5]
    older = sessions[5:]
    recent_avg = sum((s.score or 0) for s in recent) / len(recent) if recent else 0
    older_avg = sum((s.score or 0) for s in older) / len(older) if older else 0
    trend = int(recent_avg - older_avg)
    
    # Calculate critical gaps (sessions with score < 60)
    gaps = sum(1 for s in sessions if (s.score or 0) < 60)
    
    # Avg duration
    total_duration = sum((s.duration or 0) for s in sessions)
    avg_dur = total_duration / len(sessions) if sessions else 0
    avg_dur_mins = f"{int(avg_dur // 60)}m"

    return {"readinessScore": avg_score, "trend": trend, "criticalGaps": gaps, "avgResolutionTime": avg_dur_mins}


@router.get("/weaknesses")
def get_weaknesses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Find weaknesses based on answer scores per category
    # We join Question and Answer to get categories and scores
    sessions = db.query(InterviewSession.id).filter(InterviewSession.user_id == current_user.id).all()
    session_ids = [s[0] for s in sessions]
    
    if not session_ids:
        return {"topics": [
            {"name": "No Data Yet", "description": "Complete mock interviews to see your weaknesses.", "severity": 1}
        ]}
        
    questions = db.query(Question).filter(Question.session_id.in_(session_ids)).all()
    q_ids = [q.id for q in questions]
    answers = db.query(Answer).filter(Answer.question_id.in_(q_ids)).all()
    
    # Group by category
    category_scores = collections.defaultdict(list)
    for q in questions:
        # find answer for this question
        ans = next((a for a in answers if a.question_id == q.id), None)
        if ans and ans.score is not None:
            cat_name = q.category if q.category else "Uncategorized"
            category_scores[cat_name].append(ans.score)
            
    topics = []
    for cat, scores in category_scores.items():
        if not scores:
            continue
        avg = sum(scores) / len(scores)
        if avg < 75:  # Weakness threshold
            severity = 3 if avg < 60 else (2 if avg < 70 else 1)
            topics.append({
                "name": cat,
                "description": f"Average score is {int(avg)}%. Needs improvement.",
                "severity": severity
            })
            
    # Sort by severity descending
    topics.sort(key=lambda x: x["severity"], reverse=True)
    
    if not topics:
        topics = [{"name": "All Good", "description": "You are performing well across all categories!", "severity": 1}]
        
    return {"topics": topics[:3]}


@router.get("/history")
def get_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    sessions = db.query(InterviewSession).filter(
        InterviewSession.user_id == current_user.id
    ).order_by(InterviewSession.created_at.desc()).offset(skip).limit(limit).all()
    
    return [
        {
            "id": s.id,
            "role": s.role,
            "company": s.company,
            "persona": s.persona,
            "score": s.score,
            "duration": s.duration,
            "createdAt": s.created_at.isoformat(),
        }
        for s in sessions
    ]
