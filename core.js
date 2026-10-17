(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.SupportOps = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const SLA_MINUTES = { email: 60, chat: 20, social: 30 };
  function priorityScore(ticket) {
    let score = Math.min(40, Math.floor(ticket.ageMinutes / 15));
    if (ticket.vip) score += 20;
    if (ticket.sentiment === "negative") score += 15;
    if (["refund", "wrong item", "duplicate charge"].includes(ticket.category)) score += 15;
    if (ticket.publicComplaint) score += 20;
    return Math.min(100, score);
  }
  function slaState(ticket) {
    if (ticket.status === "resolved") return "met";
    const ratio = ticket.ageMinutes / (SLA_MINUTES[ticket.channel] || 60);
    if (ratio >= 1) return "breached";
    if (ratio >= 0.7) return "at-risk";
    return "healthy";
  }
  function priorityLabel(score) {
    if (score >= 70) return "Critical";
    if (score >= 45) return "High";
    if (score >= 25) return "Medium";
    return "Low";
  }
  function enrich(ticket) {
    const score = priorityScore(ticket);
    return { ...ticket, priorityScore: score, priority: priorityLabel(score), sla: slaState(ticket) };
  }
  function rankTickets(tickets) {
    return tickets.map(enrich).sort((a, b) => b.priorityScore - a.priorityScore || b.ageMinutes - a.ageMinutes);
  }
  function metrics(tickets) {
    const enriched = tickets.map(enrich);
    const unresolved = enriched.filter((ticket) => ticket.status !== "resolved");
    return {
      open: unresolved.length,
      atRisk: unresolved.filter((ticket) => ticket.sla === "at-risk").length,
      breached: unresolved.filter((ticket) => ticket.sla === "breached").length,
      vip: unresolved.filter((ticket) => ticket.vip).length,
    };
  }
  function filterTickets(tickets, filters) {
    const query = (filters.query || "").trim().toLowerCase();
    return rankTickets(tickets).filter((ticket) => {
      const haystack = [ticket.customer, ticket.order, ticket.subject, ticket.category].join(" ").toLowerCase();
      return (!query || haystack.includes(query)) &&
        (filters.status === "all" || ticket.status === filters.status) &&
        (filters.channel === "all" || ticket.channel === filters.channel);
    });
  }
  function categoryCounts(tickets) {
    return tickets.reduce((counts, ticket) => {
      counts[ticket.category] = (counts[ticket.category] || 0) + 1;
      return counts;
    }, {});
  }
  return { SLA_MINUTES, priorityScore, priorityLabel, slaState, enrich, rankTickets, metrics, filterTickets, categoryCounts };
});
