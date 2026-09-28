# Tenant Workspace

```
tenant-workspace/
  backend/
    apps/          FastAPI (Python)
  frontend/
    apps/          Next.js (TypeScript)
  README.md
```

If you still have the old `apps/api` and `apps/web` folders, move them in once:

```bash
cd tenant-workspace
mkdir -p backend/apps frontend/apps
mv apps/api/* backend/apps/
mv apps/web/* frontend/apps/
```

## Backend

```bash
cd backend/apps
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

http://127.0.0.1:8000/docs

## Frontend

```bash
cd frontend/apps
npm install
npm run dev
```

http://localhost:3000
