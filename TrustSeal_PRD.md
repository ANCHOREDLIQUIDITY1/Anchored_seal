# TrustSeal · PRD v1.0 CONFIDENTIAL · Technical Spec

**Anchored Liquidity Codes · 2025 TrustSeal PRD v1.0**

# TRUSTSEAL
**Digital Agreement Platform**  
*Product Requirements Document · Technical Specification*

| | |
|---|---|
| **Document Type** | Product Requirements Document (PRD) v1.0 · June 2025 |
| **Product** | TrustSeal – Digital Agreement Platform |
| **Status** | Active Dev |
| **Author** | Anchored Liquidity Codes – Engineering |
| **Confidentiality** | Confidential |

This document defines the complete technical specification for TrustSeal v1.0 — a digital agreement SaaS platform for freelancers, small businesses, and individuals in Africa and emerging markets. It covers system architecture, data models, API contracts, authentication, security, and implementation guidelines for the engineering team.

## 1. Product Overview

### 1.1 Problem Statement
Millions of informal agreements between freelancers, co-founders, lenders, and service providers in Africa are made verbally or via WhatsApp — with no legal recourse when they break down. Traditional legal contracts are expensive, slow, and inaccessible.
TrustSeal solves this by providing a simple, fast, trustworthy digital agreement platform — requiring no lawyers, no printing, and no in-person meetings.

### 1.2 Product Vision
"The DocuSign for emerging markets — built for the informal economy, priced for the everyday person."

### 1.3 Target Users
* **Freelancers**: Designers, developers, writers, consultants who need client contracts
* **Co-founders**: Early-stage teams forming partnerships and splitting equity
* **Personal Lenders**: Friends and family lending money with repayment terms
* **SMEs**: Small businesses hiring contractors or entering service agreements
* **Creatives**: Musicians, photographers, event planners needing usage agreements

### 1.4 Success Metrics (v1)
* 500 registered users within 60 days of launch
* 200+ agreements created in first 30 days
* < 3 minutes average time to create and send an agreement
* < 2% agreement abandonment rate after sending
* NPS score > 45 at 30-day mark

## 2. System Architecture

### 2.1 High-Level Stack
* **Frontend**: React.js + Tailwind CSS + Framer Motion — deployed on Vercel
* **Backend**: Node.js + Express.js REST API — deployed on Render / Railway
* **Database**: MongoDB Atlas (M0 free tier → M10 at scale)
* **Auth**: JWT (access + refresh tokens) + bcrypt + optional Google OAuth
* **Email**: Nodemailer via SMTP (SendGrid / Mailgun in production)
* **PDF**: `pdf-lib` — server-side generation, no headless browser
* **File Storage**: Cloudinary for signature images and PDF backups
* **State (FE)**: Zustand + React Query (TanStack)

### 2.2 Architecture Pattern
RESTful API with resource-based routing. All state lives on the server; the client is stateless. JWT tokens are stored in memory + httpOnly cookies (dual strategy).

Request lifecycle:
```
Client → HTTPS → Vercel Edge → Express (Render) → Middleware chain → Controller → MongoDB
                                                                              ↓
                                      Rate limiter → JWT verify → Role check → Handler
```

### 2.3 Key Architectural Decisions
| Decision | Choice | Rationale |
|---|---|---|
| **Invite system** | UUID token per party | Allows signing without account creation — reduces friction |
| **Status machine** | Pre-save Mongoose hook | Status auto-updates from party states; single source of truth |
| **PDF generation** | Server-side (`pdf-lib`) | No Puppeteer/Playwright overhead; works in serverless |
| **Soft deletes** | `isDeleted` flag | Preserves audit trail and legal record integrity |
| **Agreement locking**| `isLocked` flag on send | Prevents edits after parties have been notified |
| **Email templating** | Inline HTML strings | Zero external dependency; fully controlled branding |

## 3. Data Models

