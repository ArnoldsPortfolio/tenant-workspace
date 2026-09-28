# Tenant Workspace

First portfolio repository. Multi-tenant workspaces with auth, roles, projects, and a billing view.

## Stack

- Backend: Python FastAPI
- Frontend: TypeScript Next.js (App Router)
- Data: SQLite by default; Postgres via `DATABASE_URL`

## Run the API

```bash
cd apps/api
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- UI: http://localhost:8000/ui
- API docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

Seed user: `owner@workspace.dev` / `ChangeMe123!`
