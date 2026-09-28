const who = document.getElementById("who");
const err = document.getElementById("err");
const email = document.getElementById("email");
const password = document.getElementById("password");
const wsname = document.getElementById("wsname");
const workspaces = document.getElementById("workspaces");
const wsLabel = document.getElementById("wsLabel");
const ptitle = document.getElementById("ptitle");
const projects = document.getElementById("projects");
const billing = document.getElementById("billing");
const audit = document.getElementById("audit");

let access = sessionStorage.getItem("access") || "";
let selected = "";

function showError(e) {
  err.textContent = e && e.message ? e.message : String(e || "");
}

async function api(path, opts) {
  opts = opts || {};
  const headers = { "Content-Type": "application/json" };
  if (access) headers.Authorization = "Bearer " + access;
  const res = await fetch(path, {
    method: opts.method || "GET",
    headers: headers,
    body: opts.body || undefined
  });
  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch (ignore) { data = { message: text }; }
  if (!res.ok) throw new Error(data.message || data.code || text || String(res.status));
  return data;
}

async function afterAuth(tokens, label) {
  access = tokens.access_token;
  sessionStorage.setItem("access", access);
  who.textContent = label;
  who.className = "ok";
  await loadWs();
}

async function signin() {
  showError("");
  const tokens = await api("/auth/sign-in", {
    method: "POST",
    body: JSON.stringify({ email: email.value, password: password.value })
  });
  await afterAuth(tokens, "Signed in as " + email.value);
}

async function signup() {
  showError("");
  const tokens = await api("/auth/sign-up", {
    method: "POST",
    body: JSON.stringify({ email: email.value, password: password.value })
  });
  await afterAuth(tokens, "Account created: " + email.value);
}

function renderWorkspaces(items) {
  workspaces.innerHTML = "";
  if (!items.length) {
    workspaces.innerHTML = "<p class='muted'>No workspaces yet.</p>";
    return;
  }
  items.forEach(function (w) {
    const row = document.createElement("div");
    row.className = "item";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ghost";
    btn.textContent = w.name;
    btn.addEventListener("click", function () { openWs(w.id, w.name).catch(showError); });
    row.appendChild(btn);
    row.appendChild(document.createTextNode(" · " + w.plan + " · " + w.role));
    workspaces.appendChild(row);
  });
}

async function loadWs() {
  renderWorkspaces(await api("/workspaces"));
}

async function createWs() {
  showError("");
  await api("/workspaces", { method: "POST", body: JSON.stringify({ name: wsname.value }) });
  await loadWs();
}

async function openWs(id, name) {
  showError("");
  selected = id;
  wsLabel.textContent = "Workspace: " + name;
  const items = await api("/workspaces/" + id + "/projects");
  projects.innerHTML = items.length
    ? items.map(function (p) { return "<div class='item'>" + p.title + "</div>"; }).join("")
    : "<p class='muted'>No projects.</p>";
  try {
    const bill = await api("/workspaces/" + id + "/billing");
    billing.innerHTML = "<p>Plan <strong>" + bill.plan + "</strong> · " + bill.seats + " seat(s)</p>";
  } catch (ignore) {
    billing.innerHTML = "<p class='muted'>Billing requires owner/admin/billing role.</p>";
  }
  const logs = await api("/workspaces/" + id + "/audit");
  audit.innerHTML = logs.slice(0, 8).map(function (a) {
    return "<div class='item muted'>" + a.action + " — " + a.detail + "</div>";
  }).join("");
}

async function createProject() {
  if (!selected) return showError("Select a workspace first.");
  showError("");
  await api("/workspaces/" + selected + "/projects", {
    method: "POST",
    body: JSON.stringify({ title: ptitle.value })
  });
  await openWs(selected, wsLabel.textContent.replace("Workspace: ", ""));
}

function bind(id, fn) {
  document.getElementById(id).addEventListener("click", function () { fn().catch(showError); });
}

bind("btnIn", signin);
bind("btnUp", signup);
bind("btnWs", createWs);
bind("btnProj", createProject);

if (access) {
  who.textContent = "Session restored.";
  loadWs().catch(function () {
    access = "";
    sessionStorage.removeItem("access");
  });
}
