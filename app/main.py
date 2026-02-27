from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pdfplumber
import io
from .skills import extract_skills
from .analyzer import analyze_skill_gap
from .roadmap import generate_roadmap
from .jd_matcher import compare_with_jd
from .job_recommender import get_job_recommendations

class RoadmapRequest(BaseModel):
    missing_skills: list
    target_role: str

class JDCompareRequest(BaseModel):
    resume_skills: list
    job_description: str

class JobRecommendRequest(BaseModel):
    user_skills: list
    target_role: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.post("/analyze-gap")
async def analyze_gap(extracted_skills: list, target_role: str):
    return analyze_skill_gap(extracted_skills, target_role)

@app.post("/generate-roadmap")
async def create_roadmap(request: RoadmapRequest):
    try:
        result = generate_roadmap(request.missing_skills, request.target_role)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating roadmap: {str(e)}")

@app.post("/analyze")
async def analyze(file: UploadFile = File(...), target_role: str = "SDE"):
    try:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        content = await file.read()
        text = ""
        
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
        
        # Debug: Print extracted text
        print(f"\n=== EXTRACTED TEXT ===")
        print(text[:500])  # First 500 chars
        
        skills = extract_skills(text)
        print(f"\n=== EXTRACTED SKILLS ===")
        print(f"Found {len(skills)} skills: {skills}")
        
        gap_analysis = analyze_skill_gap(skills, target_role)
        print(f"\n=== GAP ANALYSIS ===")
        print(f"Role: {target_role}")
        print(f"Matched: {gap_analysis['matched_skills']}")
        print(f"Missing: {gap_analysis['missing_skills']}")
        print(f"Score: {gap_analysis['readiness_percentage']}%")
        
        return {
            "matched_skills": gap_analysis["matched_skills"],
            "missing_skills": gap_analysis["missing_skills"],
            "readiness_score": gap_analysis["readiness_percentage"],
            "total_skills_found": len(skills)
        }
    except Exception as e:
        print(f"Error in analyze: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.post("/compare-jd")
async def compare_job_description(request: JDCompareRequest):
    try:
        result = compare_with_jd(request.resume_skills, request.job_description)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.post("/job-recommendations")
async def job_recommendations(request: JobRecommendRequest):
    try:
        jobs = get_job_recommendations(request.user_skills, request.target_role)
        return {"jobs": jobs, "total": len(jobs)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
