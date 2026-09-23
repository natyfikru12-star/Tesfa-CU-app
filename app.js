const API_BASE="https://tesfa-cu-app.onrender.com";
const $=id=>document.getElementById(id);
let token=sessionStorage.getItem("tesfa_token")||"";

async function api(path,options={}){
  const headers={"Content-Type":"application/json",...(options.headers||{})};
  if(token) headers.Authorization=`Bearer ${token}`;
  const r=await fetch(API_BASE+path,{...options,headers});
  let data=null; try{data=await r.json()}catch{}
  if(!r.ok) throw new Error(data?.detail||`HTTP ${r.status}`);
  return data;
}
async function health(){
  try{await api("/health");$("apiBadge").textContent="API Online";$("apiBadge").className="badge ok";$("backendState").textContent="Online";return true}
  catch(e){$("apiBadge").textContent="API Offline";$("apiBadge").className="badge bad";$("backendState").textContent="Offline";return false}
}
function showLogin(msg=""){ $("loginCard").classList.remove("hidden");$("app").classList.add("hidden"); if(msg){$("loginMessage").textContent=msg;$("loginMessage").className="message bad"}}
function showApp(){ $("loginCard").classList.add("hidden");$("app").classList.remove("hidden") }
async function authenticate(){
  if(!token)return showLogin();
  try{const me=await api("/me");showApp();$("welcome").textContent=`Welcome, ${me.username||"staff"}`;$("roleText").textContent=me.role?`Role: ${me.role}`:"Authenticated staff";await refreshDashboard()}
  catch(e){token="";sessionStorage.removeItem("tesfa_token");showLogin("Please sign in again.")}
}
$("loginForm").addEventListener("submit",async e=>{
 e.preventDefault();$("loginMessage").textContent="Signing in…";
 try{const d=await api("/auth/login",{method:"POST",body:JSON.stringify({username:$("username").value.trim(),password:$("password").value})});token=d.access_token;sessionStorage.setItem("tesfa_token",token);$("password").value="";await authenticate()}
 catch(err){$("loginMessage").textContent=err.message;$("loginMessage").className="message bad"}
});
$("logout").onclick=()=>{token="";sessionStorage.removeItem("tesfa_token");showLogin()};
document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{
 document.querySelectorAll("[data-tab]").forEach(x=>x.classList.remove("active"));b.classList.add("active");
 document.querySelectorAll(".panel").forEach(x=>x.classList.add("hidden"));$(b.dataset.tab).classList.remove("hidden");
});
async function loadMembers(){
 try{const q=$("memberSearch").value.trim();const data=await api("/members"+(q?`?q=${encodeURIComponent(q)}`:""));$("memberCount").textContent=data.length;
 $("memberRows").innerHTML=data.map(m=>`<tr><td>${m.id}</td><td>${esc(m.member_number)}</td><td>${esc([m.first_name,m.last_name].filter(Boolean).join(" "))}</td><td>${esc(m.phone||"")}</td></tr>`).join("")||'<tr><td colspan="4">No members found.</td></tr>'}
 catch(e){$("memberRows").innerHTML=`<tr><td colspan="4">${esc(e.message)}</td></tr>`}
}
async function loadLoans(){
 try{const data=await api("/loans");$("loanCount").textContent=data.length;$("pendingCount").textContent=data.filter(x=>x.status==="pending").length;
 $("loanRows").innerHTML=data.map(l=>`<tr><td>${l.id}</td><td>${esc(l.loan_number)}</td><td>${l.member_id}</td><td>${money(l.principal)}</td><td>${money(l.outstanding_principal)}</td><td>${esc(l.status)}</td><td>${l.status==="pending"?`<button onclick="approveLoan(${l.id})">Approve</button>`:""}</td></tr>`).join("")||'<tr><td colspan="7">No loans found.</td></tr>'}
 catch(e){$("loanRows").innerHTML=`<tr><td colspan="7">${esc(e.message)}</td></tr>`}
}
window.approveLoan=async id=>{try{await api(`/loans/${id}/approve`,{method:"POST"});await loadLoans()}catch(e){alert(e.message)}};
$("loadAccount").onclick=async()=>{const id=$("accountId").value;if(!id)return;try{$("accountResult").textContent=JSON.stringify(await api(`/accounts/${id}`),null,2)}catch(e){$("accountResult").textContent=e.message}};
$("deposit").onclick=async()=>{const id=$("accountId").value,amount=Number($("depositAmount").value);if(!id||!(amount>0))return alert("Enter an account ID and amount.");try{const d=await api(`/accounts/${id}/deposit`,{method:"POST",body:JSON.stringify({amount,description:$("depositDescription").value||"Deposit"})});$("accountResult").textContent=JSON.stringify(d,null,2);$("depositAmount").value=""}catch(e){alert(e.message)}};
$("searchMembers").onclick=loadMembers;$("loadLoans").onclick=loadLoans;$("refresh").onclick=refreshDashboard;
async function refreshDashboard(){await health();await Promise.all([loadMembers(),loadLoans()])}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function money(v){const n=Number(v);return Number.isFinite(n)?n.toLocaleString(undefined,{style:"currency",currency:"USD"}):esc(v)}
health();authenticate();
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
