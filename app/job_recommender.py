import random

# Mock job database - In production, integrate with real job APIs like LinkedIn, Indeed, etc.
JOB_DATABASE = {
    "SDE": [
        # Fresher Jobs
        {"company": "TCS", "title": "Software Engineer Trainee", "location": "Multiple Locations", "experience": "0-1 years", "salary": "₹3.5-5 LPA", "skills": ["Python", "Java", "SQL"], "apply_link": "https://www.tcs.com/careers"},
        {"company": "Infosys", "title": "Systems Engineer", "location": "Bangalore/Pune", "experience": "0-1 years", "salary": "₹4-6 LPA", "skills": ["Java", "Python", "DBMS"], "apply_link": "https://www.infosys.com/careers"},
        {"company": "Wipro", "title": "Project Engineer", "location": "Multiple Locations", "experience": "0-2 years", "salary": "₹3.5-5.5 LPA", "skills": ["Python", "SQL", "Git"], "apply_link": "https://careers.wipro.com"},
        {"company": "Cognizant", "title": "Programmer Analyst", "location": "Chennai/Bangalore", "experience": "0-1 years", "salary": "₹4-6 LPA", "skills": ["Java", "Python", "SQL"], "apply_link": "https://careers.cognizant.com"},
        {"company": "Accenture", "title": "Application Development Associate", "location": "Multiple Locations", "experience": "0-2 years", "salary": "₹4.5-6.5 LPA", "skills": ["Python", "Java", "Git"], "apply_link": "https://www.accenture.com/in-en/careers"},
        # Experienced Jobs
        {"company": "Google", "title": "Software Engineer", "location": "Bangalore", "experience": "2-4 years", "salary": "₹25-35 LPA", "skills": ["Python", "Java", "DSA", "SQL"], "apply_link": "https://careers.google.com"},
        {"company": "Microsoft", "title": "SDE-2", "location": "Hyderabad", "experience": "3-5 years", "salary": "₹30-40 LPA", "skills": ["C++", "Algorithms", "Git", "REST"], "apply_link": "https://careers.microsoft.com"},
        {"company": "Amazon", "title": "Software Development Engineer", "location": "Bangalore", "experience": "2-5 years", "salary": "₹28-38 LPA", "skills": ["Java", "Python", "AWS", "DBMS"], "apply_link": "https://www.amazon.jobs"},
    ],
    "AI-ML": [
        # Fresher Jobs
        {"company": "TCS", "title": "AI/ML Trainee", "location": "Bangalore/Pune", "experience": "0-1 years", "salary": "₹4-6 LPA", "skills": ["Python", "ML", "Pandas"], "apply_link": "https://www.tcs.com/careers"},
        {"company": "Infosys", "title": "Data Science Associate", "location": "Bangalore", "experience": "0-2 years", "salary": "₹5-7 LPA", "skills": ["Python", "ML", "SQL"], "apply_link": "https://www.infosys.com/careers"},
        {"company": "Wipro", "title": "ML Engineer Trainee", "location": "Bangalore/Hyderabad", "experience": "0-1 years", "salary": "₹4.5-6.5 LPA", "skills": ["Python", "ML", "NumPy"], "apply_link": "https://careers.wipro.com"},
        # Experienced Jobs
        {"company": "Google", "title": "ML Engineer", "location": "Bangalore", "experience": "3-5 years", "salary": "₹35-50 LPA", "skills": ["Python", "TensorFlow", "ML", "Deep Learning"], "apply_link": "https://careers.google.com"},
        {"company": "Microsoft", "title": "AI Research Engineer", "location": "Hyderabad", "experience": "4-6 years", "salary": "₹40-55 LPA", "skills": ["Python", "PyTorch", "NLP", "AI"], "apply_link": "https://careers.microsoft.com"},
    ],
    "DevOps": [
        # Fresher Jobs
        {"company": "TCS", "title": "DevOps Trainee", "location": "Multiple Locations", "experience": "0-1 years", "salary": "₹3.5-5.5 LPA", "skills": ["Linux", "Git", "Docker"], "apply_link": "https://www.tcs.com/careers"},
        {"company": "Infosys", "title": "Cloud Engineer Associate", "location": "Bangalore/Pune", "experience": "0-2 years", "salary": "₹4.5-6.5 LPA", "skills": ["AWS", "Docker", "Git"], "apply_link": "https://www.infosys.com/careers"},
        {"company": "Wipro", "title": "DevOps Engineer Trainee", "location": "Bangalore", "experience": "0-1 years", "salary": "₹4-6 LPA", "skills": ["Docker", "Kubernetes", "Git"], "apply_link": "https://careers.wipro.com"},
        # Experienced Jobs
        {"company": "Google", "title": "DevOps Engineer", "location": "Bangalore", "experience": "3-5 years", "salary": "₹30-45 LPA", "skills": ["Docker", "Kubernetes", "AWS", "CI/CD"], "apply_link": "https://careers.google.com"},
        {"company": "Amazon", "title": "Site Reliability Engineer", "location": "Bangalore", "experience": "3-6 years", "salary": "₹32-48 LPA", "skills": ["AWS", "Docker", "Linux", "Python"], "apply_link": "https://www.amazon.jobs"},
    ],
    "DS": [
        # Fresher Jobs
        {"company": "TCS", "title": "Data Analyst Trainee", "location": "Multiple Locations", "experience": "0-1 years", "salary": "₹3.5-5.5 LPA", "skills": ["Python", "SQL", "Pandas"], "apply_link": "https://www.tcs.com/careers"},
        {"company": "Infosys", "title": "Data Science Associate", "location": "Bangalore/Pune", "experience": "0-2 years", "salary": "₹4.5-7 LPA", "skills": ["Python", "SQL", "ML"], "apply_link": "https://www.infosys.com/careers"},
        {"company": "Wipro", "title": "Data Analyst", "location": "Bangalore", "experience": "0-1 years", "salary": "₹4-6 LPA", "skills": ["Python", "SQL", "Pandas"], "apply_link": "https://careers.wipro.com"},
        # Experienced Jobs
        {"company": "Google", "title": "Data Scientist", "location": "Bangalore", "experience": "2-5 years", "salary": "₹30-45 LPA", "skills": ["Python", "SQL", "ML", "Pandas"], "apply_link": "https://careers.google.com"},
        {"company": "Amazon", "title": "Business Intelligence Engineer", "location": "Bangalore", "experience": "2-5 years", "salary": "₹25-38 LPA", "skills": ["SQL", "Python", "ML", "AWS"], "apply_link": "https://www.amazon.jobs"},
    ]
}

