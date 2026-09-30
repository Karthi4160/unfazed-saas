# Unfazed

**A production-ready, multi-tenant SaaS platform for therapy practice management.**

Built with the MERN stack, integrated with Razorpay payments, real-time chat via Socket.io, PDF invoicing, and a fully configurable subscription entitlement system.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit-success)](https://unfazed-frontend-ten.vercel.app)
[![Backend API](https://img.shields.io/badge/API-Live-blue)](https://unfazed-backend-7re3.onrender.com/api/health)
[![Admin Panel](https://img.shields.io/badge/Admin-Panel-purple)](https://unfazed-frontend-ten.vercel.app/admin)

---

## What is Unfazed?

Unfazed is a complete practice management and client engagement platform designed for therapists, counselors, psychologists, and mental health clinics.

It replaces the fragmented tools most practices use — spreadsheets for clients, WhatsApp for chat, paper for notes, multiple apps for payments — with one integrated SaaS platform.

### Two user experiences, one platform

- **Therapist Dashboard** — Practice management hub: calendar, clients, notes, payments, analytics
- **Client Portal** — Branded page: intake, booking, payment, chat, shared notes

Plus a **Super Admin panel** for platform operators to manage all therapists, track revenue, and moderate accounts.

---

## Live Deployment

| Service | URL |
|---------|-----|
| Frontend | https://unfazed-frontend-ten.vercel.app |
| Backend API | https://unfazed-backend-7re3.onrender.com |
| Admin Panel | https://unfazed-frontend-ten.vercel.app/admin |
| Public Profile Demo | https://unfazed-frontend-ten.vercel.app/karthick |

**Demo Credentials:**

| Role | Email | Password |
|------|-------|----------|
| Therapist | karthi14700@gmail.com | *(contact owner)* |
| Client | john@client.com | client123 |

**Admin access:** Visit `/admin` and use the `ADMIN_SECRET` from your `.env`.

---

## Core Features

### Authentication & Branded Profiles
- JWT-based auth with role separation (Therapist / Client / Admin)
- Slug-based public profile pages (`yourbrand.com/dr-jane`)
- Open Graph meta tags for social sharing
- White-label configuration — rebrand the entire platform from a single config file

### Smart Scheduling
- Timezone-aware weekly availability templates
- Configurable buffer times between sessions
- Support for 30 / 45 / 60 / 90 minute sessions
- Instant booking with double-booking prevention
- Waitlist functionality when slots fill up

### Client Relationship Management
- Full client list with search, filter, and sorting
- Complete client profile aggregation (sessions + payments + notes)
- Digital intake forms (demographics, presenting concern, medical history)
- Digital consent capture with timestamped audit trail

### Payments & Invoicing
- Razorpay integration (test and live modes)
- Session package sales (3 / 6 / 12 sessions)
- Auto-generated GST-style PDF invoices
- Webhook signature verification for payment confirmations
- Full refund and failure handling
- Platform fee calculation (configurable percentage)

### Clinical Documentation
- Private vs Shared note separation enforced at the API layer
- Private notes are guaranteed to never leak into client-facing routes
- Rich-text editor with structured formats
- SOAP and DAP templates
- Full-text search across session history

### Real-Time Communication
- Socket.io-powered chat between therapist and client
- Message delivery and read receipts
- Typing indicators
- Event-driven notification service (booking confirmed, payment received, session reminders)
- Email notifications via Nodemailer
- WhatsApp integration layer prepared

### Analytics Dashboard
- Revenue trends across customizable time windows
- Session distribution by type
- Active client growth tracking
- No-show rate analysis
- Built entirely with MongoDB aggregation pipelines

### Subscription & Entitlement System

The platform's most differentiating feature:

- Config-driven tiers — Free / Basic / Professional / Enterprise
- Centralized `EntitlementService.canAccess(therapistId, featureKey)` — the single source of truth for feature access
- No hardcoded tier checks anywhere in the codebase
- Feature gating enforced at both API and UI layers
- Automatic usage tracking (client cap, session cap, storage)
- Upgrade prompt UI triggered when blocked actions are attempted

### Super Admin Panel
- Platform-wide metrics (therapists, clients, bookings, revenue, fees)
- Revenue trend visualization
- Therapist management with enable/disable controls
- Recent signups feed
- Search across all therapists on the platform

---

## Tech Stack

**Backend**
- Node.js 18+ / Express.js
- MongoDB Atlas with Mongoose ODM
- JWT authentication
- Socket.io for real-time
- Razorpay payment gateway
- PDFKit for invoice generation
- Nodemailer for transactional emails

**Frontend**
- React 18 with Vite
- Tailwind CSS v4
- React Router v6
- Axios for API calls
- Socket.io client
- Recharts for analytics

**Infrastructure**
- Vercel (frontend hosting)
- Render (backend hosting)
- MongoDB Atlas (managed database)

---

## Architecture Principles

This project is engineered around four non-negotiable architectural principles:

**1. Centralized entitlement checks**
No route, controller, or component checks subscription tier strings directly. Every gated action flows through `EntitlementService.canAccess()`. This means changing tier rules requires editing one config file, not searching the codebase.

**2. Data privacy enforced at the API layer**
Private clinical notes are filtered server-side before any response. Even if the frontend is compromised or misbehaves, private data cannot leak to client routes.

**3. Everything is configuration**
All monetary values, tier caps, feature flags, and pricing live in the `SubscriptionTierConfig` MongoDB collection. Nothing is hardcoded.

**4. Third-party services are isolated**
Razorpay, email, PDF generation, and sockets each live behind a dedicated service module. Any of them can be stubbed, mocked, or swapped without touching business logic.

---

## Project Structure

```
unfazed-saas/
│
├── unfazed-backend/
│   ├── src/
│   │   ├── models/          11 Mongoose schemas
│   │   ├── controllers/     11 REST controllers
│   │   ├── routes/          11 route groups
│   │   ├── middleware/      auth, entitlement, admin, error handling
│   │   ├── services/        entitlement, payment, notification, pdf, socket
│   │   └── utils/
│   ├── uploads/invoices/    Generated PDF invoices
│   ├── server.js            Entry point
│   ├── seed.js              Subscription tier seeder
│   ├── .env.example
│   └── package.json
│
└── unfazed-frontend/
    ├── src/
    │   ├── components/      Reusable UI (Sidebar, PageLayout, Modal)
    │   ├── pages/
    │   │   ├── auth/        Login / Register (therapist + client)
    │   │   ├── public/      Landing page + public therapist profile
    │   │   ├── admin/       Super admin dashboard
    │   │   ├── therapist/   10 pages
    │   │   └── client/      7 pages
    │   ├── context/         Auth, Socket, Theme providers
    │   ├── hooks/           Custom React hooks
    │   ├── config/          brand.js — white-label configuration
    │   └── utils/           API client, formatters, constants
    ├── vite.config.js
    ├── vercel.json          SPA routing config
    ├── .env.example
    └── package.json
```

---

## Quick Start

### Prerequisites
- Node.js v18 or higher
- MongoDB Atlas account (free tier works)
- Razorpay account (test mode, free)

### Backend Setup

```bash
cd unfazed-backend
npm install
```

Create a `.env` file (see `.env.example` for the full template):

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/unfazed
JWT_SECRET=your_random_jwt_secret
JWT_EXPIRE=7d

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

ADMIN_SECRET=your_admin_secret

CLIENT_URL=http://localhost:5173
```

Seed subscription tiers and start:

```bash
npm run seed
npm run dev
```

### Frontend Setup

```bash
cd unfazed-frontend
npm install
```

Create `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
```

Start:

```bash
npm run dev
```

Open http://localhost:5173

---

## Configuration

### White-Label Branding

Rebrand the entire platform by editing a single file:

`unfazed-frontend/src/config/brand.js`

```javascript
export const brand = {
  name: 'Your Brand',
  tagline: 'Your tagline',
  logoLetter: 'Y',
  colors: { primary: 'emerald' },
  supportEmail: 'support@yourbrand.com',
};
```

Every page, email, and invoice pulls from this config.

### Subscription Tiers

Tiers, pricing, feature flags, and caps live in the `SubscriptionTierConfig` MongoDB collection. Edit them through the seed file or directly via MongoDB.

Default tiers included:

| Tier | Price | Client Cap | Session Cap | Key Features |
|------|-------|-----------|-------------|--------------|
| Free | ₹0/mo | 5 | 10/mo | Basic scheduling, chat |
| Basic | ₹999/mo | 20 | 50/mo | Packages, SOAP notes |
| Professional | ₹2,999/mo | 50 | 100/mo | Advanced analytics, custom branding, API access |
| Enterprise | ₹9,999/mo | 1000 | 10000/mo | Everything + priority support, data export |

**Platform fee:** 5% per transaction (configurable).

---

## API Overview

### Authentication
- `POST /api/auth/register` — Therapist signup
- `POST /api/auth/login` — Therapist login
- `POST /api/auth/client/register` — Client signup
- `POST /api/auth/client/login` — Client login
- `GET  /api/auth/profile/:slug` — Public therapist profile

### Therapist Operations
- `GET  /api/clients` — List all clients
- `POST /api/clients` — Create a client
- `GET  /api/clients/:id/profile` — Aggregated client data
- `GET  /api/availability` — Weekly availability template
- `PUT  /api/availability/weekly-template` — Update availability
- `POST /api/notes` — Create session note
- `GET  /api/analytics/stats` — Dashboard statistics
- `GET  /api/analytics/revenue` — Revenue trend

### Client Operations
- `GET  /api/bookings/available-slots` — Available time slots
- `POST /api/bookings/book` — Book a session
- `GET  /api/bookings/client/:id` — Client's bookings
- `GET  /api/notes/client/:id` — Shared notes only
- `GET  /api/chat/client/conversation` — Chat history

### Payments
- `POST /api/payments/verify` — Verify Razorpay payment
- `POST /api/payments/webhook` — Razorpay webhook
- `GET  /api/payments/invoice/:id` — Download invoice PDF

### Subscriptions
- `GET  /api/subscriptions/tiers` — Available tiers
- `GET  /api/subscriptions/check/:feature` — Check feature access
- `GET  /api/subscriptions/usage` — Current usage

### Admin
- `POST /api/admin/login` — Admin authentication
- `GET  /api/admin/stats` — Platform-wide metrics
- `GET  /api/admin/therapists` — List all therapists
- `GET  /api/admin/revenue-trend` — Platform revenue chart data
- `GET  /api/admin/recent-activity` — Latest signups and payments
- `PATCH /api/admin/therapists/:id/toggle` — Enable/disable therapist

---

## Security Highlights

- Passwords hashed with bcrypt (10 rounds)
- JWT sessions with role separation
- Private clinical notes enforced at API layer
- CORS restricted to whitelisted origins
- Razorpay webhook signature verification on every callback
- Entitlement checks centralized in one service
- Admin panel protected by separate secret + JWT role
- Environment variables never committed to version control

---

## Deployment

The platform is fully deployed on free-tier infrastructure:

- Frontend → Vercel (auto-deploys from `main` branch)
- Backend → Render (auto-deploys from `main` branch)
- Database → MongoDB Atlas (M0 free cluster)

Deploy your own instance by connecting the repository to Vercel and Render.

---

## Business Model

Unfazed is built as a revenue-generating SaaS:

- Subscription revenue — 4 tiers from free to ₹9,999/month
- Transaction fees — 5% platform cut on every paid session
- Package sales — Bulk session purchases with extended validity
- Enterprise contracts — Custom pricing for clinics

Target market: Solo therapists, small clinics, and mental health organizations in India and emerging markets.

---

## License

This is a commercial product. All rights reserved.

For licensing inquiries, please contact the repository owner.

---

## Contact

For questions, licensing, or acquisition inquiries, please open an issue or contact the repository owner directly.