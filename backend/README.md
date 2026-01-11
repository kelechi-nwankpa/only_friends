# Wishlist API

Backend API for the Wishlist & Gift Coordination App.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: Clerk
- **Deployment**: Railway

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Clerk account (for auth)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your values
```

### Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Open Prisma Studio
npm run db:studio
```

### Development

```bash
# Start dev server with hot reload
npm run dev

# Server runs at http://localhost:3001
```

### Production Build

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 3001) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | Yes |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook secret | Production |
| `OPENAI_API_KEY` | OpenAI API key (for AI features) | No |
| `RESEND_API_KEY` | Resend API key (for emails) | No |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |

## API Endpoints

See `/docs/api-reference.md` for complete API documentation.

### Quick Reference

```
GET    /health                  # Health check
POST   /v1/auth/webhook         # Clerk webhook

# Wishlists
GET    /v1/wishlists            # List wishlists
POST   /v1/wishlists            # Create wishlist
GET    /v1/wishlists/:id        # Get wishlist
PATCH  /v1/wishlists/:id        # Update wishlist
DELETE /v1/wishlists/:id        # Delete wishlist

# Items
POST   /v1/wishlists/:id/items  # Add item
PATCH  /v1/items/:id            # Update item
DELETE /v1/items/:id            # Delete item
POST   /v1/items/:id/reserve    # Reserve item

# Groups
GET    /v1/groups               # List groups
POST   /v1/groups               # Create group
POST   /v1/groups/join/:code    # Join group

# Exchanges
GET    /v1/exchanges            # List exchanges
POST   /v1/exchanges            # Create exchange
POST   /v1/exchanges/:id/draw   # Draw names

# Public
GET    /v1/public/lists/:slug   # View shared list
GET    /v1/magic/:token         # Validate magic link
```

## Project Structure

```
src/
├── index.ts           # Entry point
├── app.ts             # Express app setup
├── config/            # Configuration
├── middleware/        # Express middleware
├── routes/            # Route definitions
├── controllers/       # Request handlers
├── services/          # Business logic
├── repositories/      # Data access
├── validators/        # Zod schemas
├── types/             # TypeScript types
├── utils/             # Utility functions
└── jobs/              # Background jobs
```

## Key Features

### Surprise-Preserving Reservations
- Givers can reserve items
- **Owners NEVER see reservation status**
- Enforced at API layer

### Magic Links
- Frictionless participation
- No account needed to join exchanges
- Secure token-based access

### Secret Santa
- Automatic name drawing
- Exclusion support (don't match spouses)
- Assignment privacy

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Deployment

### Railway

1. Connect GitHub repository
2. Add environment variables
3. Deploy

Railway will automatically:
- Detect Node.js
- Run `npm install`
- Run `npm run build`
- Start with `npm start`
