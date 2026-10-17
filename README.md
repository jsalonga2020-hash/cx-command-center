# CX Command Center

A lightweight customer-support operations dashboard for Shopify and direct-to-consumer teams. It helps a support lead identify the conversations most likely to become customer-experience failures before customers need to follow up.

## Why I built it

Support teams rarely struggle because they cannot reply to a ticket. The harder problem is deciding what deserves attention first across email, chat, social complaints, VIP customers, refunds, and delayed orders. This project turns those signals into a single prioritized queue.

## Features

- Priority scoring based on ticket age, channel SLA, customer value, sentiment, issue type, and public complaints
- SLA health indicators for email, chat, and social channels
- Search plus status and channel filtering
- Customer context and recommended next action
- Local resolve/snooze workflow with browser persistence
- Daily support-summary copy action
- Recurring-issue visualization and proactive improvement suggestion
- Responsive interface with no framework or external dependency

## Run locally

Open `index.html` in a modern browser. No installation or server is required.

## Test

```powershell
node test/core.test.js
```

## Technical choices

The project uses plain HTML, CSS, and JavaScript so the demo is portable and easy to audit. Business logic lives in `core.js`, separately from the interface, so prioritization and filtering can be tested with Node.js. All included customer and order data is fictional.

## Portfolio case study

I designed CX Command Center to show how I approach ecommerce customer support as an operations problem—not just a queue of messages. It identifies SLA risk, highlights high-impact customers, and recommends the next action using transparent rules. The result is a practical demo of customer service judgment, Shopify-style order workflows, data organization, and lightweight automation.

## Next improvements

- Import Shopify or helpdesk CSV exports
- Add configurable SLA and priority rules
- Create weekly CSAT and recurring-issue reports
- Connect to a sandbox helpdesk API

