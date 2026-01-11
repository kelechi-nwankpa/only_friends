# System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Next.js   │  │    iOS      │  │        Android          │  │
│  │    Web      │  │    App      │  │          App            │  │
│  │  (Vercel)   │  │             │  │                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                   └───────────────────────────────┘              │
│                        React Native (Expo)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS / REST API
                              │ JWT (Clerk) or Magic Link Token
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API (Railway)                         │
│                      Node.js + Express                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                                                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │   │
│  │  │   Routes    │  │ Controllers │  │    Services     │   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘   │   │
│  │         │                │                  │             │   │
│  │         ▼                ▼                  ▼             │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │   │
│  │  │ Middleware  │  │ Validators  │  │  Repositories   │   │   │
│  │  │ (Auth/Rate) │  │   (Zod)     │  │   (Prisma)      │   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘   │   │
│  │                                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Background Jobs                        │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐  │   │
│  │  │   Price    │  │ Incognito  │  │    Notification    │  │   │
│  │  │  Tracker   │  │  Cleanup   │  │      Sender        │  │   │
│  │  └────────────┘  └────────────┘  └────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (Railway)                            │
│                      PostgreSQL                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  users │ wishlists │ items │ reservations │ groups       │   │
│  │  exchanges │ assignments │ magic_links │ notifications   │   │
│  │  price_history │ gift_history │ chat_messages            │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                              │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│  │   Clerk    │ │  OpenAI    │ │   Resend   │ │   Twilio   │   │
│  │   (Auth)   │ │ (AI Gift)  │ │  (Email)   │ │   (SMS)    │   │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### Web Frontend (Next.js)

**Deployment**: Vercel
**URL**: `https://app.yourapp.com`

Responsibilities:
- Server-side rendering for shareable links (SEO, social previews)
- Client-side interactivity for dashboard
- Clerk authentication UI
- Micro-interactions (Framer Motion)

Key routes:
- `/` — Landing page
- `/dashboard` — User dashboard (auth required)
- `/lists/[id]` — Wishlist view
- `/groups/[id]` — Group view
- `/exchanges/[id]` — Exchange view
- `/list/[slug]` — Public shared list (no auth)
- `/magic/[token]` — Magic link landing

### Mobile Apps (React Native)

**Framework**: Expo (managed workflow)
**Deployment**: App Store + Play Store

Shares:
- Same API as web
- Same Clerk auth (via @clerk/clerk-expo)
- TypeScript types with web

Mobile-specific:
- Push notifications (FCM + APNs)
- Deep linking for magic links
- Native share sheet for adding items
- Offline caching with sync queue
- Haptic feedback

### Backend API (Express)

**Deployment**: Railway
**URL**: `https://api.yourapp.com`

Layers:
1. **Routes** — Define endpoints, wire up middleware
2. **Controllers** — Handle HTTP request/response
3. **Services** — Business logic
4. **Repositories** — Data access (Prisma)
5. **Validators** — Request validation (Zod)

Key middleware:
- `auth.ts` — Verify Clerk JWT or Magic Link token
- `rateLimiter.ts` — Prevent abuse
- `errorHandler.ts` — Consistent error responses

### Database (PostgreSQL)

**Deployment**: Railway (managed)

Key tables:
- `users` — User accounts (synced from Clerk)
- `wishlists` — User wishlists
- `wishlist_items` — Items in wishlists
- `reservations` — Gift reservations (hidden from owner)
- `groups` — User groups
- `group_members` — Group membership
- `exchanges` — Secret Santa exchanges
- `exchange_participants` — Exchange participants
- `exchange_assignments` — Who gives to whom
- `magic_link_tokens` — Frictionless participation tokens

### External Services

| Service | Purpose | Used For |
|---------|---------|----------|
| **Clerk** | Authentication | User signup/login, JWT, Magic Links |
| **OpenAI** | AI | Gift suggestions (GPT-4o-mini) |
| **Resend** | Email | Transactional emails, Magic Link delivery |
| **Twilio** | SMS | Magic Link delivery via SMS |

## Data Flow Examples

### Creating a Wishlist Item

```
1. User submits URL in frontend
2. Frontend calls POST /v1/wishlists/:id/items
3. Backend validates JWT via Clerk
4. Backend calls URL extractor service
5. Service fetches URL, extracts metadata
6. Repository creates item in PostgreSQL
7. Response returned to frontend
8. Frontend updates UI optimistically
```

### Reserving a Gift

```
1. Giver clicks "Reserve" on item
2. Frontend calls POST /v1/items/:id/reserve
3. Backend validates user is NOT the owner
4. Backend checks item not already reserved
5. Repository creates reservation
6. Response returns (with reservation data)
7. Other givers see "Reserved by [name]"
8. Owner sees nothing different
```

### Secret Santa Draw

```
1. Organizer clicks "Draw Names"
2. Frontend calls POST /v1/exchanges/:id/draw
3. Backend validates all participants joined
4. Backend validates exclusions are satisfiable
5. Service runs derangement algorithm with constraints
6. Repository creates assignment records
7. Backend queues notifications
8. Each participant notified of their draw
```

## Security Architecture

### Authentication Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Client  │────▶│  Clerk  │────▶│   API   │────▶│   DB    │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
     │               │               │
     │  1. Login     │               │
     │──────────────▶│               │
     │               │               │
     │  2. JWT       │               │
     │◀──────────────│               │
     │               │               │
     │  3. API call with JWT         │
     │──────────────────────────────▶│
     │               │               │
     │               │  4. Verify    │
     │               │◀──────────────│
     │               │               │
     │  5. Response                  │
     │◀──────────────────────────────│
```

### Magic Link Flow

```
1. Organizer creates exchange, adds participant (email/phone)
2. Backend generates secure token, stores in magic_link_tokens
3. Backend sends token via email/SMS
4. Participant clicks link → /magic/[token]
5. Frontend calls GET /v1/magic/:token
6. Backend validates token, returns exchange context
7. Participant can interact without full account
8. Optional: participant creates account, token linked to user
```

### Critical Security Rules

1. **Reservation privacy**: API MUST filter out reservation data when requester is wishlist owner
2. **Assignment privacy**: API MUST only return a user's own assignment, never others'
3. **Magic Link expiry**: Tokens should expire (e.g., 30 days) and be single-use or limited
4. **Rate limiting**: Protect sensitive endpoints (login, magic link validation)
5. **Input validation**: All inputs validated via Zod before processing
