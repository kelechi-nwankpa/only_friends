# Technical Decisions & Rationale

## Overview

This document captures key technical decisions, the alternatives considered, and the reasoning behind each choice.

---

## Tech Stack Summary

| Layer | Choice | Status |
|-------|--------|--------|
| Web Frontend | Next.js 14+ | Confirmed |
| Mobile Apps | React Native (Expo) | Confirmed |
| Backend API | Node.js + Express | Confirmed |
| Database | PostgreSQL | Confirmed |
| Auth | Clerk | Confirmed |
| Web Hosting | Vercel | Confirmed |
| Backend Hosting | Railway | Confirmed |

---

## Decision Records

### 1. Frontend Framework: Next.js

**Decision**: Use Next.js 14+ with App Router

**Alternatives Considered**:
| Option | Pros | Cons |
|--------|------|------|
| Next.js | SSR for shareable links, huge ecosystem, Vercel integration | Heavier than needed for simple lists |
| SvelteKit | Lighter, faster, less boilerplate | Smaller ecosystem, harder to hire |
| Remix | Great data loading, nested routes | Smaller community |
| Plain React SPA | Simple | No SSR = bad for shareable links |

**Rationale**:
- Shareable wishlist links MUST work without JavaScript (SEO, social previews)
- SSR/SSG is non-negotiable for `/list/[slug]` public pages
- Vercel deployment is seamless
- Large ecosystem for future growth

---

### 2. Backend Framework: Express

**Decision**: Use Express with TypeScript

**Alternatives Considered**:
| Option | Pros | Cons |
|--------|------|------|
| Express | Mature, flexible, huge ecosystem | Requires more setup than batteries-included options |
| Fastify | Faster, better TypeScript support | Smaller ecosystem |
| NestJS | Enterprise-grade, structured | Over-engineered for this scale |
| Next.js API Routes | Single codebase | Couples frontend/backend, harder to scale |
| tRPC | Type-safe API | Requires Next.js or similar, learning curve |

**Rationale**:
- Decoupled backend allows independent scaling
- Express is well-understood, easy to hire for
- Flexible enough to adapt as needs evolve
- Can serve both web and mobile from same API

---

### 3. Database: PostgreSQL

**Decision**: PostgreSQL via Railway

**Alternatives Considered**:
| Option | Pros | Cons |
|--------|------|------|
| PostgreSQL | Relational, ACID, mature, flexible | Requires schema design |
| MongoDB | Flexible schema, easy start | Poor fit for relational data |
| MySQL | Mature | PostgreSQL has better features |
| Firebase/Firestore | Real-time, serverless | NoSQL awkward for relational data, vendor lock-in |
| Supabase | Managed Postgres + extras | More lock-in than plain Postgres |

**Rationale**:
- Data model is inherently relational (users ↔ wishlists ↔ items, users ↔ groups)
- Strong consistency required for reservations (no double-reserving)
- PostgreSQL is the most capable open-source relational database
- Railway provides managed Postgres with easy scaling

---

### 4. ORM: Prisma

**Decision**: Use Prisma as the ORM

**Alternatives Considered**:
| Option | Pros | Cons |
|--------|------|------|
| Prisma | Great DX, type-safe, migrations | Query builder less flexible |
| Drizzle | Lighter, SQL-like | Newer, less mature |
| TypeORM | Feature-rich | Complex, decorator-heavy |
| Knex | Flexible query builder | No type generation |
| Raw SQL | Full control | No type safety, more boilerplate |

**Rationale**:
- Prisma provides excellent TypeScript integration
- Schema-first approach catches errors early
- Migration system is simple and reliable
- Good balance of abstraction and control

---

### 5. Authentication: Clerk

**Decision**: Use Clerk for authentication

**Alternatives Considered**:
| Option | Pros | Cons |
|--------|------|------|
| Clerk | Great DX, polished UI, social logins, SDKs for web+mobile | Cost at scale |
| Auth0 | Enterprise-grade | Expensive, complex |
| NextAuth.js | Free, flexible | More setup, you own complexity |
| Supabase Auth | Integrated with Supabase | Ties you to Supabase |
| Firebase Auth | Free tier | Google lock-in |
| Custom | Full control | Security risk, massive effort |

**Rationale**:
- Clerk handles authentication complexity (sessions, tokens, social login)
- Has SDKs for Next.js AND React Native (critical for mobile)
- Pre-built UI components speed up development
- Webhook support for user sync
- Reasonable pricing for early stage

---

### 6. Mobile Framework: React Native (Expo)

**Decision**: React Native with Expo managed workflow

**Alternatives Considered**:
| Option | Pros | Cons |
|--------|------|------|
| React Native (Expo) | Share skills with web React, fast iteration | Not fully native |
| React Native (bare) | More control | More setup, ejection pain |
| Flutter | Fast, beautiful UI | Dart language, different paradigm |
| Native (Swift/Kotlin) | Best performance | Two codebases, 2x effort |
| PWA | Single codebase | Limited native features |

**Rationale**:
- Team already knows React from Next.js
- Expo simplifies builds, OTA updates, push notifications
- Clerk has official Expo SDK
- Can eject to bare workflow if needed later
- Single codebase for iOS and Android

---

### 7. Deployment: Vercel + Railway

**Decision**: Vercel for web, Railway for backend + database

