# Smart Resume Analyzer

AI-powered resume analysis tool with skill gap detection, personalized learning roadmaps, and job recommendations.

## Features

- 📄 PDF Resume Analysis
- 🎯 Role-based Skill Gap Analysis (SDE, AI-ML, DevOps, Data Science)
- 🗺️ AI-Generated 8-Week Learning Roadmaps
- 💼 Job Recommendations with Skill Matching
- 📊 User Dashboard with Analytics
- 🌓 Dark Mode Support

## Tech Stack

**Backend:** FastAPI, Python, OpenAI API, PDFPlumber  
**Frontend:** React, Vite, Tailwind CSS, Framer Motion, Recharts

## Setup

### Backend
```bash
cd app
pip install -r requirements.txt
cp .env.example .env
# Add your OPENAI_API_KEY in .env
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Create `.env` file in root:
```
OPENAI_API_KEY=your_key_here
```

## Deployment

**Backend:** Deploy on Render/Railway/Fly.io  
**Frontend:** Deploy on Vercel/Netlify

Update `VITE_API_URL` in frontend for production API endpoint.

## License

MIT
