# Project Structure

## Repository Strategy

Three separate repositories (can migrate to monorepo later if desired):

```
wishlist-api/       # Express backend
wishlist-web/       # Next.js frontend
wishlist-mobile/    # React Native app (built after web is stable)
```

---

## Backend (Express + Node.js)

```
wishlist-api/
├── src/
│   ├── index.ts                    # Entry point, starts server
│   ├── app.ts                      # Express app configuration
│   │
│   ├── config/
│   │   ├── index.ts                # Environment variables, config object
│   │   ├── database.ts             # Prisma client setup
│   │   └── clerk.ts                # Clerk SDK configuration
│   │
│   ├── middleware/
│   │   ├── auth.ts                 # Clerk JWT + Magic Link validation
│   │   ├── errorHandler.ts         # Global error handling
│   │   ├── rateLimiter.ts          # Rate limiting (express-rate-limit)
│   │   ├── validate.ts             # Zod validation middleware
│   │   └── requirePremium.ts       # Premium feature gate
│   │
│   ├── routes/
│   │   ├── index.ts                # Route aggregator (/v1/...)
│   │   ├── auth.routes.ts          # /auth/* (webhooks)
│   │   ├── users.routes.ts         # /users/*
│   │   ├── wishlists.routes.ts     # /wishlists/*
│   │   ├── items.routes.ts         # /items/*
│   │   ├── groups.routes.ts        # /groups/*
│   │   ├── exchanges.routes.ts     # /exchanges/*
│   │   ├── magic.routes.ts         # /magic/*
│   │   ├── notifications.routes.ts # /notifications/*
│   │   ├── ai.routes.ts            # /ai/*
│   │   └── public.routes.ts        # /public/* (no auth)
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── users.controller.ts
│   │   ├── wishlists.controller.ts
│   │   ├── items.controller.ts
│   │   ├── groups.controller.ts
│   │   ├── exchanges.controller.ts
│   │   ├── magic.controller.ts
│   │   ├── notifications.controller.ts
│   │   └── ai.controller.ts
│   │
│   ├── services/
│   │   ├── user.service.ts
│   │   ├── wishlist.service.ts
│   │   ├── item.service.ts
│   │   ├── reservation.service.ts  # Reservation logic (privacy rules here)
│   │   ├── group.service.ts
│   │   ├── exchange.service.ts
│   │   ├── assignment.service.ts   # Secret Santa algorithm
│   │   ├── magicLink.service.ts    # Token generation/validation
│   │   ├── urlExtractor.service.ts # Metadata extraction from URLs
│   │   ├── ai.service.ts           # OpenAI integration
│   │   ├── notification.service.ts # In-app notifications
│   │   ├── push.service.ts         # Push notifications (FCM/APNs)
│   │   ├── email.service.ts        # Resend integration
│   │   ├── sms.service.ts          # Twilio integration
│   │   └── priceTracker.service.ts # Price monitoring
│   │
│   ├── repositories/               # Data access layer (Prisma queries)
│   │   ├── user.repository.ts
│   │   ├── wishlist.repository.ts
│   │   ├── item.repository.ts
│   │   ├── reservation.repository.ts
│   │   ├── group.repository.ts
│   │   ├── exchange.repository.ts
│   │   ├── magicLink.repository.ts
│   │   └── notification.repository.ts
│   │
│   ├── validators/                 # Zod schemas for request validation
│   │   ├── common.validator.ts     # Shared schemas (pagination, etc.)
│   │   ├── wishlist.validator.ts
│   │   ├── item.validator.ts
│   │   ├── group.validator.ts
│   │   ├── exchange.validator.ts
│   │   └── ai.validator.ts
│   │
│   ├── types/                      # TypeScript interfaces
│   │   ├── index.ts                # Re-exports
│   │   ├── user.types.ts
│   │   ├── wishlist.types.ts
│   │   ├── item.types.ts
│   │   ├── group.types.ts
│   │   ├── exchange.types.ts
│   │   ├── api.types.ts            # Request/Response types
│   │   └── auth.types.ts           # Auth context types
│   │
│   ├── utils/
│   │   ├── errors.ts               # Custom error classes
│   │   ├── crypto.ts               # Token generation (nanoid)
│   │   ├── secretSanta.ts          # Derangement algorithm
│   │   ├── slugify.ts              # URL slug generation
│   │   └── helpers.ts              # Misc utilities
│   │
│   └── jobs/                       # Background jobs (node-cron or BullMQ)
│       ├── index.ts                # Job scheduler setup
│       ├── priceChecker.job.ts     # Daily price checks
│       ├── incognitoCleanup.job.ts # Delete expired incognito exchanges
│       └── reminderSender.job.ts   # Send exchange reminders
│
├── prisma/
│   ├── schema.prisma               # Database schema (source of truth)
│   ├── migrations/                 # Migration files
│   └── seed.ts                     # Database seeding
│
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/
│   │   ├── wishlists.test.ts
│   │   ├── exchanges.test.ts
│   │   └── reservations.test.ts
│   └── fixtures/                   # Test data
│
├── .env.example                    # Environment variable template
├── .env                            # Local environment (gitignored)
├── package.json
├── tsconfig.json
├── Dockerfile                      # For Railway deployment
├── railway.toml                    # Railway config
└── README.md
```

