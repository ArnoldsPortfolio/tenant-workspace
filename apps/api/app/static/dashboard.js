if (!sessionStorage.getItem("access")) {
  window.location.href = "/";
}
const who = document.getElementById("who");
const err = document.getElementById("err");
const wsname = document.getElementById("wsname");
const workspaces = document.getElementById("workspaces");
const wsLabel = document.getElementById("wsLabel");
const ptitle = document.getElementById("ptitle");
const projects = document.getElementById("projects");
const billing = document.getElementById("billing");
const audit = document.getElementById("audit");
let access = sessionStorage.getItem("access") || "";
let selected = sessionStorage.getItem("workspaceId") || "";
let selectedName = sessionStorage.getItem("workspaceName") || "";
who.textContent = sessionStorage.getItem("email") || "Signed in";
function showError(e) { err.textContent = e && e.message ? e.message : String(e || ""); }
async function api(path, opts) {
  opts = opts || {};
  const headers = { "Content-Type": "application/json" };
  if (access) headers.Authorization = "Bearer " + access;
  const res = await fetch(path, { method: opts.method || "GET", headers: headers, body: opts.body || undefined });
  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch (ignore) { data = { message: text }; }
  if (res.status === 401) { sessionStorage.clear(); window.location.href = "/"; return {}; }
  if (!res.ok) throw new Error(data.message || data.code || text || String(res.status));
  return data;
}
function showTab(name) {
  document.querySelectorAll(".tab").forEach(function (t) { t.classList.toggle("on", t.getAttribute("data-tab") === name); });
  document.querySelectorAll(".panel").forEach(function (p) { p.classList.toggle("on", p.id === "panel-" + name); });
}
document.querySelectorAll(".tab").forEach(function (t) { t.onclick = function () { showTab(t.getAttribute("data-tab")); }; });
document.getElementById("btnOut").onclick = function () { sessionStorage.clear(); window.location.href = "/"; };
function renderWorkspaces(items) {
  workspaces.innerHTML = "";
  if (!items.length) { workspaces.innerHTML = "<p class='muted'>No workspaces yet.</p>"; return; }
  items.forEach(function (w) {
    const row = document.createElement("div");
    row.className = "item";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ghost";
    btn.textContent = w.name;
    btn.onclick = function () { openWs(w.id, w.name).catch(showError); showTab("projects"); };
    row.appendChild(btn);
    row.appendChild(document.createTextNode(" · " + w.plan + " · " + w.role));
    workspaces.appendChild(row);
  });
}
async function loadWs() {
  renderWorkspaces(await api("/workspaces"));
  if (selected) await openWs(selected, selectedName);
}
async function createWs() {
  showError("");
  await api("/workspaces", { method: "POST", body: JSON.stringify({ name: wsname.value }) });
  await loadWs();
}
async function openWs(id, name) {
  selected = id;
  selectedName = name;
  sessionStorage.setItem("workspaceId", id);
  sessionStorage.setItem("workspaceName", name);
  wsLabel.textContent = "Workspace: " + name;
  const items = await api("/workspaces/" + id + "/projects");
  projects.innerHTML = items.length ? items.map(function (p) { return "<div class='item'>" + p.title + "</div>"; }).join("") : "<p class='muted'>No projects.</p>";
  try {
    const bill = await api("/workspaces/" + id + "/billing");
    billing.innerHTML = "<p>Plan <strong>" + bill.plan + "</strong> · " + bill.seats + " seat(s)</p>";
  } catch (ignore) {
    billing.innerHTML = "<p class='muted'>Billing requires owner, admin, or billing role.</p>";
  }
  const logs = await api("/workspaces/" + id + "/audit");
  audit.innerHTML = logs.length ? logs.slice(0, 20).map(function (a) { return "<div class='item muted'>" + a.action + " — " + a.detail + "</div>"; }).join("") : "<p class='muted'>No audit entries.</p>";
}
async function createProject() {
  if (!selected) return showError("Open the Workspaces tab and pick a workspace.");
  showError("");
  await api("/workspaces/" + selected + "/projects", { method: "POST", body: JSON.stringify({ title: ptitle.value }) });
  await openWs(selected, selectedName);
}
document.getElementById("btnWs").onclick = function () { createWs().catch(showError); };
document.getElementById("btnProj").onclick = function () { createProject().catch(showError); };
loadWs().catch(showError);
