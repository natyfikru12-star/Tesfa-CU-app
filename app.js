const API_BASE = "https://fastapi-example-lcbc.onrender.com";
const statusEl = document.getElementById("status");
const checkButton = document.getElementById("check");

async function checkBackend() {
  statusEl.className = "";
  statusEl.textContent = "Checking connection…";
  checkButton.disabled = true;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const response = await fetch(`${API_BASE}/`, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    statusEl.textContent = "Backend is connected.";
    statusEl.className = "ok";
  } catch (error) {
    statusEl.textContent = "Backend connection failed. Check the Render service and CORS settings.";
    statusEl.className = "bad";
  } finally {
    checkButton.disabled = false;
  }
}

checkButton.addEventListener("click", checkBackend);
checkBackend();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" })
      .then(registration => registration.update())
      .catch(console.error);
  });
}