### Key Backend Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.x",
    "@clerk/express": "^1.x",
    "@prisma/client": "^5.x",
    "zod": "^3.x",
    "openai": "^4.x",
    "resend": "^2.x",
    "twilio": "^4.x",
    "nanoid": "^5.x",
    "metascraper": "^5.x",
    "metascraper-title": "^5.x",
    "metascraper-image": "^5.x",
    "metascraper-description": "^5.x",
    "node-cron": "^3.x",
    "helmet": "^7.x",
    "cors": "^2.x",
    "express-rate-limit": "^7.x",
    "morgan": "^1.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "prisma": "^5.x",
    "tsx": "^4.x",
    "vitest": "^1.x",
    "@types/express": "^4.x",
    "@types/node": "^20.x"
  }
}
```

---

## Frontend — Web (Next.js)

```
wishlist-web/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (ClerkProvider, fonts)
│   │   ├── page.tsx                # Landing page (/)
│   │   ├── globals.css             # Global styles
│   │   │
│   │   ├── (auth)/                 # Auth routes (Clerk)
│   │   │   ├── layout.tsx
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   └── sign-up/[[...sign-up]]/page.tsx
│   │   │
│   │   ├── (dashboard)/            # Authenticated app routes
│   │   │   ├── layout.tsx          # Dashboard layout (sidebar, header)
│   │   │   ├── dashboard/page.tsx  # Main dashboard
│   │   │   │
│   │   │   ├── lists/
│   │   │   │   ├── page.tsx        # All wishlists
│   │   │   │   ├── new/page.tsx    # Create wishlist
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx    # View wishlist
│   │   │   │       └── edit/page.tsx
│   │   │   │
│   │   │   ├── groups/
│   │   │   │   ├── page.tsx        # All groups
│   │   │   │   ├── new/page.tsx
│   │   │   │   ├── [id]/page.tsx   # View group
│   │   │   │   └── join/[code]/page.tsx
│   │   │   │
│   │   │   ├── exchanges/
│   │   │   │   ├── page.tsx        # All exchanges
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx    # Exchange details
│   │   │   │       ├── participants/page.tsx
│   │   │   │       ├── exclusions/page.tsx
│   │   │   │       └── draw/page.tsx
│   │   │   │
│   │   │   ├── gift-ideas/page.tsx # AI Gift Concierge
│   │   │   ├── history/page.tsx    # Gift history
│   │   │   ├── notifications/page.tsx
│   │   │   └── settings/page.tsx
│   │   │
│   │   ├── (public)/               # Public routes (no auth required)
│   │   │   ├── list/[slug]/page.tsx    # Shared wishlist view
│   │   │   └── magic/[token]/page.tsx  # Magic link landing
│   │   │
│   │   └── api/                    # Optional BFF routes (if needed)
│   │       └── og/route.ts         # Open Graph image generation
│   │
│   ├── components/
│   │   ├── ui/                     # Base UI components (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── PageHeader.tsx
│   │   │
│   │   ├── wishlists/
│   │   │   ├── WishlistCard.tsx
│   │   │   ├── WishlistForm.tsx
│   │   │   ├── WishlistGrid.tsx
│   │   │   ├── ItemCard.tsx
│   │   │   ├── ItemForm.tsx
│   │   │   ├── ItemList.tsx
│   │   │   ├── AddItemModal.tsx
│   │   │   ├── AddItemFromUrl.tsx
│   │   │   ├── ShareModal.tsx
│   │   │   ├── ShareWithUserModal.tsx
│   │   │   └── ReservationBadge.tsx
│   │   │
│   │   ├── groups/
│   │   │   ├── GroupCard.tsx
│   │   │   ├── GroupForm.tsx
│   │   │   ├── MemberList.tsx
│   │   │   ├── MemberCard.tsx
│   │   │   └── InviteModal.tsx
│   │   │
│   │   ├── exchanges/
│   │   │   ├── ExchangeCard.tsx
│   │   │   ├── ExchangeForm.tsx
│   │   │   ├── ParticipantList.tsx
│   │   │   ├── ParticipantForm.tsx
│   │   │   ├── ExclusionManager.tsx
│   │   │   ├── DrawButton.tsx
│   │   │   ├── AssignmentReveal.tsx # The big reveal with animation
│   │   │   └── ExchangeChat.tsx
│   │   │
│   │   ├── ai/
│   │   │   ├── GiftConcierge.tsx
│   │   │   ├── SuggestionCard.tsx
│   │   │   └── SuggestionList.tsx
│   │   │
│   │   ├── notifications/
│   │   │   ├── NotificationBell.tsx
│   │   │   ├── NotificationList.tsx
│   │   │   └── NotificationItem.tsx
│   │   │
│   │   ├── animations/
│   │   │   ├── Confetti.tsx
│   │   │   ├── ScratchOff.tsx
│   │   │   ├── CardFlip.tsx
│   │   │   └── PriceDropBadge.tsx
│   │   │
│   │   └── shared/
│   │       ├── EmptyState.tsx
│   │       ├── LoadingState.tsx
│   │       ├── ErrorState.tsx
│   │       ├── ConfirmDialog.tsx
│   │       └── UserAvatar.tsx
│   │
│   ├── hooks/
│   │   ├── useWishlists.ts         # Wishlist CRUD
│   │   ├── useWishlist.ts          # Single wishlist
│   │   ├── useItems.ts             # Item CRUD
│   │   ├── useReservations.ts      # Reserve/unreserve
│   │   ├── useGroups.ts
│   │   ├── useExchanges.ts
│   │   ├── useExchange.ts
│   │   ├── useNotifications.ts
│   │   ├── useUrlExtractor.ts      # URL metadata extraction
│   │   └── useDebounce.ts
│   │
│   ├── lib/
│   │   ├── api.ts                  # API client (fetch wrapper with auth)
│   │   ├── clerk.ts                # Clerk helpers
│   │   ├── utils.ts                # cn(), formatPrice(), etc.
│   │   └── constants.ts            # App constants
│   │
│   ├── stores/                     # Zustand stores (if needed)
│   │   └── ui.store.ts             # UI state (sidebar open, modals)
│   │
│   └── types/
│       ├── index.ts
│       ├── wishlist.ts
│       ├── item.ts
│       ├── group.ts
│       ├── exchange.ts
│       ├── user.ts
│       └── api.ts
│
├── public/
│   ├── images/
│   │   ├── logo.svg
│   │   ├── og-image.png
│   │   └── empty-states/
│   └── icons/
│
├── .env.local.example
├── .env.local                      # Local env (gitignored)
├── package.json
├── tailwind.config.ts
├── next.config.js
├── components.json                 # shadcn/ui config
├── vercel.json                     # Vercel config
└── README.md
```

### Key Frontend Dependencies

```json
{
  "dependencies": {
    "next": "^14.x",
    "react": "^18.x",
    "react-dom": "^18.x",
    "@clerk/nextjs": "^5.x",
    "@tanstack/react-query": "^5.x",
    "zustand": "^4.x",
    "tailwindcss": "^3.x",
    "@radix-ui/react-dialog": "^1.x",
    "@radix-ui/react-dropdown-menu": "^2.x",
    "@radix-ui/react-toast": "^1.x",
    "framer-motion": "^11.x",
    "lucide-react": "latest",
    "class-variance-authority": "^0.7.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",
    "date-fns": "^3.x",
    "zod": "^3.x",
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^3.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/react": "^18.x",
    "@types/node": "^20.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x"
  }
}
```

---

## Frontend — Mobile (React Native)

```
wishlist-mobile/
├── app/                            # Expo Router (file-based routing)
│   ├── _layout.tsx                 # Root layout
│   ├── index.tsx                   # Entry/splash
│   │
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   │
│   ├── (tabs)/                     # Main tab navigation
│   │   ├── _layout.tsx             # Tab bar config
│   │   ├── index.tsx               # Dashboard tab
│   │   ├── lists.tsx               # Wishlists tab
│   │   ├── groups.tsx              # Groups tab
│   │   └── profile.tsx             # Profile tab
│   │
│   ├── lists/
│   │   ├── [id].tsx                # View wishlist
│   │   └── new.tsx                 # Create wishlist
│   │
│   ├── groups/
│   │   ├── [id].tsx
│   │   └── join/[code].tsx
│   │
│   ├── exchanges/
│   │   ├── [id].tsx
│   │   └── reveal.tsx              # Assignment reveal screen
│   │
│   └── magic/[token].tsx           # Magic link deep link
│
├── components/
│   ├── ui/                         # Base components
│   ├── wishlists/
│   ├── groups/
│   ├── exchanges/
│   └── animations/
│       ├── Confetti.tsx
│       ├── ScratchOff.tsx
│       └── CardFlip.tsx
│
├── hooks/
│   ├── useWishlists.ts
│   ├── useExchanges.ts
│   └── ...
│
├── lib/
│   ├── api.ts
│   ├── storage.ts                  # AsyncStorage / MMKV helpers
│   └── notifications.ts            # Push notification setup
│
├── stores/
│   └── auth.store.ts
│
├── types/
│   └── ...                         # Shared with web where possible
│
├── assets/
│   ├── images/
│   └── animations/                 # Lottie files
│
├── app.json                        # Expo config
├── eas.json                        # EAS Build config
├── package.json
├── tsconfig.json
└── README.md
```

### Key Mobile Dependencies

```json
{
  "dependencies": {
    "expo": "~50.x",
    "expo-router": "~3.x",
    "react-native": "0.73.x",
    "@clerk/clerk-expo": "^1.x",
    "@tanstack/react-query": "^5.x",
    "zustand": "^4.x",
    "expo-notifications": "~0.27.x",
    "expo-linking": "~6.x",
    "react-native-reanimated": "~3.x",
    "lottie-react-native": "^6.x",
    "@react-navigation/native": "^6.x",
    "react-native-mmkv": "^2.x",
    "expo-haptics": "~12.x",
    "expo-secure-store": "~12.x"
  }
}
```

---

## Environment Variables

### Backend (.env)
```bash
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/wishlist"

# Clerk
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# External Services
OPENAI_API_KEY="sk-..."
RESEND_API_KEY="re_..."
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1..."

# App
FRONTEND_URL="http://localhost:3000"
MAGIC_LINK_EXPIRY_DAYS=30
```

### Web Frontend (.env.local)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_API_URL="http://localhost:3001/v1"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Mobile (app.json extra or .env)
```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
EXPO_PUBLIC_API_URL="https://api.yourapp.com/v1"
```
