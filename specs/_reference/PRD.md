THE FASHION SOCIAL | TICKETING PLATFORM

Project Requirements &amp; Product Documentation • Draft v1.0 • October 2026

THE FASHION SOCIAL

TICKETING WEB APPLICATION
Product Requirements • User Journeys • Technical Plan • Launch Checklist

Event: The Fashion Social — Style Meets Laughter
Organiser: NIYASA | Location: Benin City, Edo State, Nigeria

DOCUMENT STATUS: WORKING DRAFT — FOR PLANNING AND DEVELOPMENT

THE FASHION SOCIAL | TICKETING PLATFORM

Project Requirements &amp; Product Documentation • Draft v1.0 • October 2026

Document Control
Item Details
Document title The Fashion Social Ticketing Web Application — Product

Requirements Document
Version 1.0 — Working draft
Date 16 October 2026
Prepared for NIYASA / The Fashion Social organising team
Purpose Define the proposed product, functionality, design, technology,

operations, and launch requirements.

Status

Scope and implementation plan proposed; prices, official
email, event date, venue, and final brand choices remain to be
confirmed.

1. Executive Summary
This document specifies a mobile-friendly ticketing web application for The Fashion Social — Style Meets Laughter, a
fashion-and-comedy social event planned for Benin City, Edo State, Nigeria. The platform will allow guests to discover
event information, identify their university or institution, select a ticket category, pay online, and receive a branded
digital ticket by email after payment has been verified.
The organising team will have a secure admin dashboard for ticket inventory, sales reporting, customer lookup, ticket
resending, and entry verification. Every successful purchase will trigger a customer ticket email and a sales
notification to a designated official event email address. The design should feel premium, elegant, contemporary, and
easy to use on Android phones and desktop computers.
The proposed initial release is centred on The Fashion Social. The underlying design should avoid unnecessary
limitations that would prevent the platform from supporting additional events in a later phase.

2. Event and Product Context
Field Working definition
Event name The Fashion Social — Style Meets Laughter
Organiser NIYASA
Location Benin City, Edo State, Nigeria
Audience Students, young professionals, fashion brands, models,

creatives, and fashion/comedy audiences

Experience direction Luxury, classy, social, and exclusive; fashion and comedy

should have equal prominence

Planned attendance target 3,000 guests (planning target, not a confirmed ticket allocation)
Website working name The Fashion Social Tickets
Initial product scope Ticket sales and event administration for The Fashion Social
Future direction

Potential to support multiple events and organisers; multi-
organiser marketplace features are not included in the initial
launch unless separately approved.

The event concept may include runway showcases, comedy, cocktails, networking, shopping, and opportunities for
youth involvement. Final programme details must be confirmed by the organisers before being published on the site.

3. Goals and Success Measures
 Make ticket discovery and purchase straightforward, especially on mobile devices.
 Offer four clear ticket categories: Regular, VIP, VVIP, and Sit with Influencers &amp; Celebrities.

THE FASHION SOCIAL | TICKETING PLATFORM

Project Requirements &amp; Product Documentation • Draft v1.0 • October 2026
 Capture each buyer’s contact details and selected institution, with appropriate privacy notices.
 Confirm payment server-side before issuing a valid ticket.
 Automatically email the ticket to the buyer and notify the official event email about successful sales.
 Prevent overselling through controlled inventory and safe handling of concurrent purchases.
 Give the organising team a useful dashboard for sales, revenue, institutions, tickets, and event entry.
 Support QR-based entry validation and prevent duplicate admission scans.
Metric How it will be measured
Ticket sales Paid tickets by category and date
Revenue Successful payment totals, with refunds/chargebacks reported

separately

Institution reach Paid tickets grouped by selected institution
Email delivery Sent, delivered, bounced, and failed ticket emails where

provider data is available

Checkout conversion Completed purchases divided by checkout starts, if analytics is

enabled

Entry operations Tickets scanned, accepted, rejected, and duplicate scan

attempts