### 3.1 User
| Field | Type | Req. | Notes |
|---|---|---|---|
| `name` | String | ✅ | Trimmed, max 100 chars |
| `email` | String | ✅ | Unique, lowercase, indexed |
| `password` | String | — | Bcrypt 12 rounds; `select: false` |
| `googleId` | String | — | OAuth ID; `select: false` |
| `avatar` | String | — | Cloudinary URL |
| `plan` | Enum | ✅ | `free` \| `pro` \| `business` |
| `role` | Enum | ✅ | `user` \| `admin` \| `superadmin` |
| `preferences`| Object | — | `darkMode`, `language`, `timezone`, `notifications{}` |
| `isEmailVerified`| Boolean| — | Required for sending agreements |
| `isBanned` | Boolean | — | Blocks login; admin-only |
| `lastLogin` | Date | — | Updated on each login |
| `passwordResetToken`| String| — | SHA-256 hashed; `select: false` |

### 3.2 Agreement
| Field | Type | Req. | Notes |
|---|---|---|---|
| `title` | String | ✅ | Max 200 chars |
| `shortId` | String | ✅ | 8-char UUID slug e.g. "A1B2C3D4"; auto-generated |
| `category` | Enum | ✅ | 6 types: Business Partnership, Freelance Contract, Loan Agreement, NDA, Personal Agreement, Custom Agreement |
| `status` | Enum | ✅ | `draft` → `pending` → `partially_signed` → `signed` \| `rejected` \| `expired` \| `cancelled` |
| `creator` | ObjectId | ✅ | Ref: User |
| `parties` | [Party] | ✅ | Subdocument array — see 3.2.1 |
| `clauses` | [Clause] | — | Ordered array of `{order, title, content}` |
| `comments` | [Comment] | — | Discussion thread on the agreement |
| `auditTrail` | [AuditEvent]| — | Append-only event log |
| `isLocked` | Boolean | — | True after send — prevents all edits |
| `expiresAt` | Date | — | Optional deadline; auto-expires on cron |
| `pdfHash` | String | — | SHA-256 of generated PDF for tamper-detection |
| `isDeleted` | Boolean | — | Soft delete; preserves audit trail |

#### 3.2.1 Party Subdocument
| Field | Type | Req. | Notes |
|---|---|---|---|
| `userId` | ObjectId | — | Linked if party has an account |
| `name` | String | ✅ | Display name |
| `email` | String | ✅ | Used for invite + deduplication |
| `role` | Enum | ✅ | `creator` \| `signer` \| `witness` \| `viewer` |
| `status` | Enum | ✅ | `pending` \| `viewed` \| `accepted` \| `rejected` \| `signed` |
| `token` | String | ✅ | UUID invite token — enables passwordless signing |
| `signedAt`| Date | — | Timestamp of signature |
| `ipAddress`| String | — | Recorded on sign action |
| `userAgent`| String | — | Browser/device info |
| `rejectNote`| String | — | Reason given if rejected |

### 3.3 Signature
| Field | Type | Req. | Notes |
|---|---|---|---|
| `user` | ObjectId | ✅ | Ref: User |
| `type` | Enum | ✅ | `drawn` \| `typed` \| `uploaded` |
| `imageData`| String | — | Base64 PNG data URI (drawn/uploaded) |
| `typedText`| String | — | Name text for typed signatures |
| `fontStyle`| String | — | CSS font-family for typed rendering |
| `isDefault`| Boolean | — | One default per user (enforced in pre-save hook) |
| `hash` | String | — | SHA-256 of signature data for integrity |
| `ipAddress`| String | — | Recorded at creation time |

### 3.4 Template
| Field | Type | Req. | Notes |
|---|---|---|---|
| `name` | String | ✅ | Template display name |
| `category` | Enum | ✅ | Same 6 categories as Agreement |
| `isPublic` | Boolean | — | false = premium/locked |
| `isPremium` | Boolean | — | Requires Pro plan to use |
| `useCount` | Number | — | Incremented on each use |
| `clauses` | [Object] | — | Array of `{order, title, content}` with `{{VARIABLE}}` placeholders |
| `variables` | [Object] | — | Declared placeholders: `{key, label, type, required}` |
| `createdBy` | ObjectId | — | `null` = system template; ObjectId = user-created |

