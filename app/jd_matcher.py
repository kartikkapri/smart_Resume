import re
from .skills import extract_skills

def extract_jd_requirements(jd_text: str) -> dict:
    """Extract requirements from job description"""
    jd_lower = jd_text.lower()
    
    # Extract skills
    skills = extract_skills(jd_text)
    
    # Extract experience (simple pattern matching)
    experience = 0
    exp_patterns = [
        r'(\d+)\+?\s*years?\s*(?:of\s*)?experience',
        r'experience\s*(?:of\s*)?(\d+)\+?\s*years?'
    ]
    for pattern in exp_patterns:
        match = re.search(pattern, jd_lower)
        if match:
            experience = int(match.group(1))
            break
    
    return {
        "required_skills": skills,
        "experience_years": experience
    }

def compare_with_jd(resume_skills: list, jd_text: str) -> dict:
    """Compare resume skills with job description"""
    jd_requirements = extract_jd_requirements(jd_text)
    required_skills = set(jd_requirements["required_skills"])
    resume_skills_set = set(resume_skills)
    
    matched = list(required_skills & resume_skills_set)
    missing = list(required_skills - resume_skills_set)
    match_percentage = round((len(matched) / len(required_skills)) * 100, 2) if required_skills else 0
    
    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "match_percentage": match_percentage,
        "required_experience": jd_requirements["experience_years"],
        "total_required_skills": len(required_skills)
    }