def calculate_match_score(user_skills: list, job_skills: list) -> int:
    """Calculate match percentage between user skills and job requirements"""
    user_skills_set = set([s.lower() for s in user_skills])
    job_skills_set = set([s.lower() for s in job_skills])
    
    if not job_skills_set:
        return 0
    
    matched = user_skills_set & job_skills_set
    return round((len(matched) / len(job_skills_set)) * 100)

def get_skill_breakdown(user_skills: list, job_skills: list) -> dict:
    """Get matched and missing skills for a job"""
    user_skills_set = set([s.lower() for s in user_skills])
    job_skills_set = set([s.lower() for s in job_skills])
    
    matched = [s for s in job_skills if s.lower() in user_skills_set]
    missing = [s for s in job_skills if s.lower() not in user_skills_set]
    
    return {"matched": matched, "missing": missing}

def get_job_recommendations(user_skills: list, target_role: str, limit: int = 6) -> list:
    """Get job recommendations based on user skills and target role"""
    
    if target_role not in JOB_DATABASE:
        return []
    
    jobs = JOB_DATABASE[target_role]
    
    # Calculate match score for each job
    job_recommendations = []
    for job in jobs:
        match_score = calculate_match_score(user_skills, job["skills"])
        skill_breakdown = get_skill_breakdown(user_skills, job["skills"])
        job_recommendations.append({
            **job,
            "match_score": match_score,
            "matched_skills": skill_breakdown["matched"],
            "missing_skills": skill_breakdown["missing"]
        })
    
    # Sort by match score and experience (fresher jobs first if low skills)
    job_recommendations.sort(key=lambda x: (x["match_score"], -int(x["experience"].split("-")[0])), reverse=True)
    
    return job_recommendations[:limit]