4. Scope
4.1 Included in the first release
 Responsive public event website and event information pages.
 Ticket category display, prices, sales status, and remaining quantity where appropriate.
 Buyer checkout form and institution selection.
 Payment gateway integration for Nigerian payments, subject to merchant account approval.
 Payment verification and order status management.
 Unique ticket numbers and QR codes.
 Automatic ticket email to the customer and sale notification to the designated event email.
 Secure admin authentication and role-restricted dashboard.
 Ticket inventory and pricing management.
 Customer/order search and ticket resend function.
 Sales summaries and institution-level reports.
 QR ticket verification and check-in status.
 Basic support, privacy, terms, refund, and event-information pages.
4.2 Not included unless approved as a later phase
 A public marketplace where unrelated organisers can self-register and publish events.
 Native Android or iOS applications.
 Complex seat maps or choosing a specific numbered seat.
 Automatic celebrity/influencer matching or guaranteed seating beside a named personality.
 Full accounting, payroll, inventory, or vendor marketplace systems.
 Automated refunds without an approved refund workflow and payment-provider support.

5. User Types and Permissions
User type Main needs Access
Guest / buyer Browse event, choose category, pay,
receive and display ticket

Public pages and their purchase
confirmation/ticket link

Event administrator Manage tickets, orders, event details,

and reports

Full admin access appropriate to
assigned role

THE FASHION SOCIAL | TICKETING PLATFORM

Project Requirements &amp; Product Documentation • Draft v1.0 • October 2026

Check-in staff Scan QR codes and admit valid ticket

holders Restricted check-in interface only

Finance / sales reviewer Review payments, sales totals, and

transaction references Read-only reporting access, if configured

System/service processes Verify payments, create tickets, send

email, log events

Server-side credentials and limited
permissions only

The platform should support least-privilege access: check-in staff should not be able to change prices or export all
customer records unless explicitly authorised.

6. Website Pages and Interface Requirements
Page Required content and behaviour
Home

Event identity, hero image, tagline, date/venue when
confirmed, countdown when appropriate, Buy Tickets CTA,
event highlights, categories, FAQs, contact/social links.
Buy Tickets Four ticket cards with clear benefits, price, availability, quantity

selector, and selection action.

Checkout

Name, email, phone, institution, ticket category, quantity, price
breakdown, terms acknowledgement, and secure payment
hand-off.

Payment result Clear pending/success/failed status; do not show a ticket as

valid until payment is verified.

My Ticket / ticket view Branded ticket details, unique ticket number, category, event

details, QR code, and support instructions.

About the Event Approved event description, programme highlights, organisers,

and policies.

Institutions Searchable/selectable list of verified universities and other

institutions if enabled.

FAQ / Support Payment issues, email delivery, ticket access, entry

instructions, refunds, contact channel.
Admin login Secure authentication and account recovery.
Admin dashboard Sales cards, ticket category breakdown, recent orders, sales

trends, and relevant alerts.

Ticket management Create/edit categories, prices, quantities, descriptions, sales

windows, and availability.

Orders and customers Search by ticket number, transaction reference, buyer

name/email, and view order status.

Reports Paid sales, ticket counts, revenue, category performance, and

institution breakdown.

Ticket verification QR scanning or manual ticket-number lookup; display
valid/used/invalid/refunded status and record check-in.

6.1 Visual direction
 Use a luxury editorial aesthetic: black, white, and restrained gold accents, unless final branding specifies
otherwise.
 Use high-quality fashion/event imagery, confident typography, generous spacing, and clear calls to action.
 Keep Regular, VIP, VVIP, and influencer/celebrity options visually distinct without confusing their benefits.
 Use legible contrast, large touch targets, clear error messages, and short mobile forms.
 Avoid excessive animation, slow-loading media, or design elements that obstruct checkout.

7. Ticket Categories and Rules
Category Working description Configuration needed
Regular General admission to the event. Price, quantity limit, included access,

sales window.

THE FASHION SOCIAL | TICKETING PLATFORM

Project Requirements &amp; Product Documentation • Draft v1.0 • October 2026

VIP

Enhanced event experience and
designated VIP seating, subject to final
venue plan.

Price, quantity, confirmed benefits,
seating/access rules.

VVIP

