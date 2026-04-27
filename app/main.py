from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pdfplumber
import io
import time
from datetime import date
from .skills import extract_skills
from .analyzer import analyze_skill_gap
from .roadmap import generate_roadmap
from .jd_matcher import compare_with_jd
from .job_recommender import get_job_recommendations
from .ats_scorer import calculate_ats_score
from .ai_suggestions import get_ai_suggestions, rewrite_resume_bullets
from .auth import (
    RegisterRequest, LoginRequest, register_user, login_user,
    get_current_user, save_user_analysis, get_user_history
)

class RoadmapRequest(BaseModel):
    missing_skills: list
    target_role: str

class JDCompareRequest(BaseModel):
    resume_skills: list
    job_description: str

class JobRecommendRequest(BaseModel):
    user_skills: list
    target_role: str

class ATSRequest(BaseModel):
    resume_text: str
    target_role: str

class SuggestionsRequest(BaseModel):
    resume_text: str
    target_role: str
    missing_skills: list

class RewriteRequest(BaseModel):
    resume_text: str
    target_role: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/auth/register")
async def register(req: RegisterRequest):
    return register_user(req)

@app.post("/auth/login")
async def login(req: LoginRequest):
    return login_user(req)

@app.get("/auth/history")
async def history(request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {"history": get_user_history(user["email"])}

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    content = await file.read()
    text = ""
    with pdfplumber.open(io.BytesIO(content)) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    skills = extract_skills(text)
    return {"text": text, "skills": skills}

@app.post("/analyze")
async def analyze(request: Request, file: UploadFile = File(...), target_role: str = "SDE"):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    try:
        content = await file.read()
        text = ""
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""

        skills = extract_skills(text)
        gap_analysis = analyze_skill_gap(skills, target_role)

        result = {
            "matched_skills": gap_analysis["matched_skills"],
            "missing_skills": gap_analysis["missing_skills"],
            "readiness_score": gap_analysis["readiness_percentage"],
            "total_skills_found": len(skills),
            "resume_text": text
        }

        # Save to user history if logged in
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]
            from .auth import _load_users, _save_users
            users = _load_users()
            for email, u in users.items():
                if u.get("token") == token:
                    save_user_analysis(email, {
                        "id": time.time(),
                        "date": date.today().isoformat(),
                        "role": target_role,
                        "score": gap_analysis["readiness_percentage"],
                        "matched": len(gap_analysis["matched_skills"]),
                        "missing": len(gap_analysis["missing_skills"]),
                        "fileName": file.filename
                    })
                    break

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing resume: {str(e)}")

@app.post("/ats-score")
async def ats_score(req: ATSRequest):
    try:
        return calculate_ats_score(req.resume_text, req.target_role)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai-suggestions")
async def ai_suggestions(req: SuggestionsRequest):
    try:
        return get_ai_suggestions(req.resume_text, req.target_role, req.missing_skills)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/rewrite-resume")
async def rewrite_resume(req: RewriteRequest):
    try:
        return rewrite_resume_bullets(req.resume_text, req.target_role)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-roadmap")
async def create_roadmap(request: RoadmapRequest):
    try:
        return generate_roadmap(request.missing_skills, request.target_role)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating roadmap: {str(e)}")

@app.post("/compare-jd")
async def compare_job_description(request: JDCompareRequest):
    try:
        return compare_with_jd(request.resume_skills, request.job_description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.post("/job-recommendations")
async def job_recommendations(request: JobRecommendRequest):
    try:
        jobs = get_job_recommendations(request.user_skills, request.target_role)
        return {"jobs": jobs, "total": len(jobs)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
