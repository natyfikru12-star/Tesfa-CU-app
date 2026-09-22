# Tesfa Frontend — Fixed Build

Backend URL: https://fastapi-example-lcbc.onrender.com

## Deploy
Upload these files to the ROOT of the frontend GitHub repository and commit them to `main`:
- index.html
- style.css
- app.js
- manifest.json
- sw.js

The service worker cache is now `tesfa-v2` and removes older caches so an old page is less likely to remain stuck after deployment.

## After deployment
1. Wait for the frontend host to finish deploying.
2. Open the live frontend URL and refresh it.
3. If an old installed version remains on Android, close the installed app and reopen it after the new deployment.

## Security
This remains a starter frontend. Do not use it for real member or financial data until authentication, authorization, validation, audit logging, secure APIs, and appropriate security/compliance controls are implemented.