Premium access and exclusive seating
arrangements, subject to final event
plan.

Price, quantity, confirmed benefits,
access rules.

Sit with Influencers &amp; Celebrities

Special seating with designated
influencers/celebrities, subject to
confirmed arrangements and availability.

Price, quantity, exact inclusions, seating
terms, and clear disclaimer if specific
people are not guaranteed.
No ticket price has been approved in this ticketing discussion. Prices, inventory limits, fees, and benefits must be
entered by the authorised administrator before ticket sales open. The site must never imply that a named influencer or
celebrity is guaranteed unless the organiser has confirmed that arrangement in writing.
 Each ticket category has a unique identifier, published price, status, inventory, description, and optional sales
start/end times.
 Inventory must be checked and reserved safely during checkout to reduce overselling.
 A pending payment should not create a valid admission ticket.
 Cancelled, refunded, disputed, or invalidated tickets must not be accepted at the gate.
 If an order contains multiple tickets, the system should issue a unique ticket/QR code for each admitted person,
unless the organiser chooses and documents a different policy.

8. Institution Directory
The checkout will include a searchable institution selector. The first directory should cover universities in Edo State,
with an optional expansion to polytechnics, colleges, and other tertiary institutions. The user should be able to choose
“Other institution” and enter a name if their school is missing.
Candidate entries for verification include University of Benin (UNIBEN), Igbinedion University, Edo State University,
Ambrose Alli University, Wellspring University, Benson Idahosa University, and Mudiame University. This is a starter
list only; the complete directory and official names must be verified before launch.
 Store an institution record separately from the order to keep reporting consistent.
 Provide search/autocomplete and prevent accidental duplicate spellings where possible.
 Allow an administrator to add, edit, deactivate, or merge institution entries.
 Collect institution information only for event operations, reporting, and approved promotion; explain its use in the
privacy notice.

9. Customer Purchase Journey
1. Visitor lands on the homepage and reviews event information.
2. Visitor opens Buy Tickets and compares the four categories.
3. Visitor chooses category and quantity; the system displays the price and any applicable fees clearly.
4. Visitor enters full name, email address, phone number, and institution.
5. Visitor reviews the order and acknowledges the applicable terms and refund policy.
6. The system creates a pending order and safely reserves inventory for a limited checkout period.
7. Visitor pays through the selected payment gateway.
8. The backend verifies the transaction with the payment provider using a trusted server-side method or verified
webhook.
9. If payment is confirmed and the order is eligible, the order becomes paid, inventory is committed, and unique
tickets/QR codes are created.
10. The customer receives a branded email with ticket details; the official event email receives a sale notification.
11. At the venue, staff scan the QR code; the system validates the ticket and marks it as used.

THE FASHION SOCIAL | TICKETING PLATFORM

Project Requirements &amp; Product Documentation • Draft v1.0 • October 2026

10. Payment Processing Requirements
Proposed payment provider: Paystack, with Flutterwave as an alternative subject to a deliberate decision. The
selected provider must support the organiser’s merchant account and intended payment methods.
 Never store full card details or payment PINs in the application database.
 Create orders on the server and calculate prices from trusted database values, not from browser-submitted totals.
 Verify transaction status, amount, currency, order reference, and relevant metadata on the server.
 Validate webhook signatures according to the payment provider’s current documentation.
 Make payment processing idempotent so duplicate callbacks cannot issue duplicate tickets or count revenue
twice.
 Handle pending, successful, failed, abandoned, reversed, refunded, and disputed transactions explicitly.
 Do not mark an order paid based solely on the browser returning to a success URL.
 Keep a transaction audit trail and never expose secret API keys in frontend code.
Currency: Nigerian naira (NGN) is the proposed default. Payment gateway fees, service charges, and whether fees
are absorbed or passed to customers must be decided and disclosed before launch.

