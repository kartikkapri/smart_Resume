import re

SKILLS = [
    "Python", "C++", "C", "Java", "JavaScript", "TypeScript", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin",
    "DSA", "Data Structures", "Algorithms", "Algorithm",
    "DBMS", "Database", "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Oracle",
    "OS", "Operating Systems", "Operating System",
    "CN", "Computer Networks", "Computer Network", "Networking", "Network",
    "React", "ReactJS", "React.js", "Angular", "Vue", "Vue.js", "Svelte",
    "Node", "NodeJS", "Node.js", "Express", "Express.js",
    "AWS", "Azure", "GCP", "Cloud", "Google Cloud",
    "Docker", "Kubernetes", "K8s",
    "ML", "Machine Learning", "AI", "Artificial Intelligence", "Deep Learning", "NLP",
    "Git", "GitHub", "GitLab", "Bitbucket", "CI/CD", "Jenkins",
    "REST", "API", "REST API", "RESTful", "GraphQL",
    "HTML", "CSS", "SCSS", "SASS", "Bootstrap", "Tailwind", "Material UI",
    "Linux", "Unix", "Windows", "MacOS",
    "Django", "Flask", "FastAPI", "Spring", "Spring Boot", "Hibernate",
    "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "Scikit",
    "Pandas", "NumPy", "Matplotlib", "Seaborn",
    "Terraform", "Ansible", "Puppet", "Chef",
    "Microservices", "Agile", "Scrum", "DevOps",
    "Testing", "Unit Testing", "Jest", "Pytest", "JUnit",
    "OOP", "Object Oriented", "Functional Programming"
]

# Skill aliases for better matching
SKILL_ALIASES = {
    "data structures and algorithms": "DSA",
    "data structure and algorithm": "DSA",
    "data structure": "Data Structures",
    "algorithm": "Algorithms",
    "database management": "DBMS",
    "operating system": "OS",
    "computer network": "CN",
    "react.js": "React",
    "reactjs": "React",
    "node.js": "Node",
    "nodejs": "Node",
    "machine learning": "ML",
    "artificial intelligence": "AI",
    "deep learning": "Deep Learning",
    "kubernetes": "K8s",
    "object oriented programming": "OOP",
    "rest api": "REST API",
    "restful api": "REST API"
}

def extract_skills(text: str) -> list:
    text_lower = text.lower()
    detected = set()
    
    # Check for skill aliases first
    for alias, skill in SKILL_ALIASES.items():
        if alias in text_lower:
            detected.add(skill)
    
    # Check for exact skills with word boundaries
    for skill in SKILLS:
        # Create flexible pattern
        skill_pattern = skill.lower().replace('+', '\\+').replace('.', '\\.')
        pattern = r'\b' + skill_pattern + r'\b'
        if re.search(pattern, text_lower):
            detected.add(skill)
    
    return list(detected)
