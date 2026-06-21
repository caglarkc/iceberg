Mission Description

Iceberg Digital is now an official Zoom Partner, which gives us access to Zoom’s official SDK and developer ecosystem. This mission focuses on researching what we can build with Zoom SDKs and APIs, especially around Zoom Meetings, embedded meeting experiences, and Zoom Phone workflows.



The goal is to understand whether we can run Zoom meetings directly inside our own product interface, how much of the meeting experience can be embedded or customised, and whether Zoom Phone calls can be handled without requiring users to depend entirely on the Zoom Desktop client.



The mission should produce a working proof of concept, a technical capability map, and clear documentation explaining what is possible, what is limited, and what would be valuable for Iceberg Digital products.



Context & Background

Zoom is becoming an important part of our communication and customer workflow strategy. As a Zoom Partner, we now have access to official Zoom SDKs and APIs that may allow us to build deeper integrations into our own platform.



This could create major product opportunities, such as:



Starting or joining Zoom meetings from inside our own interface.

Embedding meeting experiences into our dashboard.

Creating custom video/session flows for customers, agents, or support teams.

Connecting Zoom Phone activity with our internal workflows.

Logging calls, triggering automations, or routing users based on Zoom Phone events.

Reducing dependency on switching between Zoom Desktop and our own product.

Zoom provides different developer tools for different use cases. The Meeting SDK is designed to embed Zoom Meetings and Webinars into an application. The Video SDK is designed for fully custom video/audio experiences using Zoom’s core real-time communication technology. Zoom Phone APIs are designed to integrate phone features, access call data, automate workflows, and build phone-related functionality inside third-party systems.



This mission is valuable because it will help us understand which Zoom tools are suitable for our product direction and whether we can build a better communication experience directly inside Iceberg Digital systems.



Problem Statement

We need to investigate the practical capabilities and limitations of Zoom’s official SDKs and APIs.



The core technical questions are:



Can we allow users to start, join, or manage Zoom meetings directly from our own interface?

Can we embed the Zoom meeting experience into our product using the official Meeting SDK?

What level of UI customisation is possible when using the Meeting SDK?

When should we use Zoom Meeting SDK versus Zoom Video SDK?

Can we create a fully custom video experience using Zoom Video SDK?

What Zoom Phone capabilities are available through API or SDK access?

Can users make, receive, or manage Zoom Phone calls without relying fully on the Zoom Desktop application?

Can Zoom Phone events be captured and used to trigger workflows inside our system?

What authentication, permission, licensing, marketplace, and account requirements are needed?

What would a realistic production integration architecture look like?

The mission should not only test the SDK technically, but also document business/product opportunities and limitations clearly.



Expected Deliverables

The expected deliverables are:



Technical Research Document

A clear document explaining:



Available Zoom SDKs and APIs.

Difference between Meeting SDK, Video SDK, Zoom Phone APIs, and related webhooks.

What each tool is designed for.

Required Zoom account, partner, marketplace, OAuth, JWT, or SDK credentials.

Licensing or permission requirements.

Browser, desktop, and mobile support.

Security and authentication flow.

Known technical limitations.

Working POC: Embedded Zoom Meeting

A small working proof of concept where a user can:



Open our demo interface.

Start or join a Zoom meeting from inside the interface.

Use the official Zoom Meeting SDK where applicable.

Demonstrate the minimum required backend token/signature generation flow.

Show what the embedded meeting experience looks like.

Zoom Phone Capability POC or Feasibility Demo

A proof of concept or technical feasibility report covering:



Available Zoom Phone APIs.

Whether calls can be initiated or managed from our own interface.

Whether Zoom Desktop is still required for specific call actions.

How call logs, recordings, voicemails, call status, or events can be accessed.

Which phone workflows can be automated.

What real-time events or webhooks are available.

Product Capability Map

A structured list of possible product features, for example:



“Start Zoom Meeting from contact profile.”

“Join meeting inside Iceberg dashboard.”

“Log Zoom meeting against customer record.”

“Trigger workflow when Zoom Phone call ends.”

“Send WhatsApp follow-up after missed Zoom Phone call.”

“Create call history inside customer timeline.”

“Route call events to support or CRM workflows.”

“Use Video SDK for custom consultation rooms.”

Each idea should be marked as:



Possible now.

Possible but requires more Zoom permissions/licensing.

Technically possible but not recommended.

Not possible with current Zoom APIs/SDKs.

Needs further Zoom Partner clarification.

Demo Application

A lightweight demo application showing the most promising integration path.



Suggested scope:



Backend: Node.js, Laravel, or Go service for Zoom auth/signature/token generation.

Frontend: Simple React/Vue/HTML interface.

Feature: Join/start embedded Zoom meeting.

Optional: Zoom Phone call/event API exploration.

Documentation: README with setup instructions.

Final Recommendation

A short recommendation document answering:



Which Zoom SDK/API should Iceberg Digital use first?

What is the fastest useful integration we can build?

What is the highest-value long-term integration?

What should be avoided?

What questions should be escalated to Zoom Partner support?