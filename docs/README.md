# Wishlist App — Technical Documentation

> **For Claude/AI assistants**: Start here. Read these docs to understand the full technical context of the project.

## Quick Reference

| Doc | Purpose |
|-----|---------|
| [architecture.md](./architecture.md) | System architecture, diagrams, service layout |
| [database-schema.sql](./database-schema.sql) | Complete PostgreSQL schema |
| [api-reference.md](./api-reference.md) | All REST endpoints with request/response formats |
| [project-structure.md](./project-structure.md) | File/folder structure for API, Web, Mobile |
| [tech-decisions.md](./tech-decisions.md) | Tech stack choices and rationale |
| [features.md](./features.md) | Complete feature list with implementation status |

## Project Overview

- **Product context**: See `/claude.md` in project root
- **Type**: Wishlist & gift coordination platform
- **Platforms**: Web (Next.js) + Mobile (React Native) + API (Express)

## Tech Stack Summary

```
Frontend (Web):   Next.js 14+ → Vercel
Frontend (Mobile): React Native (Expo) → App Store / Play Store
Backend:          Node.js + Express → Railway
Database:         PostgreSQL → Railway
Auth:             Clerk
```

## Key Concepts

### Surprise-Preserving Logic
- Givers can reserve/purchase items
- **Owner NEVER sees reservation status**
- Other givers CAN see reservation status
- Enforced at API layer, not just UI

### Magic Links
- Participants can join exchanges without an account
- Unique token grants access to their exchange view
- Optional account creation for full features

### Sharing Model
- Share wishlists with groups (many people)
- Share wishlists with individuals (1-on-1)
- Public shareable links (no auth required to view)

## Getting Started (For Development)

```bash
# Clone repos
git clone <api-repo>
git clone <web-repo>

# API setup
cd wishlist-api
cp .env.example .env
npm install
npm run db:migrate
npm run dev

# Web setup
cd wishlist-web
cp .env.local.example .env.local
npm install
npm run dev
```

## Critical Implementation Rules

1. **Never expose reservations to list owners** — enforced server-side
2. **Never expose full exchange assignments** — only giver sees their receiver
3. **Magic Links must be cryptographically secure** — use nanoid or UUID
4. **URL extraction will fail** — always allow manual override
5. **Validate exclusions before drawing** — algorithm can fail if over-constrained
