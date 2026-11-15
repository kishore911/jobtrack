# JobTrack: Job Application Kanban Board

Track every job application on a drag-and-drop board (Wishlist, Applied, Interview, Offer, Rejected),
get follow-up reminders and see what share of your applications reach the interview stage.

**Stack:** Python, Django, Django REST Framework, JWT, PostgreSQL, React (Vite)

## Features
- JWT auth, every user only sees their own applications
- Drag a card between columns to change status (screen updates first, API call follows)
- Search by company or role, follow-up dates with overdue highlighting
- Stats API: counts per status, interview rate, follow-ups due in 7 days
- API tests for data isolation, search and stats

## Run locally
```bash
cd backend
python -m venv venv && source venv/bin/activate     # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate && python manage.py seed_demo   # demo / demo1234
python manage.py runserver

cd ../frontend
cp .env.example .env && npm install && npm run dev       # http://localhost:5173
```
Tests: `cd backend && python manage.py test`

## API
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register/`, `/api/auth/token/` | Sign up, login (JWT) |
| GET/POST | `/api/applications/` (`?q=`) | List/search, create |
| PATCH/DELETE | `/api/applications/{id}/` | Move status, edit, delete |
| GET | `/api/stats/` | Counts, interview rate, follow-ups |

## Deploy
Backend on Render (root `backend`): build `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`, start `gunicorn config.wsgi`. Env: `SECRET_KEY`, `DEBUG=0`, `ALLOWED_HOSTS`, `DATABASE_URL`, `CORS_ORIGINS`.
Frontend on Vercel (root `frontend`): env `VITE_API_URL=<your render url>`.