## 4. API Specification

**Base URL:**
* Production: `https://api.trustseal.app/api/v1`
* Development: `http://localhost:5000/api/v1`

All protected routes require:
`Authorization: Bearer <access_token>`

Standard success envelope:
`{ "success": true, "data": {...}, "message": "..." }`

Standard error envelope:
`{ "success": false, "message": "Human-readable error" }`

### 4.1 Auth Endpoints
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | ❌ | Create account; sends verification email |
| POST | `/auth/login` | ❌ | Authenticate; returns JWT + refresh token |
| GET | `/auth/verify-email/:token` | ❌ | Verify email via token from email link |
| POST | `/auth/forgot-password` | ❌ | Send password reset email (always 200) |
| POST | `/auth/reset-password/:token`| ❌ | Set new password via reset token |
| POST | `/auth/refresh-token` | ❌ | Exchange refresh token for new access token |
| GET | `/auth/me` | ✅ | Get current authenticated user profile |

### 4.2 Agreement Endpoints
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/agreements` | ✅ | List user's agreements. Query: status, category, search, page, limit, sort |
| POST | `/agreements` | ✅ | Create new agreement in draft status |
| GET | `/agreements/:id` | ✅ | Get full agreement detail (creator or party only) |
| PUT | `/agreements/:id` | ✅ | Update agreement (creator only, before lock) |
| DELETE | `/agreements/:id` | ✅ | Soft delete (creator or admin) |
| POST | `/agreements/:id/send` | ✅ | Lock agreement and email all party invitations |
| GET | `/agreements/:id/pdf` | ✅ | Stream generated PDF with SHA-256 hash header |
| POST | `/agreements/:id/comments` | ✅ | Add comment to agreement thread |
| GET | `/agreements/sign/:token` | ❌ | Public: get agreement context for signing page |
| POST | `/agreements/sign/:token` | ❌ | Public: sign agreement via invite token |
| POST | `/agreements/reject/:token` | ❌ | Public: reject agreement with optional reason |

### 4.3 Signature Endpoints
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/signatures` | ✅ | List all saved signatures for current user |
| POST | `/signatures` | ✅ | Save a new signature (drawn/typed/uploaded) |
| DELETE| `/signatures/:id` | ✅ | Delete a saved signature |

### 4.4 User Endpoints
| Method | Path | Auth | Description |
|---|---|---|---|
| PUT | `/users/profile` | ✅ | Update name, phone, preferences object |
| PUT | `/users/password`| ✅ | Change password (requires current password) |
| GET | `/users/stats` | ✅ | Get agreement counts: total, signed, pending, expired |

### 4.5 Admin Endpoints
All admin routes require role: `admin` or `superadmin`.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/admin/stats` | ✅ Admin | Platform analytics: users, agreements, revenue, by-category |
| GET | `/admin/users` | ✅ Admin | Paginated user list. Query: search, plan, role |
| PATCH | `/admin/users/:id/ban` | ✅ Admin | Ban or unban a user with optional reason |
| GET | `/admin/agreements` | ✅ Admin | All agreements across all users (paginated) |

### 4.6 Notification Endpoints
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/notifications/remind/:agreementId` | ✅ | Send manual signing reminder to a specific party email |

## 5. Authentication & Security

### 5.1 JWT Strategy
* Access token: 7-day expiry, signed with `JWT_SECRET` (64+ char random)
* Refresh token: 30-day expiry, signed with `JWT_REFRESH_SECRET`
* Token payload: `{ id, role, iat, exp }`
* Storage recommendation: access token in memory; refresh token in `httpOnly` cookie
* Token rotation: new access token issued on every refresh call

### 5.2 Password Security
* Bcrypt with 12 salt rounds (~300ms per hash — brute-force resistant)
* Minimum 8 characters enforced at model level
* Password field has `select: false` — never returned in queries
* Reset tokens are SHA-256 hashed before storage; raw token sent via email only