**Alternatives Considered**:
| Platform | Use Case | Pros | Cons |
|----------|----------|------|------|
| Vercel | Web frontend | Perfect Next.js support, easy | Limited backend support |
| Railway | Backend + DB | Simple, good DX, managed Postgres | Newer than alternatives |
| Render | All-in-one | Good for backend | Slower deployments |
| AWS | Everything | Unlimited scale | Complex, expensive |
| Fly.io | Backend | Edge deployment | More operational overhead |

**Rationale**:
- Vercel is the natural home for Next.js
- Railway provides simple managed Postgres and container hosting
- Both have generous free tiers for development
- Both scale well for production

---

### 8. Email Service: Resend

**Decision**: Use Resend for transactional emails

**Alternatives Considered**:
| Option | Pros | Cons |
|--------|------|------|
| Resend | Modern API, great DX, React Email | Newer |
| SendGrid | Mature, reliable | Complex API |
| Postmark | Excellent deliverability | Pricier |
| AWS SES | Cheap at scale | Complex setup |

**Rationale**:
- Simple, modern API
- React Email for templating (familiar JSX)
- Good deliverability
- Reasonable pricing

---

### 9. SMS Service: Twilio

**Decision**: Use Twilio for SMS (Magic Links)

**Alternatives Considered**:
| Option | Pros | Cons |
|--------|------|------|
| Twilio | Reliable, global reach | Can be expensive |
| AWS SNS | Cheaper | Complex setup |
| MessageBird | Good international | Less documentation |

**Rationale**:
- Industry standard, reliable
- Global phone number support
- Well-documented SDK
- Magic Links via SMS is a key feature

---

### 10. AI Integration: OpenAI

**Decision**: Use OpenAI (GPT-4o-mini) for gift suggestions

**Alternatives Considered**:
| Option | Pros | Cons |
|--------|------|------|
| OpenAI GPT-4o-mini | Cost-effective, good quality | API dependency |
| Claude | High quality | Different API |
| Local LLM | No API costs | Requires GPU, lower quality |
| No AI | Simpler | Missing key feature |

**Rationale**:
- GPT-4o-mini offers good quality at low cost
- Simple API integration
- Can swap models later if needed
- AI gift suggestions is a premium differentiator

---

## Architecture Decisions

### 11. Separate Backend vs. Next.js API Routes

**Decision**: Separate Express backend

**Rationale**:
- Backend serves both web AND mobile
- Independent scaling
- Clearer separation of concerns
- Easier to test API in isolation
- Can swap frontend without touching backend

---

### 12. Repository Pattern

**Decision**: Use repository pattern for data access

```
Controller → Service → Repository → Prisma → Database
```

**Rationale**:
- Separates business logic from data access
- Easier to test (mock repositories)
- Can swap data source without changing services
- Clean architecture principles

---

### 13. Zod for Validation

**Decision**: Use Zod for request validation

**Rationale**:
- TypeScript-first, infers types
- Composable schemas
- Good error messages
- Can share schemas between frontend and backend

---

### 14. Reservation Privacy Enforcement

**Decision**: Enforce at API layer, not UI

**Critical Rule**: Owner must NEVER see reservation status.

```typescript
// In reservation.service.ts
async getItemsWithReservations(wishlistId, requesterId) {
  const wishlist = await this.wishlistRepo.findById(wishlistId);
  const items = await this.itemRepo.findByWishlistId(wishlistId);

  const isOwner = wishlist.owner_id === requesterId;

  return items.map(item => ({
    ...item,
    // CRITICAL: Strip reservation data for owner
    reservation: isOwner ? undefined : item.reservation
  }));
}
```

**Rationale**:
- Never trust frontend to hide data
- API is the single source of truth
- Defense in depth

---

### 15. Magic Link Implementation

**Decision**: Custom tokens stored in database

**Alternatives**:
- Clerk's built-in magic links (limited customization)
- JWT tokens (stateless but can't revoke)

**Implementation**:
```typescript
// Generate
const token = nanoid(32); // Secure random
await db.magicLinkTokens.create({
  token,
  exchangeId,
  participantId,
  expiresAt: addDays(new Date(), 30)
});

// Validate
const record = await db.magicLinkTokens.findByToken(token);
if (!record || record.expiresAt < new Date()) {
  throw new InvalidTokenError();
}
```

**Rationale**:
- Full control over token lifecycle
- Can expire, revoke, track usage
- Database lookup is fast (indexed)
- Can link to user account later

---

### 16. Secret Santa Algorithm

**Decision**: Derangement algorithm with constraint validation

**Algorithm**:
1. Validate exclusions don't make assignment impossible
2. Shuffle participants
3. Generate valid derangement (no self-assignment)
4. Apply exclusion constraints
5. If impossible after N attempts, fail with clear error

**Rationale**:
- Must handle exclusions (spouses, etc.)
- Must detect impossible configurations early
- Random but deterministic when seeded

---

## Future Considerations

### Things to Revisit

| Topic | When | Notes |
|-------|------|-------|
| Monorepo | When starting mobile | May consolidate repos with Turborepo |
| Real-time | If polling becomes slow | WebSockets or SSE for reservations |
| CDN for images | At scale | Cloudflare or CloudFront for item images |
| Queue system | At scale | BullMQ for background jobs |
| Caching | At scale | Redis for hot data |

### Not Doing Now

| Feature | Reason |
|---------|--------|
| GraphQL | REST is simpler, good enough for this domain |
| Microservices | Monolith first, split if needed |
| Kubernetes | Railway handles orchestration |
| Multi-region | Not needed until significant scale |
