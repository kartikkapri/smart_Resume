from openai import OpenAI
import os
import json

ROLE_TIPS = {
    "SDE": [
        "Add measurable impact: 'Reduced API response time by 40%' instead of 'Improved performance'",
        "Include keywords: FastAPI, REST APIs, Microservices, System Design",
        "Quantify projects: mention users served, data processed, or uptime achieved",
        "Add GitHub profile link with active repositories",
        "Mention specific algorithms/data structures used in projects",
    ],
    "AI-ML": [
        "Include model accuracy metrics: 'Achieved 94% accuracy on test set'",
        "Mention dataset sizes: 'Trained on 500K+ samples'",
        "Add Kaggle profile or competition rankings if available",
        "Include keywords: PyTorch, TensorFlow, Scikit-learn, Feature Engineering, MLOps",
        "Describe the business impact of your ML models",
    ],
    "DevOps": [
        "Quantify infrastructure: 'Managed 50+ microservices on Kubernetes'",
        "Include uptime/reliability metrics: '99.9% uptime SLA'",
        "Mention cost savings from cloud optimizations",
        "Add keywords: Terraform, Helm, Prometheus, Grafana, GitOps",
        "Describe CI/CD pipeline improvements with deployment frequency",
    ],
    "DS": [
        "Show business impact: 'Insights led to 15% revenue increase'",
        "Mention tools: Tableau, Power BI, Jupyter, Spark",
        "Include statistical methods used: regression, clustering, A/B testing",
        "Quantify data scale: 'Analyzed 10M+ records'",
        "Add keywords: Data Pipeline, ETL, SQL optimization, Visualization",
    ],
    "Frontend": [
        "Mention performance metrics: 'Improved Lighthouse score from 60 to 95'",
        "Include keywords: React, TypeScript, Webpack, Web Vitals, Accessibility",
        "Add portfolio/live project links",
        "Describe user impact: 'UI used by 10K+ daily active users'",
        "Mention responsive design and cross-browser compatibility",
    ],
    "Data Analyst": [
        "Quantify insights: 'Dashboard reduced reporting time by 3 hours/week'",
        "Include tools: SQL, Excel, Tableau, Power BI, Python",
        "Mention stakeholder communication and data storytelling",
        "Add keywords: KPI tracking, data cleaning, pivot tables, statistical analysis",
        "Show business decisions influenced by your analysis",
    ],
}

MOCK_REWRITES = {
    "SDE": [
        "• Engineered RESTful APIs using FastAPI, reducing average response time by 35% and supporting 10K+ daily requests",
        "• Architected microservices-based backend with Docker & Kubernetes, achieving 99.9% uptime across 3 environments",
        "• Optimized SQL queries and implemented Redis caching, cutting database load by 60%",
        "• Led development of authentication module using JWT, securing 5K+ user accounts",
        "• Collaborated in Agile sprints, delivering 15+ features on schedule with 95% test coverage",
    ],
    "AI-ML": [
        "• Developed CNN-based image classifier achieving 96.2% accuracy on 50K+ sample dataset using PyTorch",
        "• Built NLP sentiment analysis pipeline processing 1M+ tweets, deployed via FastAPI with <200ms latency",
        "• Reduced model inference time by 45% through quantization and ONNX optimization",
        "• Engineered feature extraction pipeline using Pandas & Scikit-learn, improving model F1-score by 12%",
        "• Deployed ML models on AWS SageMaker, enabling real-time predictions for 20K+ daily users",
    ],
    "DevOps": [
        "• Designed CI/CD pipelines using GitHub Actions, reducing deployment time from 45 min to 8 min",
        "• Managed Kubernetes cluster of 30+ microservices on AWS EKS, maintaining 99.95% uptime",
        "• Automated infrastructure provisioning with Terraform, reducing setup time by 70%",
        "• Implemented centralized monitoring with Prometheus & Grafana, cutting MTTR by 50%",
        "• Optimized Docker images, reducing container size by 60% and improving cold start by 40%",
    ],
    "DS": [
        "• Analyzed 5M+ transaction records using Python & SQL, uncovering patterns that drove 18% revenue growth",
        "• Built interactive Tableau dashboards for C-suite, reducing weekly reporting effort by 4 hours",
        "• Developed customer churn prediction model with 89% accuracy, saving $200K in annual retention costs",
        "• Designed A/B testing framework that validated 12 product hypotheses, improving conversion by 22%",
        "• Automated ETL pipeline using Apache Airflow, processing 500K+ daily records with zero manual intervention",
    ],
    "Frontend": [
        "• Built responsive React dashboard with TypeScript, improving Lighthouse performance score from 58 to 94",
        "• Implemented lazy loading and code splitting, reducing initial bundle size by 45% and TTI by 2.3s",
        "• Developed reusable component library with Storybook, accelerating feature development by 30%",
        "• Integrated REST APIs with React Query, eliminating redundant network calls and improving UX",
        "• Ensured WCAG 2.1 AA accessibility compliance across 20+ components, expanding user reach by 15%",
    ],
    "Data Analyst": [
        "• Designed SQL-based reporting system analyzing 2M+ records, reducing ad-hoc query time by 65%",
        "• Created Power BI dashboards tracking 15 KPIs, enabling data-driven decisions for 3 business units",
        "• Performed cohort analysis identifying key churn drivers, informing retention strategy saving $150K",
        "• Automated monthly Excel reports using Python, saving 6 hours of manual work per reporting cycle",
        "• Conducted statistical analysis on customer survey data (n=10K), presenting findings to senior leadership",
    ],
}

def get_openai_client():
    api_key = os.getenv("OPENAI_API_KEY")
    return OpenAI(api_key=api_key) if api_key else None

def get_ai_suggestions(resume_text: str, role: str, missing_skills: list) -> dict:
    tips = ROLE_TIPS.get(role, ROLE_TIPS["SDE"])
    client = get_openai_client()

    if not client:
        return {
            "suggestions": tips,
            "priority_fixes": tips[:3],
            "keywords_to_add": missing_skills[:6]
        }

    try:
        prompt = f"""Analyze this resume for a {role} role. Missing skills: {', '.join(missing_skills[:8])}.
Give 5 specific, actionable improvement suggestions. Return JSON:
{{"suggestions": ["fix1", "fix2", ...], "priority_fixes": ["top1", "top2", "top3"], "keywords_to_add": ["kw1", ...]}}
Resume excerpt: {resume_text[:800]}"""

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        return json.loads(response.choices[0].message.content.strip())
    except:
        return {"suggestions": tips, "priority_fixes": tips[:3], "keywords_to_add": missing_skills[:6]}

def rewrite_resume_bullets(resume_text: str, role: str) -> dict:
    client = get_openai_client()
    mock_bullets = MOCK_REWRITES.get(role, MOCK_REWRITES["SDE"])

    if not client:
        return {"improved_bullets": mock_bullets, "tips": ["Use strong action verbs", "Quantify every achievement", "Match keywords to job description"]}

    try:
        prompt = f"""Rewrite the project/experience bullet points from this resume for a {role} role.
Use strong action verbs, quantified impact, and relevant keywords.
Return JSON: {{"improved_bullets": ["• bullet1", "• bullet2", ...], "tips": ["tip1", "tip2", "tip3"]}}
Resume: {resume_text[:1200]}"""

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.8
        )
        return json.loads(response.choices[0].message.content.strip())
    except:
        return {"improved_bullets": mock_bullets, "tips": ["Use strong action verbs", "Quantify every achievement", "Match keywords to job description"]}