11. Ticket Generation and Email Delivery
11.1 Customer ticket email
After verified payment, the system should email the buyer a branded confirmation and ticket. The email should include
buyer name, event name, ticket category, unique ticket number, event date/time and venue once confirmed, QR code
or secure ticket link, entry instructions, and support contact.
11.2 Official sales notification
A configurable official event email address should receive one notification for each successfully paid order. The
notification should include order reference, buyer name, institution, category, quantity, total paid, currency, payment
reference, and timestamp. Access to customer data in notifications should be limited to what the organising team
needs.
11.3 Delivery and recovery
 Use a transactional email service such as Resend or another approved provider, with a verified sending domain.
 Use branded templates and a clear sender name.
 Record email delivery status where the provider supports it; retry transient failures safely.
 Provide an admin action to resend a ticket without generating a new ticket or charging the customer again.
 Tell buyers to check spam/promotions folders and provide a support path if email delivery fails.
 Do not include secret data or payment credentials in email.
Email sending depends on domain verification, provider configuration, account limits, and deliverability. The official
recipient address is still to be supplied by the organiser.

12. QR Codes and Venue Entry
 Every ticket must have a unique, hard-to-guess identifier and QR payload.
 The QR code should not expose unnecessary personal information; use a ticket identifier or signed/opaque token.
 The scanner/check-in page must query the server to validate current ticket status.
 A valid unused ticket is marked used atomically on first successful scan.
 A second scan should show that the ticket has already been used, including the first scan time if permitted.
 Invalid, cancelled, refunded, or unknown tickets should be rejected with a clear staff message.
 Provide manual ticket-number lookup as an operational fallback, protected by staff login.

THE FASHION SOCIAL | TICKETING PLATFORM

Project Requirements &amp; Product Documentation • Draft v1.0 • October 2026

 Plan for venue connectivity; any offline scanning mode requires a separate design and reconciliation procedure.

13. Admin Dashboard and Reporting
Module Required features
Overview Paid ticket count, gross sales, net/refund indicators where
available, category breakdown, recent transactions.
Ticket categories Create/edit category, price, quantity, description, sales status,

and sales window.

Orders Search, filter, open order, review payment status, view ticket

identifiers, resend email.

Customers View necessary buyer details and purchase history; restrict

exports to authorised roles.

Institution report Tickets and revenue grouped by selected institution, with

date/category filters.

Entry report Scans, accepted entries, duplicates, invalid tickets, and

remaining unscanned tickets.

Email status Ticket email sent/delivered/failed status where supported; retry

failed sends.

Audit log

Record important administrative actions such as price
changes, refunds/status changes, exports, and access
changes.

A daily sales summary can be emailed to the designated event address. The schedule and contents should be
configurable, and totals must be calculated from verified transactions.

14. Proposed Technical Architecture
Layer Proposed technology Responsibility
Frontend Next.js / React

Responsive pages, ticket selection,
checkout experience, ticket display,
admin interface.

Styling Tailwind CSS Consistent responsive layout and design

system.

Server/backend Next.js server-side routes/actions or
equivalent trusted backend

Order creation, payment verification,
ticket creation, admin operations,
webhooks.

Database Supabase PostgreSQL Events, institutions, categories, orders,
tickets, payments, check-ins, users, logs.
Authentication Supabase Auth or equivalent Admin and check-in staff sign-in, role-

based access.

Payment gateway Paystack (proposed) or Flutterwave Payment initiation, transaction status,

trusted webhook events.

Email Resend (proposed) or equivalent
transactional email service

Customer ticket delivery, sale
notifications, optional daily summaries.
QR generation Maintained QR-code library Render unique ticket QR codes.
Hosting Vercel or equivalent Application hosting, HTTPS,
deployment, environment configuration.

Monitoring Hosting/provider logs and error

monitoring

Detect failed payments, email failures,
application errors, and suspicious
activity.

This is a proposed stack, not a statement that accounts have been created or services connected. The final stack may
be adjusted based on developer skill, budget, provider terms, and current product capabilities.

15. Initial Data Model
Entity Core fields (illustrative)

THE FASHION SOCIAL | TICKETING PLATFORM

Project Requirements &amp; Product Documentation • Draft v1.0 • October 2026

Event id, name, slug, description, date/time, venue, timezone, status,

branding settings

Institution id, official name, institution type, location, active status
TicketCategory id, event_id, name, description, price, currency, total inventory,