### 5.3 Rate Limiting
| | |
|---|---|
| **Global limiter** | 200 requests per 15 minutes per IP |
| **Auth limiter** | 10 requests per 15 minutes per IP (login, register, forgot-password) |
| **Behaviour** | Returns 429 with JSON error message; uses `express-rate-limit` |

### 5.4 Agreement Access Control
| | |
|---|---|
| **Creator** | Full read/write/delete access before lock; read + download after lock |
| **Party** | Read access via authenticated route; sign/reject via invite token (no login required) |
| **Admin** | Read all agreements; cannot sign or modify content |
| **Public** | No access except via valid invite token (`sign/:token` routes) |

### 5.5 Document Integrity
* `isLocked` flag set to `true` when agreement is sent — all write routes reject updates
* `auditTrail` array is append-only — no update/delete operations on events
* PDF bytes are SHA-256 hashed; hash stored in `pdfHash` field and returned in `X-Document-Hash` response header
* Invite tokens are UUIDs (v4) — not guessable; single-use flow
* IP address and User-Agent recorded for every signature event

### 5.6 HTTP Security Headers
Applied via Helmet.js middleware:
* `Content-Security-Policy`
* `X-Frame-Options: DENY`
* `X-Content-Type-Options: nosniff`
* `Strict-Transport-Security` (HSTS)
* `Cross-Origin-Resource-Policy: cross-origin`

## 6. Agreement Status Machine
Status is managed automatically by a Mongoose pre-save hook. No manual status setting required.

| From | To | Trigger |
|---|---|---|
| `draft` | `draft` | Agreement created; not sent yet |
| `draft` | `pending` | Creator calls `POST /agreements/:id/send` |
| `pending` | `partially_signed` | At least one (non-creator) party signs |
| `partially_signed` | `signed` | All signers have signed — `completedAt` set automatically |
| `pending` | `rejected` | Any party calls `reject/:token` |
| `partially_signed` | `rejected` | Any remaining party rejects |
| `pending` | `expired` | Current date > `expiresAt` (checked in pre-save + cron) |
| `any` | `cancelled` | Creator manually cancels via `PUT /agreements/:id` |

## 7. Email Flows & Notifications

### 7.1 Transactional Emails
| Email | Trigger | Recipient | Key Content |
|---|---|---|---|
| **Email Verification** | Register | New user | Verify link (24h expiry) |
| **Agreement Invite** | Send agreement | All non-creator parties | Unique sign URL per party |
| **Signature Notification**| Party signs | Creator | Who signed + timestamp |
| **Fully Signed** | All parties sign | All parties | Execution confirmation + PDF link |
| **Signing Reminder** | Manual trigger | Specific party | Re-sends sign URL + days remaining |
| **Password Reset** | Forgot password| User | Reset link (1h expiry) |

### 7.2 SMTP Configuration
* **Development**: Mailtrap (mailtrap.io) or Ethereal (ethereal.email) — catches all outbound emails
* **Staging**: Mailgun sandbox domain
* **Production**: SendGrid (scalable) or Resend (developer-friendly)
* **From address**: `noreply@trustseal.app`

## 8. PDF Generation Specification

### 8.1 Library
`pdf-lib` v1.17.1 — pure JavaScript, server-side only, no headless browser dependency. Outputs A4 (595 × 842 pt) PDF/1.4.

### 8.2 Document Sections
* **Header bar**: TrustSeal branding (green) + Agreement ID in gold
* **Title block**: Agreement title, category, status badge
* **Metadata grid**: Created date, ID, value, status, signed date, expiry
* **Description**: Word-wrapped body text
* **Parties section**: All parties with name, email, role, sign status, timestamp, IP
* **Terms & Clauses**: Numbered list with optional clause titles
* **Signature section**: "✓ SIGNED" + timestamp + IP for signed parties; blank line for pending
* **Audit trail**: Last 6 events with timestamps
* **Integrity hash**: SHA-256 of document metadata in highlighted box
* **Page footer**: Page N of M + generation timestamp
* **DRAFT watermark**: Diagonal "DRAFT" text on all pages when status ≠ `signed`

