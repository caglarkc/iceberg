Mission Description

Explore whether Lifesycle users can start, join, and manage Zoom video meetings directly inside the Lifesycle CRM interface.



The goal of this mission is to research the available Zoom technologies, understand the technical requirements, and build a small working proof of concept showing how a Zoom video meeting flow could work inside Lifesycle.



This does not need to be a production-ready feature. The expected result is a clear technical recommendation and, if possible, a simple working demo that helps the main development team decide whether this idea should move forward.



The demo should focus on a basic CRM use case: an agent opens a contact or lead profile in Lifesycle, starts or schedules a Zoom video meeting, and sees the meeting information connected back to that CRM record.



Context & Background

Lifesycle already has Zoom-related communication features and we are exploring ways to make the CRM a stronger communication hub for estate agents.



One possible direction is allowing agents to use Zoom video meetings directly from Lifesycle instead of switching between multiple tools. For example, an agent may want to start a video call with a lead, arrange a virtual viewing, hold a quick internal meeting, or create a meeting connected to a contact, property, viewing, or communication timeline.



This mission is valuable because the main development team does not currently have enough time to fully research and prototype this idea. Iceberg X can help by reducing uncertainty and creating technical clarity.



The mission should investigate whether we should use Zoom Meeting APIs, the Zoom Meeting SDK for Web, the Zoom Video SDK, or a simpler redirect/link-based meeting flow. Zoom’s REST API requires OAuth or server-to-server authentication for API calls, and its Web Meeting SDK can embed the Zoom meeting experience inside a website or web app. The team should compare these options and explain which one is most suitable for Lifesycle. (Zoom￼)



The mission should also consider the user experience. We do not only want to know if Zoom meetings can be created technically. We also want to understand how this would fit into a CRM workflow and whether it creates real value for agents.



Problem Statement

The technical challenge is to determine the best way to support Zoom video meetings from inside Lifesycle CRM.



The mission should answer the following questions:



Can Lifesycle create Zoom meetings using Zoom APIs?

What type of Zoom app or authentication model would be required?

Which OAuth scopes or permissions may be needed?

Can a Zoom meeting be embedded inside the Lifesycle web interface?

Should we use Zoom Meeting SDK for Web, Zoom Video SDK, or a simpler meeting link / redirect approach?

What is the difference between creating a meeting, starting a meeting, joining a meeting, and embedding a meeting?

Can a meeting be connected to a CRM contact, lead, property, viewing, or timeline record?

Can we retrieve meeting metadata after the meeting ends?

Are recordings, transcripts, or summaries available through Zoom APIs, and what limitations exist?

What are the main security, licensing, privacy, UX, and browser limitations?

What would be the simplest MVP version for Lifesycle?

Should Iceberg continue this idea, research it further, or archive it?

The team should not assume that full embedded video is automatically the right solution. A simpler MVP might be more practical, such as creating a Zoom meeting from Lifesycle, storing the meeting URL, and logging it against a contact timeline.



Expected Deliverables

The expected outputs are:



Technical Research Document

A concise document explaining:



Which Zoom APIs, SDKs, or products were investigated

The difference between Zoom Meeting API, Meeting SDK for Web, and Video SDK

Authentication requirements

Required OAuth scopes or permissions

Whether meetings can be created through API

Whether meetings can be embedded in a web app

Whether meeting data can be stored against CRM records

Limitations, risks, pricing/licensing concerns, and security considerations

Recommended technical direction for Lifesycle

Working POC or Demo

Build a simple proof of concept if technically possible.



Minimum acceptable demo:



A simple web page or small app screen with a “Create Zoom Meeting” or “Start Zoom Meeting” button

A backend endpoint or mocked backend flow that represents creating a meeting

Display meeting details such as meeting topic, start time, join URL, and meeting ID

Show how this meeting could be attached to a CRM contact or lead timeline

Store or display a sample meeting history item

Preferred demo:



Create a real Zoom meeting using Zoom API in a safe test environment

Show a basic CRM-style contact profile

Create or schedule a meeting from that profile

Display meeting information in a timeline

Optionally test joining or embedding the meeting using Zoom Meeting SDK for Web

UX Flow

Create a simple user flow showing how this could work in Lifesycle.



Example flow:



Agent opens a contact profile

Agent clicks “Start Zoom Meeting” or “Schedule Zoom Meeting”

Lifesycle creates or stores the meeting

Agent shares or joins the meeting

Meeting activity appears in the contact timeline

Optional follow-up action is created after the meeting

Recommendation

Provide a final recommendation:



Should we continue this idea?

What is the simplest MVP?

What should the main development team do next?

What should not be built yet?

What needs more research?

Handover Package

Prepare a clean handover for the main team:



README

Setup instructions

Environment variable examples

API notes

Demo link or screenshots

Repository or branch link

Known issues

Next-step recommendation

Demo Day Reflection

The team must answer:



“What could we have done better?”



This answer should not be based on excuses such as lack of time, exams, or complexity. The team should explain what could have been planned, tested, communicated, scoped, documented, or executed better.