from openai import OpenAI
import os
import json

def get_openai_client():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None
    return OpenAI(api_key=api_key)

def generate_mock_roadmap(missing_skills: list, target_role: str) -> dict:
    """Generate a mock roadmap without OpenAI"""
    roadmap = []
    skills_per_week = max(1, len(missing_skills) // 8)
    
    for week in range(1, 9):
        start_idx = (week - 1) * skills_per_week
        end_idx = start_idx + skills_per_week if week < 8 else len(missing_skills)
        week_skills = missing_skills[start_idx:end_idx] if start_idx < len(missing_skills) else [missing_skills[0]]
        
        roadmap.append({
            "week": week,
            "topic": f"Week {week}: {' & '.join(week_skills)}",
            "skills": week_skills,
            "resources": [
                {"title": f"{skill} Tutorial", "url": f"https://www.youtube.com/results?search_query={skill.replace(' ', '+')}+tutorial"}
                for skill in week_skills
            ]
        })
    
    return {"roadmap": roadmap}

def generate_roadmap(missing_skills: list, target_role: str) -> dict:
    client = get_openai_client()
    
    if not client:
        # Use mock roadmap if no API key
        return generate_mock_roadmap(missing_skills, target_role)
    
    try:
        prompt = f"""Create an 8-week learning roadmap for a {target_role} role to learn these skills: {', '.join(missing_skills)}.

Return ONLY a valid JSON object with this exact structure:
{{
  "roadmap": [
    {{
      "week": 1,
      "topic": "Topic name",
      "skills": ["skill1", "skill2"],
      "resources": [
        {{"title": "Resource title", "url": "YouTube or documentation URL"}}
      ]
    }}
  ]
}}

Focus on free YouTube tutorials and official documentation. Be specific with resource titles and URLs."""

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        
        content = response.choices[0].message.content.strip()
        return json.loads(content)
    except:
        # Fallback to mock if OpenAI fails
        return generate_mock_roadmap(missing_skills, target_role)
