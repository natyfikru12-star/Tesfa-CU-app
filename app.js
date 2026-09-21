const API_BASE = "https://tesfa-cu-app.onrender.com";
const statusEl = document.getElementById("status");
async function checkBackend(){
  statusEl.className="";
  statusEl.textContent="Checking connection…";
  try{
    const r=await fetch(API_BASE+"/");
    if(!r.ok) throw new Error("HTTP "+r.status);
    statusEl.textContent="Backend is reachable.";
    statusEl.className="ok";
  }catch(e){
    statusEl.textContent="Could not reach backend. The backend may be sleeping, unavailable, or require CORS configuration.";
    statusEl.className="bad";
  }
}
document.getElementById("check").addEventListener("click",checkBackend);
checkBackend();
if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(()=>{});