sales window, status

Order

id, public order reference, buyer name, email, phone,
institution_id or institution text, total, currency, status,
timestamps

OrderItem id, order_id, ticket_category_id, quantity, unit price, subtotal
Payment id, order_id, provider, provider reference, amount, currency,
status, verified timestamp, webhook metadata reference
Ticket id, order_item_id, unique ticket number, category, QR

token/hash, status, issued timestamp

CheckIn id, ticket_id, staff user, scan timestamp, result, device/session

metadata where appropriate
AdminUser / Role user id, role, permissions, active status
EmailLog id, order/ticket reference, recipient type, provider message id,

status, retry count, timestamps

AuditLog id, actor, action, target record, timestamp, safe change

summary

Exact schema, relationships, indexes, retention rules, and row-level security policies should be finalised during
implementation. Payment secrets and unnecessary raw payment data must not be stored in ordinary records.

16. Security, Privacy, and Reliability
 Serve the site over HTTPS and store secrets only in server-side environment variables.
 Use role-based access and strong authentication for all administrative functions.
 Apply database access policies so public visitors cannot read private orders, customer data, or admin records.
 Validate and sanitise all input; protect against common web vulnerabilities, abuse, and injection.
 Add rate limits and bot/abuse controls to checkout, login, ticket lookup, and email resend endpoints.
 Verify payment callbacks and make webhook/order processing idempotent.
 Keep audit logs for sensitive changes and avoid logging card data, passwords, or secret tokens.
 Collect only necessary personal data and publish a privacy notice explaining purpose, retention, sharing, and
contact details.
 Define data retention and deletion procedures consistent with applicable Nigerian data protection obligations.
 Back up critical data and test restoration before launch.
 Monitor application errors, payment reconciliation, email delivery, and database health.
 Restrict ticket exports and customer data access to authorised personnel.

17. Functional Acceptance Criteria
ID Requirement Acceptance condition
FR-01 Browse event A visitor can view the event page and
ticket information on mobile and desktop.
FR-02 Select category A visitor can choose one of the four
ticket categories when sales are open.

FR-03 Institution capture

A buyer can select a listed institution or
enter an unlisted institution where
enabled.

FR-04 Correct pricing The backend calculates the total using
the active category price and quantity.

FR-05 Payment verification

A ticket is issued only after server-side
confirmation of a matching successful
payment.

FR-06 Unique tickets Every issued ticket has a unique number

and QR token.

THE FASHION SOCIAL | TICKETING PLATFORM

Project Requirements &amp; Product Documentation • Draft v1.0 • October 2026

FR-07 Customer email A successful order triggers a customer

ticket email.

FR-08 Sales notification A successful order triggers a notification
to the configured official event email.

FR-09 Admin visibility

Authorised staff can view order status,
sales totals, and ticket category
breakdown.

FR-10 Resend ticket Admin can resend a ticket email without
creating a duplicate ticket or payment.

FR-11 Inventory control

The system prevents selling beyond
available inventory under concurrent
checkout conditions.

FR-12 QR validation

Valid unused tickets are accepted once;
repeated scans and invalid tickets are
flagged.

FR-13 Access control

Unauthorised visitors cannot access
admin pages or private customer
records.

FR-14 Failure handling

Payment, email, and application failures
are shown/logged without falsely
marking an order as paid.

18. Non-Functional Requirements
Area Requirement
Usability Simple mobile-first flow with clear pricing, short forms,

readable text, and helpful errors.

Performance Optimise images and assets; keep checkout lightweight and
measure performance on typical mobile connections.
Availability Use reliable hosting and monitor the site, particularly during

ticket-release periods.

Scalability Support the planned 3,000-guest event target and anticipated

concurrent demand; load-test before launch.

Accessibility Use semantic HTML, keyboard support, clear focus states,
sufficient contrast, and descriptive form labels.
Maintainability Use version control, documented environment setup,
migrations, and repeatable deployment steps.

Observability Keep useful logs for payments, webhook processing, email

sends, ticket issuance, and check-ins.

Compatibility Support current mainstream mobile and desktop browsers.
Integrity Keep payment, order, inventory, ticket issuance, and check-in

