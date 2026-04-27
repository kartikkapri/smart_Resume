import re

REQUIRED_SECTIONS = ["experience", "education", "skills", "projects", "summary", "objective", "contact"]
ATS_KEYWORDS = {
    "SDE": ["python", "java", "c++", "sql", "git", "rest", "api", "algorithms", "data structures"],
    "AI-ML": ["python", "machine learning", "deep learning", "tensorflow", "pytorch", "numpy", "pandas", "nlp"],
    "DevOps": ["docker", "kubernetes", "aws", "ci/cd", "linux", "terraform", "jenkins", "git"],
    "DS": ["python", "sql", "pandas", "numpy", "machine learning", "visualization", "statistics"],
    "Frontend": ["react", "javascript", "typescript", "html", "css", "tailwind", "rest api", "git"],
    "Data Analyst": ["sql", "python", "excel", "tableau", "power bi", "pandas", "statistics", "visualization"],
}

def check_formatting(text: str) -> list:
    issues = []
    if len(text) < 200:
        issues.append("Resume seems too short — add more detail to projects and experience")
    if re.search(r'[^\x00-\x7F]', text):
        issues.append("Special/non-ASCII characters detected — may confuse ATS parsers")
    if text.count('\n') < 10:
        issues.append("Poor line structure — use clear section breaks and bullet points")
    if re.search(r'(table|column|header|footer)', text.lower()):
        issues.append("Possible table/column layout detected — ATS struggles with multi-column formats")
    if not re.search(r'\b\d{4}\b', text):
        issues.append("No dates found — add year ranges to experience and education")
    return issues

def check_sections(text: str) -> dict:
    text_lower = text.lower()
    found, missing = [], []
    for section in REQUIRED_SECTIONS:
        if section in text_lower:
            found.append(section.title())
        else:
            missing.append(section.title())
    completeness = round(len(found) / len(REQUIRED_SECTIONS) * 100)
    return {"found": found, "missing": missing, "completeness": completeness}

def check_keyword_density(text: str, role: str) -> dict:
    text_lower = text.lower()
    keywords = ATS_KEYWORDS.get(role, ATS_KEYWORDS["SDE"])
    word_count = max(len(text.split()), 1)
    found_keywords, density_map = [], {}
    for kw in keywords:
        count = text_lower.count(kw)
        if count > 0:
            found_keywords.append(kw)
            density_map[kw] = round((count / word_count) * 100, 2)
    missing_keywords = [kw for kw in keywords if kw not in found_keywords]
    return {
        "found_keywords": found_keywords,
        "missing_keywords": missing_keywords,
        "density_map": density_map,
        "keyword_score": round(len(found_keywords) / len(keywords) * 100)
    }

def calculate_ats_score(text: str, role: str) -> dict:
    formatting_issues = check_formatting(text)
    sections = check_sections(text)
    keywords = check_keyword_density(text, role)

    formatting_score = max(0, 100 - len(formatting_issues) * 15)
    section_score = sections["completeness"]
    keyword_score = keywords["keyword_score"]

    overall = round((formatting_score * 0.25) + (section_score * 0.35) + (keyword_score * 0.40))

    return {
        "ats_score": overall,
        "formatting_score": formatting_score,
        "section_score": section_score,
        "keyword_score": keyword_score,
        "formatting_issues": formatting_issues,
        "sections": sections,
        "keywords": keywords
    }
