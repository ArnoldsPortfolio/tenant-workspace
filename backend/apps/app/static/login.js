const err = document.getElementById("err");
const email = document.getElementById("email");
const password = document.getElementById("password");
function showError(e) { err.textContent = e && e.message ? e.message : String(e || ""); }
async function api(path, body) {
  const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch (ignore) { data = { message: text }; }
  if (!res.ok) throw new Error(data.message || data.code || text || String(res.status));
  return data;
}
async function go(path) {
  const tokens = await api(path, { email: email.value, password: password.value });
  sessionStorage.setItem("access", tokens.access_token);
  sessionStorage.setItem("email", email.value);
  window.location.href = "/app";
}
if (sessionStorage.getItem("access")) { window.location.href = "/app"; }
document.getElementById("btnIn").onclick = function () { go("/auth/sign-in").catch(showError); };
document.getElementById("btnUp").onclick = function () { go("/auth/sign-up").catch(showError); };