states consistent.

19. Policies and Decisions Required
Decision Current status
Final website/product name Proposed: The Fashion Social Tickets; approval required.
Official logo and brand assets To be supplied/approved.
Event date and start/end time Not yet confirmed in this document.
Venue and address Not yet confirmed.
Ticket prices Not approved; must be set before sales open.
Ticket inventory per category To be determined from venue capacity and event plan.
Benefits per ticket category Must be confirmed, especially VIP/VVIP and celebrity seating.
Official event notification email To be supplied or created and verified.
Payment gateway Paystack proposed; final provider/account approval required.
Email provider and sending domain Resend proposed; configure and verify before launch.
Refund/cancellation/transfer policy Must be written and approved before checkout opens.
Service fees and fee payer Must be decided and disclosed.
Institution directory Starter list included; full list and official names require

verification.

THE FASHION SOCIAL | TICKETING PLATFORM

Project Requirements &amp; Product Documentation • Draft v1.0 • October 2026
Data retention and privacy notice Must be reviewed and approved before collecting live

customer data.

Multi-event support Design for future expansion; confirm whether it is in launch

scope.

20. Delivery Plan
Phase Work Completion outcome
1. Discovery and confirmation

Approve name, brand, event details,
prices, category benefits, capacity,
policies, official email, payment provider.

Signed-off requirements and content
checklist.

2. UX and visual design

Create mobile-first wireframes and final
visual system for home, tickets,
checkout, ticket, and admin.

Approved page designs and interaction
flow.

3. Foundation

Set up repository, hosting, database,
authentication, environment secrets, and
deployment pipeline.

Secure working project foundation.

4. Ticket catalogue and checkout

Implement institutions, categories,
pricing, inventory, order creation, and
checkout.

End-to-end test checkout in sandbox.

5. Payment and email

Integrate gateway verification/webhooks,
ticket generation, QR, customer email,
sales notification.

Verified test purchase produces ticket
and notifications.

6. Admin and check-in

Build dashboard, reporting, ticket
management, search, resend, and QR
validation.

Operational admin and gate workflows.

7. QA and launch preparation

Test edge cases, load, security, mobile
usability, email deliverability, and
payment reconciliation.

Launch approval checklist completed.

8. Launch and monitoring

Deploy production configuration, run a
controlled live test, monitor sales and
failures.

Public site operational with support
procedure.

21. Testing Plan
 Test successful, failed, pending, abandoned, and delayed payment flows in the gateway sandbox.
 Test duplicate webhooks and repeated success redirects; confirm only one order/ticket issuance event is
processed.
 Test mismatched amount/currency/reference and invalid webhook signatures.
 Test category sold out, checkout expiry, concurrent buyers, and quantity limits.
 Test email success, bounce/failure, retry, and admin resend behaviour.
 Test valid, invalid, already-used, refunded, and cancelled QR tickets.
 Test admin role restrictions, unauthorised access, session expiry, and password recovery.
 Test institution search, “Other institution”, and reporting consistency.
 Test mobile layout, slow network behaviour, form errors, accessibility basics, and major browsers.
 Reconcile test and live transactions against payment-provider records before and after launch.

22. Launch Checklist
 Event name, description, date, venue, contact information, logo, and images approved.
 All four ticket categories, prices, benefits, inventory, and sales windows approved.
 Institution directory reviewed and “Other institution” behaviour tested.
 Refund, cancellation, transfer, entry, privacy, and terms policies published.
 Payment merchant account approved; live keys stored securely; webhook endpoint verified.

THE FASHION SOCIAL | TICKETING PLATFORM

Project Requirements &amp; Product Documentation • Draft v1.0 • October 2026
 Transactional email domain verified; customer and organiser notification templates tested.
 Admin users and check-in staff accounts created with least-privilege roles.
 QR scanning devices and venue internet arrangements tested.
 Sales reports, email retry, ticket resend, backups, monitoring, and incident contacts tested.
 Load/security checks completed; final production purchase and gate scan rehearsed.
 Organising team briefed on payment support, duplicate scans, refunds, and ticket lookup.

