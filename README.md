# Tenant Workspace

```
tenant-workspace/
  backend/      Python FastAPI
  frontend/     TypeScript Next.js
  README.md
```

If your clone still has `apps/api` and `apps/web`, rename them once:

```bash
cd tenant-workspace
mv apps/api backend
mv apps/web frontend
```

## Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

http://127.0.0.1:8000/docs

## Frontend

```bash
cd frontend
npm install
npm run dev
```

http://localhost:3000

Seed login: `owner@workspace.dev` / `ChangeMe123!`
