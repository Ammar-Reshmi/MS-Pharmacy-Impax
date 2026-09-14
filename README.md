# MS Pharma Impex — Enterprise Pharmaceutical Quotation Platform

An enterprise B2B pharmaceutical catalogue, quotation management, and commercial operations platform purpose-built for **MS Pharma Impex**.

Developed with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **PostgreSQL**, **Drizzle ORM**, **Tailwind CSS**, and **NextAuth.js v5**.

---

## Table of Contents
- [Company Overview](#company-overview)
- [Version 1 Architecture & Access Model](#version-1-architecture--access-model)
  - [Why No Customer Login/Authentication in V1](#why-no-customer-loginauthentication-in-v1)
  - [Administrative Security & RBAC](#administrative-security--rbac)
- [Key Features (Version 1 - MVP)](#key-features-version-1---mvp)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Configuration](#environment-configuration)
  - [Database Setup & Migrations](#database-setup--migrations)
  - [Seeding Initial Data](#seeding-initial-data)
  - [Running the Development Server](#running-the-development-server)
  - [Default Staff Accounts](#default-staff-accounts)
- [Version 2 Implementation Plan (Real-Time & Automation)](#version-2-implementation-plan-real-time--automation)
  - [Objectives & Architecture](#objectives--architecture)
  - [Core Components & Implementation Modules](#core-components--implementation-modules)
  - [Data Model Extensions for V2](#data-model-extensions-for-v2)
- [Phased Development Roadmap (V1 – V4)](#phased-development-roadmap-v1--v4)
- [License](#license)

---

## Company Overview

- **Legal Entity**: MS Pharma Impex Private Limited
- **Brand Name**: MS Pharma Impex
- **Industry**: Pharmaceutical Wholesale & B2B Distribution
- **Headquarters**: Mumbai, Maharashtra, India

---

## Version 1 Architecture & Access Model

The platform operates on a deliberate **two-tier access model** designed specifically for high-efficiency B2B pharmaceutical commerce.

### Why No Customer Login/Authentication in V1

In Version 1 (MVP), **normal clients and customers do NOT have or require an account, registration, or login page**.

1. **Zero B2B Procurement Friction**: Hospital procurement officers, retail pharmacy buyers, and wholesale distributors need instant access to explore product specifications, compositions, pack sizes, and manufacturer details without signup barriers.
2. **Guest Quotation Ingestion**: Clients submit quotation requests through `/request-quote` simply by selecting items and providing their commercial verification details (Company Name, Contact Person, GSTIN, Email, Phone, and Delivery Address).
3. **Verified Commercial Review**: Submissions are not unverified retail shopping carts; each inquiry generates a unique reference code (e.g., `QR-20260914-XXXX`) and is routed to the internal sales operations dashboard for validation against real-time wholesale pricing and stock.

### Administrative Security & RBAC

Authentication is strictly enforced for internal **MS Pharma Impex staff** via `/admin/login`.

- **Role-Based Access Control (RBAC)**:
  - `super_admin`: Full system control, staff management, organization & financial settings, audit log inspection.
  - `sales`: Manages customer accounts, reviews quote requests, prepares formal quotations, generates proforma invoices.
  - `catalogue_manager`: Manages categories, publishes/archives medicines, bulk-imports medicine catalogues via Excel/CSV.
- **Cryptographic Security**: Passwords hashed using **Argon2id** (`@node-rs/argon2`).
- **Two-Factor Authentication (MFA)**: Optional TOTP multi-factor authentication (`otplib`) with AES-256-GCM encrypted secret storage.
- **Session Protection**: NextAuth v5 JWT session cookies with strict SameSite and Secure flags.
- **Rate Limiting**: Brute-force protection on staff login endpoints and request submission APIs.
- **Audit Logging**: Immutable audit logs capturing every critical staff mutation (imports, catalogue updates, quotation status changes) with actor IDs and IP hashes.

---

## Key Features (Version 1 - MVP)

### Public Client Portal (No Login Required)
- **Interactive Medicine Catalogue**: Search across product names, generic names, dosage forms, strengths, and manufacturers.
- **Category & Form Filtering**: Fast filtering by therapeutic class, dosage forms (Tablets, Capsules, Injections, Liquids), and prescription classification.
- **Medicine Detail Views**: Transparent specifications including pack sizes, compositions, regulatory warnings, and current verified INR pricing.
- **Request a Quote Flow (`/request-quote`)**: Multi-item picker with quantity counters, GSTIN validation, commercial notes, and instant reference receipt generation.
- **Corporate & Compliance Pages**: About, Contact, Privacy Notice, and Terms & Conditions.

### Staff Operations Workspace (`/admin/*`)
- **Executive Operations Dashboard**: High-level telemetry displaying published medicines count, open quote requests, draft quotations, and active staff.
- **Medicine Management**: Full CRUD operations for medicines, INR pricing tiers, and category associations.
- **Bulk Excel/CSV Import (`/api/admin/imports`)**: Upload existing medicine data sheets with two-stage validation (parse preview, row-by-row validation against schema, error reports, and atomic transactional commit).
- **Quote Request Review**: Inbound inquiries queue with quick contact actions, customer matching, and conversion into formal quotations.
- **Quotation Builder**: Line-item pricing, automated subtotal calculation, discount adjustments, and GST computation.
- **Customer CRM**: Centralized directory of commercial accounts, verified GSTINs, and delivery locations.
- **Staff Administration**: Manage staff accounts, assign roles, and revoke access.
- **Organization Settings**: Configure legal business details, GSTIN, official signatory, default terms, and quotation validity windows.
- **Audit Logs**: Comprehensive timeline of administrative operations for full compliance.

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) | Hybrid SSR/SSG, Server Components, Turbopack, Server Actions |
| **Frontend** | [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/) | Modern UI components, responsive layout, glassmorphism design |
| **Icons & UI** | [Lucide React](https://lucide.dev/), `shadcn/ui` patterns | Clean, accessible B2B iconography and component system |
| **Database** | [PostgreSQL](https://www.postgresql.org/) | Relational database with strict checks, foreign keys, and indexes |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) | Type-safe schema definition, SQL migrations, and query builder |
| **Authentication** | [NextAuth.js v5 (beta)](https://authjs.dev/) | Staff credentials provider, JWT sessions, route authorization |
| **Password Hashing** | [@node-rs/argon2](https://github.com/napi-rs/node-rs) | Memory-hard password hashing for staff credentials |
| **Two-Factor Auth** | [otplib](https://github.com/yeojinj/otplib) | Time-based One-Time Password (TOTP) validation |
| **Data Validation** | [Zod](https://zod.dev/) | End-to-end schema validation across Server Actions and APIs |
| **Spreadsheet Parsing**| [SheetJS (xlsx)](https://sheetjs.com/) | Bulk ingestion and validation of Excel/CSV medicine catalogs |
| **Rate Limiting** | [@upstash/ratelimit](https://upstash.com/) | Distributed sliding-window rate limiting (Redis-backed) |

---

## Project Structure

```text
├── drizzle/                     # Drizzle SQL migration files and metadata snapshots
├── public/                      # Static assets, logos, and public media
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (public pages)       # /, /catalogue, /request-quote, /about, /contact, /legal
│   │   ├── admin/
│   │   │   ├── (dashboard)/     # Protected staff routes: catalogue, quotations, staff, etc.
│   │   │   └── login/           # Staff login screen
│   │   └── api/                 # API handlers (NextAuth, bulk imports)
│   ├── components/              # Reusable React components (SiteHeader, SiteFooter, UI)
│   ├── db/
│   │   ├── index.ts             # PostgreSQL client and Drizzle instance
│   │   ├── schema.ts            # Drizzle relational schema definitions
│   │   └── seed.ts              # Initial database seeder (admin users, settings, medicines)
│   ├── features/                # Domain-specific business logic & Server Actions
│   │   ├── admin/               # Staff operations, dashboard metrics
│   │   ├── catalogue/           # Public catalogue queries & medicine actions
│   │   ├── imports/             # Excel/CSV batch validation & ingestion
│   │   ├── quotations/          # Quotation state management & pricing
│   │   ├── quote-requests/      # Public quote request ingestion & processing
│   │   └── settings/            # Organization configuration actions
│   └── lib/                     # Utilities (authorization, rate limiting, money, crypto)
├── drizzle.config.ts            # Drizzle Kit CLI configuration
├── next.config.ts               # Next.js compiler and runtime configuration
├── package.json                 # Project dependencies and script runner
└── tsconfig.json                # TypeScript strict configuration
```

---

## Getting Started

### Prerequisites
- **Node.js**: `v22.0.0` or higher
- **Package Manager**: `npm` (v10 or v11)
- **PostgreSQL**: PostgreSQL 15+ database running locally or hosted (e.g. Neon, Supabase, RDS)

### Environment Configuration

Create a `.env` file in the project root based on `.env.example`:

```bash
cp .env.example .env
```

Ensure the following variables are configured:

```ini
# PostgreSQL connection string
DATABASE_URL=postgresql://postgres:password@localhost:5432/ms_pharma_impex

# NextAuth configuration
AUTH_SECRET=generate-a-minimum-32-character-random-secret
AUTH_URL=http://localhost:3000

# 32-byte Base64-encoded key for AES-256 MFA secret encryption
MFA_ENCRYPTION_KEY=replace-with-a-base64-encoded-32-byte-key

# Optional: Upstash Redis (for distributed rate limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Optional: Object Storage (S3 / Cloudflare R2)
S3_BUCKET=
S3_REGION=
S3_ENDPOINT=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
```

### Database Setup & Migrations

Push the Drizzle schema to your PostgreSQL database:

```bash
npm run db:migrate
```

### Seeding Initial Data

Seed default business settings, administrative accounts, medicine categories, and verified medicines:

```bash
npm run db:seed
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the public portal, or navigate to [http://localhost:3000/admin/login](http://localhost:3000/admin/login) for the staff portal.

### Default Staff Accounts

When seeded, the following accounts are initialized for testing:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Super Admin** | `admin@mspharmaimpex.com` | `Admin@123456` | Full system control, settings, staff |
| **Sales Executive**| `sales@mspharmaimpex.com` | `Sales@123456` | Quotations, quote requests, customers |

*(Change these passwords immediately in any non-development deployment!)*

---

## Version 2 Implementation Plan (Real-Time & Automation)

### Objectives & Architecture
**Target Timeline**: 2–3 Weeks  
**Primary Objective**: Evolve the V1 foundation into an automated, event-driven commercial engine with real-time staff alerts, automated PDF quotation delivery, background job processing, and secure customer status tracking.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        VERSION 2 SYSTEM ARCHITECTURE                   │
└────────────────────────────────────────────────────────────────────────┘

  [Public Guest Client]                     [Admin / Sales Staff]
           │                                          │
           │ (1) Submits Quote Request                │ (Live WebSocket Alert)
           ▼                                          ▼
   [ Next.js API / Action ] ──(Publish Event)──> [ Redis PubSub ]
           │                                          │
           │ (Enqueue Task)                           ▼
           ▼                                   [ Socket.IO / SSE ]
   [ BullMQ Job Queue ]                               │
      │           │                                   ▼
      │           │                            [ Admin Dashboard ]
      │           │
      ▼           ▼
  [ Worker: PDF Generator ]                 [ Worker: Email Dispatcher ]
      │                                               │
      ├─ Render PDF (@react-pdf / PDFKit)             ├─ Send Resend / SMTP Email
      ├─ Calculate SHA-256 Checksum                   ├─ Attach Generated PDF
      ├─ Store in Cloud Storage (S3 / R2)             └─ Notify Client with
      └─ Update Quotation Document Record                Secure Tracking Link
```

### Core Components & Implementation Modules

#### 1. Real-Time Admin Alerts (Redis + WebSockets / Socket.IO)
- **Push Notifications**: When a client submits a quote request via `/request-quote`, a Redis PubSub event triggers a real-time WebSocket/SSE broadcast to all active staff sessions.
- **Admin Toast & Audio Alert**: Instant visual badge updates on "Open Requests" without requiring manual page refreshes.
- **Multi-Tab Synchronization**: Real-time optimistic status updates when another sales representative begins reviewing or converts a request.

#### 2. Background Job Queue (BullMQ + Redis)
- **Decoupled Architecture**: Offload long-running operations (PDF rendering, batch emails, status synchronization) from HTTP requests to ensure lightning-fast UI responsiveness.
- **Queues**:
  - `quote-notifications`: Immediate internal team alerts.
  - `pdf-rendering`: Headless compilation of high-resolution quotation PDFs.
  - `email-delivery`: Reliable transactional mailings with automated retry & backoff.
  - `quote-expiry-cron`: Nightly cron worker to transition quotations past `validUntil` to `expired`.

#### 3. Automated Commercial PDF Generation & S3 Storage
- **Branded Quotation PDF Engine**: Use `@react-pdf/renderer` to generate pixel-perfect, GST-compliant formal quotations including:
  - Official MS Pharma Impex header, registered address, GSTIN, and corporate CIN.
  - Snapshot of client business details and shipping address.
  - Itemized table: SKU, Formulation, Batch Pack, Unit Price, Quantity, Line Total, and applicable GST rate (0%, 5%, 12%, 18%).
  - Financial breakdown: Taxable Subtotal, CGST, SGST, IGST, Discount, and Grand Total in INR.
  - Standard terms & conditions snapshot and authorized digital signature watermark.
- **Integrity & Storage**:
  - Each PDF is fingerprinted with a **SHA-256 checksum** stored in the `documents` table.
  - Exported directly to **Cloudflare R2 / AWS S3** with time-expiring pre-signed download URLs.

#### 4. Transactional Email Pipeline (Resend / SMTP)
- **Customer Notifications**:
  - *Receipt Acknowledgment*: Immediate email sent upon submitting a quote request with reference ID and estimated turnaround time.
  - *Quotation Delivery*: Email containing summary totals, formal PDF attachment, and a direct link to view/accept the quote.
- **Staff Notifications**:
  - *New Lead Alert*: Instant email to the commercial desk with client details and requested product list.
  - *Follow-Up Reminder*: Automated alerts for quotes nearing expiration without client response.

#### 5. Guest Quotation Status Tracking (No Account Required)
- **Token-Guarded Status Page**:
  - Route: `/quote-status/[reference]?token=[secure_hash]`
  - Clients can inspect the current status of their quote request (`submitted`, `under_review`, `quoted`, `closed`) and download official PDFs.
  - Eliminates the need for customer passwords or complex registration while maintaining confidentiality and data privacy.

### Data Model Extensions for V2
To support Version 2 capabilities, minor schema additions will be introduced:
- `quotations`: Add `pdf_document_id` foreign key, `client_access_token` (hashed), and `accepted_at` / `rejected_at` timestamps.
- `documents`: Enhance with `s3_bucket`, `s3_key`, `file_size_bytes`, and `download_count`.
- `notifications`: Add `channel` (`in_app`, `email`, `push`), `delivery_status` (`queued`, `sent`, `failed`), and `error_message`.

---

## Phased Development Roadmap (V1 – V4)

### Phase 1: Core Foundation (MVP) [ACTIVE]
**Target**: Completed | **Focus**: Core Platform & Admin Operations
- Next.js 16 + React 19 + TypeScript + Tailwind CSS
- PostgreSQL database + Drizzle ORM schema & migrations
- Public medicine catalogue with search, composition, and dosage filters
- Guest B2B quotation request submission (no normal user login needed)
- Staff authentication (NextAuth v5 + Argon2 + TOTP MFA)
- Admin dashboard: Medicine CRUD, Excel/CSV bulk import, Quote management, Settings, Audit logs

### Phase 2: Real-time & Automation [PLANNED]
**Target**: 2–3 Weeks | **Focus**: Event-driven Architecture & Document Automation
- Redis + BullMQ asynchronous background job worker
- Real-time admin notifications (Socket.IO / WebSockets)
- Automated PDF quotation generation (@react-pdf/renderer)
- Object storage integration (AWS S3 / Cloudflare R2) with SHA-256 integrity
- Transactional email delivery via Resend / SMTP
- Guest quotation status tracking via secure verification tokens

### Phase 3: Inventory & Business Expansion
**Target**: 3–4 Weeks | **Focus**: End-to-End Supply Chain Management
- Inventory tracking & warehouse batch management
- Expiry date monitoring and early warning alerts
- Supplier directories & purchase order (PO) generation
- Customer relationship management (CRM) & transaction history
- Advanced business analytics & revenue reporting with Recharts
- Low-stock threshold automated re-ordering notifications

### Phase 4: AI & Advanced Capabilities
**Target**: 4–6 Weeks | **Focus**: Intelligence, Automation & Omnichannel
- Natural language medicine & composition search powered by OpenAI
- AI-assisted quotation margin optimization & demand forecasting
- Automated WhatsApp commercial notifications (Twilio / Meta Business API)
- Intelligent quotation summary & RFP extraction assistant
- Predictive re-order triggers based on customer purchasing cycles

---

## License

Confidential and proprietary to **MS Pharma Impex Private Limited**. All rights reserved.