23. Sample Email Templates
23.1 Customer ticket email
Subject: Your Ticket Is Confirmed — The Fashion Social
Hello [Customer Name],
Your payment has been confirmed and your ticket for The Fashion Social — Style Meets Laughter has been issued.
Ticket number: [Ticket Number]
Ticket category: [Category]
Institution: [Institution]
Order reference: [Order Reference]
Event date: [Confirmed Date and Time]
Venue: [Confirmed Venue]
Your QR code is included in this email / available through the secure ticket link below. Please present it at the
entrance for validation. Each ticket is valid according to the event’s published entry policy.
For assistance, contact [Official Support Email/Phone].
We look forward to welcoming you!
The Fashion Social Team
Organised by NIYASA
Style Meets Laughter.
23.2 Organiser sale notification
Subject: New Paid Ticket Order — [Order Reference]
A ticket order has been verified as paid.
Order reference: [Order Reference]
Buyer: [Customer Name]
Buyer email: [Email]
Phone: [Phone]
Institution: [Institution]
Ticket category: [Category]
Quantity: [Quantity]
Amount paid: [Currency and Amount]
Payment reference: [Provider Reference]
Paid at: [Timestamp]
View the order in the secure admin dashboard. Do not treat this email alone as a substitute for the payment provider’s
transaction records.

THE FASHION SOCIAL | TICKETING PLATFORM

Project Requirements &amp; Product Documentation • Draft v1.0 • October 2026

24. Risks and Mitigations
Risk Mitigation
Payment succeeds but ticket email fails Keep ticket record in database, log email status, retry safely,

and allow admin resend.

False payment confirmation or forged callback Verify payment server-side and validate signed webhooks.
Overselling a category Use atomic inventory reservation/commit logic and expiry of

abandoned holds.

Duplicate QR use Atomically mark ticket used on first accepted scan; flag

subsequent scans.

Celebrity seating expectation mismatch Publish exact inclusions and only promise confirmed

appearances/seating arrangements.

Incorrect event information Require organiser approval before publishing date, venue,

prices, and benefits.

Email deliverability problems Verify sending domain, configure provider requirements, test

templates, and monitor bounces.

Unauthorised customer-data access Role restrictions, database policies, limited exports, audit logs,

and secure credentials.

High demand or unstable connectivity Optimise assets, load-test, monitor hosting, and plan gate

procedures.

Policy/legal gaps Review applicable Nigerian data protection, consumer, tax,
and payment-provider requirements before launch.

25. Final Product Definition
The intended first release is a polished, mobile-first ticket sales platform for The Fashion Social — Style Meets
Laughter. It will provide public event information, four configurable ticket categories, institution selection, secure online
checkout, verified payment processing, automatic ticket delivery, official sale notifications, an administrator
dashboard, sales reporting, and QR-code entry verification.
The application should be built with future expansion in mind, but the immediate priority is a dependable and attractive
single-event ticketing experience. Development should begin after the organising team confirms the remaining event,
pricing, branding, payment, email, and policy decisions.

Appendix A — Proposed Build Stack
Next.js/React + Tailwind CSS; server-side payment/order logic; Supabase PostgreSQL and authentication; Paystack
(or approved alternative); Resend (or approved transactional email service); QR-code library; Vercel (or approved
hosting). All third-party services require account setup, current-plan review, secure configuration, and testing.

Appendix B — Glossary
Term Meaning
Order A buyer’s checkout record, which may contain one or more

tickets.

Payment verification A trusted server-side check that confirms the payment provider

reports the expected transaction as successful.
Ticket A unique admission credential issued after payment

confirmation.

QR code A scannable representation of a ticket identifier/token used to

retrieve and validate ticket status.

Webhook A server-to-server event sent by a payment provider to notify

the application about a transaction.

Idempotency A safeguard that ensures processing the same event more

than once does not create duplicate effects.
Inventory hold A temporary reservation of ticket quantity while a buyer

completes payment.

THE FASHION SOCIAL | TICKETING PLATFORM

Project Requirements &amp; Product Documentation • Draft v1.0 • October 2026