### 8.3 PDF Metadata
* **Title**: Agreement title
* **Author**: TrustSeal Platform
* **Creator**: TrustSeal v1.0
* **Subject**: Agreement category
* **Keywords**: `["TrustSeal", "Digital Agreement", "Legally Recorded"]`
* **Creation date**: Server timestamp at generation time

### 8.4 Delivery
* **Endpoint**: `GET /agreements/:id/pdf`
* **Response**: `application/pdf` with `Content-Disposition: attachment`
* **Headers**: `X-Document-Hash` (SHA-256), `X-Agreement-ID` (shortId)
* **Auth required**: must be creator or party

## 9. Frontend Technical Specification

### 9.1 Pages & Routes
* `/` - Landing page (marketing)
* `/auth/login` - Sign in
* `/auth/register` - Create account
* `/auth/forgot-password` - Password reset request
* `/dashboard` - Home — stats, recent agreements, activity
* `/agreements` - Agreement list with filters and search
* `/agreements/new` - 4-step creation wizard
* `/agreements/:id` - Agreement detail with audit trail
* `/sign/:token` - Public signing page (no login required)
* `/templates` - Template library
* `/profile` - Account settings
* `/admin` - Admin panel (role-gated)

### 9.2 State Management
* **Global state**: Zustand store — auth user, dark mode, toast notifications
* **Server state**: TanStack Query (React Query) — caching, loading states, refetch
* **Form state**: React Hook Form + Zod validation
* **Signature canvas**: HTML Canvas API (draw mode) + ref management

### 9.3 API Client
Axios instance with base URL from `NEXT_PUBLIC_API_URL`. Interceptors:
* **Request interceptor**: attach `Authorization: Bearer <token>` header
* **Response interceptor**: auto-refresh on 401; redirect to login on refresh failure
* **Error normalisation**: extract message from `{ success: false, message }` envelope

### 9.4 Key Frontend Components
* `<AgreementWizard>`: 4-step form: Details → Parties → Clauses → Review & Send
* `<SignatureModal>`: Tab panel: Draw (Canvas) \| Type (text input) \| Upload (file drop)
* `<AgreementCard>`: List and grid variants with status badge and quick actions
* `<AuditTrail>`: Timeline of events with actor, timestamp, IP
* `<PDFPreview>`: iframe embed of `/agreements/:id/pdf` for in-browser preview
* `<PartyManager>`: Add/remove/role-assign parties with email invite preview
* `<ClauseEditor>`: Rich text or plain textarea per clause with ordering
* `<TemplateGallery>`: Grid of system templates with use-count and category filter

### 9.5 Design System
* **Font**: Syne (headings, 700–800 weight) + DM Sans (body, 400–600)
* **Primary color**: `#1A472A` (seal green); **Accent**: `#C9A84C` (gold)
* **Spacing**: 4px base unit (4, 8, 12, 16, 20, 24, 28, 32, 48, 64)
* **Radius**: sm=8px, md=12px, lg=20px, xl=28px
* **Dark mode**: CSS custom properties on `:root` and `.dark` class
* **Animations**: Framer Motion for page transitions; CSS for micro-interactions
* **Responsive**: Mobile-first; sidebar collapses to slide-over on < 900px

## 10. Plan Limits & Business Rules

| Feature | Free | Pro | Business |
|---|---|---|---|
| Agreements / month | 5 | 100 | Unlimited |
| Templates access | Basic | All | All + Custom |
| Parties per agreement | 2 | 10 | 25 |
| PDF downloads | Watermarked | Clean | Clean + White-label |
| Audit trail | 7 days | Forever | Forever + Export |
| Email reminders | 1/agreement | Unlimited | Unlimited |
| Storage | 50MB | 5GB | 50GB |
| Priority support | ❌ | ✅ | ✅ + SLA |

