const seedTickets = [
  { id: 1, customer: "Maya Chen", order: "#18432", subject: "Charged twice for one order", category: "duplicate charge", channel: "email", ageMinutes: 94, status: "open", vip: true, sentiment: "negative", publicComplaint: false, history: "4 orders · $624 lifetime value", nextAction: "Verify the duplicate capture, refund it, and confirm the reversal timeline." },
  { id: 2, customer: "Chris Morgan", order: "#18451", subject: "Package delayed before a trip", category: "shipping delay", channel: "chat", ageMinutes: 27, status: "open", vip: false, sentiment: "negative", publicComplaint: false, history: "First order · Express shipping", nextAction: "Check the carrier scan and offer the fastest confirmed resolution—without promising an unverified date." },
  { id: 3, customer: "Avery Brooks", order: "#18397", subject: "Wrong color received", category: "wrong item", channel: "social", ageMinutes: 42, status: "pending", vip: false, sentiment: "negative", publicComplaint: true, history: "2 orders · Public Instagram comment", nextAction: "Acknowledge publicly, move the conversation private, then verify order history before replacing." },
  { id: 4, customer: "Noah Williams", order: "#18440", subject: "Need help choosing the right size", category: "sizing", channel: "chat", ageMinutes: 8, status: "open", vip: false, sentiment: "neutral", publicComplaint: false, history: "Returning visitor · Cart value $148", nextAction: "Ask for fit preference and measurements, then recommend the closest size using the product guide." },
  { id: 5, customer: "Sophia Reyes", order: "#18381", subject: "Return has no update", category: "refund", channel: "email", ageMinutes: 188, status: "snoozed", vip: true, sentiment: "negative", publicComplaint: false, history: "7 orders · $1,204 lifetime value", nextAction: "Confirm warehouse receipt and send a proactive refund-status update today." },
  { id: 6, customer: "Liam Patel", order: "#18456", subject: "Can I change my delivery address?", category: "order edit", channel: "email", ageMinutes: 33, status: "open", vip: false, sentiment: "neutral", publicComplaint: false, history: "First order · Not yet fulfilled", nextAction: "Check fulfillment lock status, update the address if safe, and confirm the exact change." },
  { id: 7, customer: "Emma Wilson", order: "#18408", subject: "Tracking has not updated", category: "shipping delay", channel: "social", ageMinutes: 21, status: "open", vip: false, sentiment: "neutral", publicComplaint: true, history: "3 orders · Facebook DM", nextAction: "Check carrier movement and send a private update before the concern becomes a public complaint." },
  { id: 8, customer: "Ethan Kim", order: "#18375", subject: "Refund completed", category: "refund", channel: "email", ageMinutes: 240, status: "resolved", vip: false, sentiment: "positive", publicComplaint: false, history: "2 orders · Refund confirmed", nextAction: "No action needed." },
  { id: 9, customer: "Olivia Martin", order: "#18459", subject: "Product material question", category: "product question", channel: "chat", ageMinutes: 6, status: "open", vip: false, sentiment: "neutral", publicComplaint: false, history: "New visitor · Product page", nextAction: "Answer with verified product details and link the relevant care guide." }
];

const storageKey = "cx-command-center-tickets-v1";
let tickets = loadTickets();
let selectedId = null;

const $ = (selector) => document.querySelector(selector);
const rows = $("#ticket-rows");
const detailPanel = $("#detail-panel");

function loadTickets() {
  try { return JSON.parse(localStorage.getItem(storageKey)) || structuredClone(seedTickets); }
  catch { return structuredClone(seedTickets); }
}

function saveTickets() { localStorage.setItem(storageKey, JSON.stringify(tickets)); }

