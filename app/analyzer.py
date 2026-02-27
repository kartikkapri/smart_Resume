ROLE_SKILLS = {
    "SDE": ["Python", "Java", "C++", "Data Structures", "Algorithms", "DBMS", "SQL", "Git", "REST", "API"],
    "AI-ML": ["Python", "ML", "Machine Learning", "AI", "Deep Learning", "TensorFlow", "PyTorch", "NumPy", "Pandas"],
    "DevOps": ["Docker", "Kubernetes", "AWS", "Cloud", "CI/CD", "Git", "Linux", "Jenkins", "Terraform"],
    "DS": ["Python", "SQL", "Machine Learning", "ML", "Pandas", "NumPy", "Scikit-learn", "MongoDB", "PostgreSQL"]
}

def normalize_skills(skills: list) -> set:
    """Normalize skills to avoid duplicates"""
    normalized = set()
    for skill in skills:
        skill_lower = skill.lower()
        # Map variations to standard names
        if skill_lower in ['dsa', 'data structures', 'algorithms', 'data structure', 'algorithm']:
            normalized.add('Data Structures')
            normalized.add('Algorithms')
        elif skill_lower in ['rest', 'api', 'rest api', 'restful']:
            normalized.add('REST')
            normalized.add('API')
        else:
            normalized.add(skill)
    return normalized

def analyze_skill_gap(extracted_skills: list, target_role: str) -> dict:
    if target_role not in ROLE_SKILLS:
        return {"error": "Invalid role"}
    
    required = set(ROLE_SKILLS[target_role])
    extracted = normalize_skills(extracted_skills)
    
    matched = list(required & extracted)
    missing = list(required - extracted)
    readiness = round((len(matched) / len(required)) * 100, 2) if required else 0
    
    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "readiness_percentage": readiness
    }