## 11. Environment Variables

### 11.1 Backend (`.env`)
| Variable | Req. | Description |
|---|---|---|
| `NODE_ENV` | ✅ | `development` \| `production` \| `test` |
| `PORT` | ✅ | API server port (default: 5000) |
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | 64+ char random string — generate with `crypto.randomBytes(64)` |
| `JWT_REFRESH_SECRET` | ✅ | Different 64+ char string for refresh tokens |
| `JWT_EXPIRES_IN` | ✅ | Access token TTL e.g. `7d` |
| `CLIENT_URL` | ✅ | Frontend URL for CORS + email links |
| `SMTP_HOST` | ✅ | SMTP server hostname |
| `SMTP_PORT` | ✅ | 587 (TLS) or 465 (SSL) |
| `SMTP_USER` | ✅ | SMTP username / API key |
| `SMTP_PASS` | ✅ | SMTP password |
| `SMTP_FROM` | ✅ | Sender address e.g. `noreply@trustseal.app` |
| `CLOUDINARY_CLOUD_NAME`| ⚠️ | Cloudinary account name |
| `CLOUDINARY_API_KEY` | ⚠️ | Cloudinary API key |
| `CLOUDINARY_API_SECRET`| ⚠️ | Cloudinary API secret |
| `GOOGLE_CLIENT_ID` | — | Optional: Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | — | Optional: Google OAuth client secret |

## 12. Deployment Guide

### 12.1 Frontend — Vercel
* Connect GitHub repo to Vercel
* Root directory: `frontend/`
* Framework preset: Next.js
* Set `NEXT_PUBLIC_API_URL` to your Render/Railway backend URL
* Automatic deployments on push to main branch

### 12.2 Backend — Render
* New Web Service → connect GitHub repo
* Root directory: `backend/`
* Build command: `npm install`
* Start command: `npm start`
* Set all environment variables in Render dashboard
* Health check path: `/health`
* Auto-deploy on push to main

### 12.3 Database — MongoDB Atlas
* Create free M0 cluster (512MB storage)
* Add `0.0.0.0/0` to IP allowlist or restrict to Render's outbound IPs
* Create dedicated database user with `readWrite` role on `trustseal` database
* Enable Atlas Search index on agreements collection for full-text search
* Run `npm run seed` to populate system templates after first deploy

### 12.4 Post-Deploy Checklist
* ✅ Health check returns 200: `GET /health`
* ✅ Register a test account
* ✅ Verify email flow (check Mailtrap / inbox)
* ✅ Create, send, and sign a test agreement
* ✅ Download PDF — verify SHA-256 hash in response header
* ✅ Test rate limiting: send 11 rapid auth requests
* ✅ Confirm CORS allows only `CLIENT_URL` origin

## 13. Engineering Roadmap

### Phase 1 — v1.0 (Current)
* ✅ Authentication (JWT, bcrypt, email verify, password reset)
* ✅ Agreement CRUD with status machine
* ✅ Party invite system via unique tokens
* ✅ Digital signature (draw, type, upload)
* ✅ PDF generation (`pdf-lib`)
* ✅ Transactional emails (6 templates)
* ✅ Admin panel (user management, analytics)
* ✅ Rate limiting, helmet, CORS
* ✅ Audit trail + document hash

### Phase 2 — v1.5 (Q3 2025)
* Real-time updates via Socket.io (live signing status)
* AI agreement drafting using Claude API (Anthropic)
* Paystack / Flutterwave subscription billing
* Witness signature support
* Mobile app — React Native (Expo)
* Webhook system for third-party integrations

### Phase 3 — v2.0 (Q4 2025)
* Blockchain-backed immutability (Polygon — low gas fees)
* CAC company verification integration (Nigeria)
* Lawyer review marketplace
* Multi-language support (French, Hausa, Igbo, Yoruba)
* White-label API for law firms and fintechs
* Escrow payment tied to agreement milestones