function ageLabel(minutes) {
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function renderMetrics() {
  const data = SupportOps.metrics(tickets);
  const cards = [
    ["Open conversations", data.open, "Needs ownership", "blue"],
    ["SLA at risk", data.atRisk, "Approaching deadline", "amber"],
    ["SLA breached", data.breached, "Respond now", "red"],
    ["VIP customers", data.vip, "Protect retention", "violet"]
  ];
  $("#metrics").innerHTML = cards.map(([label, value, note, tone]) => `
    <article class="metric-card ${tone}"><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`).join("");
  $("#nav-count").textContent = data.open;
}

function renderQueue() {
  const filtered = SupportOps.filterTickets(tickets, {
    query: $("#search").value,
    status: $("#status-filter").value,
    channel: $("#channel-filter").value
  });
  $("#result-count").textContent = `${filtered.length} ticket${filtered.length === 1 ? "" : "s"}`;
  $("#empty-state").hidden = filtered.length !== 0;
  rows.innerHTML = filtered.map((ticket) => `
    <tr data-id="${ticket.id}" tabindex="0" class="${selectedId === ticket.id ? "selected" : ""}">
      <td><span class="priority ${ticket.priority.toLowerCase()}">${ticket.priority}</span></td>
      <td><strong>${ticket.customer}</strong><small>${ticket.channel}</small></td>
      <td>${ticket.subject}<small>${ticket.category}</small></td>
      <td>${ticket.order}</td>
      <td><span class="sla ${ticket.sla}">${ageLabel(ticket.ageMinutes)}</span></td>
      <td><span class="status ${ticket.status}">${ticket.status}</span></td>
    </tr>`).join("");
  rows.querySelectorAll("tr").forEach((row) => {
    const open = () => selectTicket(Number(row.dataset.id));
    row.addEventListener("click", open);
    row.addEventListener("keydown", (event) => { if (event.key === "Enter") open(); });
  });
}

function selectTicket(id) {
  selectedId = id;
  const ticket = SupportOps.enrich(tickets.find((item) => item.id === id));
  detailPanel.innerHTML = `
    <div class="detail-header"><span class="priority ${ticket.priority.toLowerCase()}">${ticket.priority} · ${ticket.priorityScore}</span><span>${ticket.order}</span></div>
    <h2>${ticket.subject}</h2>
    <p class="customer-line"><strong>${ticket.customer}</strong> · ${ticket.channel}</p>
    <div class="signal-grid">
      <div><span>SLA</span><strong class="sla ${ticket.sla}">${ticket.sla}</strong></div>
      <div><span>Status</span><strong>${ticket.status}</strong></div>
      <div><span>Customer</span><strong>${ticket.vip ? "VIP" : "Standard"}</strong></div>
      <div><span>Age</span><strong>${ageLabel(ticket.ageMinutes)}</strong></div>
    </div>
    <div class="detail-block"><span>Customer context</span><p>${ticket.history}</p></div>
    <div class="recommendation"><span>Recommended next action</span><p>${ticket.nextAction}</p></div>
    <div class="detail-actions">
      <button class="button secondary" data-action="snoozed">Snooze</button>
      <button class="button primary" data-action="resolved">Mark resolved</button>
    </div>`;
  detailPanel.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", () => updateStatus(id, button.dataset.action)));
  renderQueue();
}

function updateStatus(id, status) {
  tickets = tickets.map((ticket) => ticket.id === id ? { ...ticket, status } : ticket);
  saveTickets();
  renderAll();
  selectTicket(id);
  showToast(status === "resolved" ? "Ticket marked resolved" : "Ticket snoozed");
}

function renderInsights() {
  const counts = SupportOps.categoryCounts(tickets.filter((ticket) => ticket.status !== "resolved"));
  const ordered = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = Math.max(...ordered.map(([, count]) => count), 1);
  $("#issue-bars").innerHTML = ordered.map(([name, count]) => `
    <div class="bar-row"><span>${name}</span><div><i style="width:${(count / max) * 100}%"></i></div><strong>${count}</strong></div>`).join("");
}

function dailySummary() {
  const data = SupportOps.metrics(tickets);
  const top = SupportOps.rankTickets(tickets).filter((ticket) => ticket.status !== "resolved").slice(0, 3);
  return `CX daily summary\nOpen: ${data.open} | At risk: ${data.atRisk} | Breached: ${data.breached}\nTop priorities:\n${top.map((ticket, index) => `${index + 1}. ${ticket.customer} — ${ticket.subject} (${ticket.sla})`).join("\n")}`;
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

function renderAll() { renderMetrics(); renderQueue(); renderInsights(); }

[$("#search"), $("#status-filter"), $("#channel-filter")].forEach((control) => control.addEventListener("input", renderQueue));
$("#reset-demo").addEventListener("click", () => { tickets = structuredClone(seedTickets); selectedId = null; saveTickets(); renderAll(); detailPanel.innerHTML = '<div class="empty-detail"><div class="empty-icon">↗</div><h2>Select a ticket</h2><p>Open an issue to see customer history, risk signals, and the recommended next action.</p></div>'; showToast("Demo data restored"); });
$("#export-summary").addEventListener("click", async () => { await navigator.clipboard.writeText(dailySummary()); showToast("Daily summary copied"); });

renderAll();
