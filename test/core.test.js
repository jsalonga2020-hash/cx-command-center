const assert = require("node:assert/strict");
const ops = require("../core.js");
const tickets = [
  { id: 1, customer: "VIP", order: "#1", subject: "Charged twice", category: "duplicate charge", channel: "email", ageMinutes: 90, status: "open", vip: true, sentiment: "negative" },
  { id: 2, customer: "New", order: "#2", subject: "Size question", category: "sizing", channel: "chat", ageMinutes: 5, status: "open", vip: false, sentiment: "neutral" },
  { id: 3, customer: "Done", order: "#3", subject: "Resolved", category: "refund", channel: "email", ageMinutes: 200, status: "resolved", vip: false, sentiment: "positive" }
];
assert.equal(ops.slaState(tickets[0]), "breached");
assert.equal(ops.slaState(tickets[1]), "healthy");
assert.equal(ops.slaState(tickets[2]), "met");
assert.equal(ops.rankTickets(tickets)[0].id, 1);
assert.deepEqual(ops.metrics(tickets), { open: 2, atRisk: 0, breached: 1, vip: 1 });
assert.equal(ops.filterTickets(tickets, { query: "size", status: "all", channel: "all" }).length, 1);
assert.deepEqual(ops.categoryCounts(tickets), { "duplicate charge": 1, sizing: 1, refund: 1 });
console.log("All CX Command Center core tests passed.");
