# Tesfa Credit Union — Integrated Build

This package connects the Tesfa PWA dashboard to:
https://fastapi-example-lcbc.onrender.com

## Included
- Staff login using `/auth/login`
- Authenticated `/me`
- Members list/search
- Account lookup
- Deposits
- Loans list and approval
- API health status
- Installable PWA with network-first service worker
- Backend CORS patch

## Backend step (required)
Merge `backend-cors-patch.py` into the existing backend `main.py`.
On Render set `FRONTEND_ORIGINS` to the exact HTTPS origin of the deployed frontend, for example:
`https://your-tesfa-frontend.onrender.com`

Redeploy the backend and verify `/health`.

## Frontend deployment
Upload `index.html`, `style.css`, `app.js`, `manifest.json`, and `sw.js` to the frontend repository and redeploy it as a static site.

## Important production limitation
The current backend exposes real authentication, member, account, deposit and loan endpoints, but it does not expose a transaction-history list endpoint or branch data model/endpoints. The dashboard labels those areas accordingly rather than fabricating data.

Do not use this build for real member funds or sensitive production data until security, database migrations/backups, secrets management, accounting controls, audit review, role testing, TLS/CORS settings, compliance, and recovery procedures have been independently reviewed.
