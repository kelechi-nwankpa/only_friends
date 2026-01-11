# Feature List & Implementation Status

## Status Legend

| Status | Meaning |
|--------|---------|
| `planned` | Designed, not started |
| `in-progress` | Currently being built |
| `complete` | Implemented and working |
| `deferred` | Postponed |

---

## Core Features (MVP v1.0)

### Authentication & Users

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Email/password signup | `planned` | P0 | Via Clerk |
| Google OAuth | `planned` | P0 | Via Clerk |
| Apple OAuth | `planned` | P1 | Via Clerk |
| Magic Link access (no account) | `planned` | P0 | Custom implementation |
| User profile management | `planned` | P1 | Name, avatar |
| Account deletion | `planned` | P2 | GDPR compliance |

### Wishlists

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Create wishlist | `planned` | P0 | |
| Edit wishlist | `planned` | P0 | Title, description, type |
| Delete wishlist | `planned` | P0 | |
| Archive wishlist | `planned` | P1 | Hide without deleting |
| Multiple wishlists per user | `planned` | P0 | |
| Wishlist types | `planned` | P1 | General, birthday, christmas, wedding, baby |
| Drag-and-drop reorder items | `planned` | P1 | |

### Wishlist Items

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Add item manually | `planned` | P0 | Title, notes, price, priority |
| Add item from URL | `planned` | P0 | Auto-extract metadata |
| Edit item | `planned` | P0 | |
| Delete item | `planned` | P0 | |
| Item priorities | `planned` | P0 | Low, medium, high |
| Item notes | `planned` | P0 | Owner's notes for givers |
| Item images | `planned` | P1 | From URL or manual upload |
| Reorder items | `planned` | P1 | Drag-and-drop |

### URL Extraction

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Extract title from URL | `planned` | P0 | Using metascraper |
| Extract image from URL | `planned` | P1 | |
| Extract price from URL | `planned` | P1 | Best effort, may fail |
| Manual override always available | `planned` | P0 | When extraction fails |

### Sharing & Privacy

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Private wishlists | `planned` | P0 | Only owner sees |
| Share with groups | `planned` | P0 | |
| Share with individuals (1-on-1) | `planned` | P0 | Direct sharing |
| Shareable read-only links | `planned` | P0 | No auth required to view |
| Revoke share link | `planned` | P1 | |
| Visibility controls | `planned` | P0 | Private, shared, public |

### Gift Reservation

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Reserve item | `planned` | P0 | One-click reserve |
| Release reservation | `planned` | P0 | |
| Mark as purchased | `planned` | P0 | |
| Owner cannot see reservations | `planned` | P0 | **CRITICAL** |
| Other givers can see reservations | `planned` | P0 | Prevents duplicates |
| Real-time status sync | `planned` | P1 | Polling initially, WebSocket later |

### Groups

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Create group | `planned` | P0 | |
| Edit group | `planned` | P0 | Name, description |
| Delete group | `planned` | P0 | Admin only |
| Invite via code | `planned` | P0 | Shareable link |
| Join via code | `planned` | P0 | |
| Member list | `planned` | P0 | |
| Remove member | `planned` | P1 | Admin only |
| Admin role | `planned` | P1 | Can manage group |
| View group members' wishlists | `planned` | P0 | |

### Secret Santa / Exchanges

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Create exchange | `planned` | P0 | |
| Edit exchange | `planned` | P0 | |
| Delete exchange | `planned` | P0 | |
| Add participants | `planned` | P0 | Name, email, phone |
| Generate Magic Links | `planned` | P0 | For each participant |
| Send invites (email) | `planned` | P0 | Via Resend |
| Send invites (SMS) | `planned` | P1 | Via Twilio |
| Exclusions | `planned` | P0 | "Don't match these two" |
| Draw names | `planned` | P0 | With exclusion validation |
| View my assignment | `planned` | P0 | Only own assignment |
| Link wishlist to exchange | `planned` | P0 | |
| Budget limits | `planned` | P1 | Min/max |
| Exchange dates | `planned` | P1 | Draw date, exchange date |
| Exchange status | `planned` | P1 | Open, drawn, completed |

---

## Growth Features (v1.1)

### AI Gift Concierge

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Gift suggestions from description | `planned` | P1 | "12yo nephew, loves Minecraft" |
| Budget-aware suggestions | `planned` | P1 | |
| Save/dismiss suggestions | `planned` | P2 | |
| Add suggestion to wishlist | `planned` | P1 | One-click add |

### Price Tracking

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Enable price tracking on item | `planned` | P1 | Premium feature |
| Price history chart | `planned` | P2 | |
| Price drop alerts | `planned` | P1 | Push/email notification |
| Daily price checks | `planned` | P1 | Background job |

### Gift History

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| View gifts given | `planned` | P1 | |
| View gifts received | `planned` | P1 | |
| Log gift manually | `planned` | P2 | |
| Auto-log from reservations | `planned` | P1 | When marked purchased |
| Gift analytics | `planned` | P2 | Spending trends |

### Notifications

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| In-app notifications | `planned` | P0 | |
| Push notifications (mobile) | `planned` | P1 | FCM + APNs |
| Email notifications | `planned` | P1 | Configurable |
| Notification preferences | `planned` | P2 | |

### Privacy Features

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Incognito exchange mode | `planned` | P1 | Auto-delete after event |
| Data export | `planned` | P2 | GDPR |
| Delete all data | `planned` | P2 | GDPR |

---

## Polished Features (v1.2)

### Delightful UX

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Scratch-off reveal animation | `planned` | P2 | For assignment reveal |
| Confetti on purchase | `planned` | P2 | |
| Card flip animation | `planned` | P2 | |
| Haptic feedback (mobile) | `planned` | P2 | |
| Dark mode | `planned` | P1 | |
| Custom themes | `planned` | P2 | Premium |

### Communication

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Exchange group chat | `planned` | P2 | Ephemeral messages |
| Thank you notes | `planned` | P2 | Send after receiving |
| Thank you note generator | `planned` | P2 | AI-assisted |

### Browser Extension

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Chrome extension | `planned` | P2 | Add items from any page |
| Firefox extension | `planned` | P3 | |
| Safari extension | `planned` | P3 | |

### Mobile-Specific

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Native share sheet | `planned` | P1 | Add items from any app |
| Biometric auth | `planned` | P2 | Face ID / Touch ID |
| Offline mode | `planned` | P2 | View cached data |
| Home screen widgets | `planned` | P3 | iOS + Android |

### Public Wishlists

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Opt-in public profile | `planned` | P2 | |
| Public wishlist page | `planned` | P2 | |
| Share on social media | `planned` | P2 | |

---

## Monetization Features

### Premium Subscription

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Subscription management | `planned` | P1 | Stripe |
| Unlimited exchange participants | `planned` | P1 | Free tier = limited |
| AI Gift Concierge access | `planned` | P1 | |
| Price drop alerts | `planned` | P1 | |
| Advanced themes | `planned` | P2 | |
| Gift analytics | `planned` | P2 | |
| Priority support | `planned` | P2 | |

### Other Revenue

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Affiliate links | `planned` | P2 | Transparent, opt-in |
| Virtual gift cards | `planned` | P3 | Future consideration |

---

## Technical Features

### Performance

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Image optimization | `planned` | P1 | Next.js Image |
| API response caching | `planned` | P2 | Redis (later) |
| Lazy loading | `planned` | P1 | |
| Optimistic updates | `planned` | P1 | For reservations |

### Security

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Rate limiting | `planned` | P0 | |
| Input validation | `planned` | P0 | Zod |
| CORS configuration | `planned` | P0 | |
| Helmet security headers | `planned` | P0 | |
| Magic Link expiry | `planned` | P0 | 30 days default |

### Monitoring

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Error tracking | `planned` | P1 | Sentry |
| Analytics | `planned` | P2 | Privacy-respecting |
| Uptime monitoring | `planned` | P1 | |
| Log aggregation | `planned` | P2 | |

---

## Platform Support

### Web

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome | `planned` | Primary |
| Firefox | `planned` | |
| Safari | `planned` | |
| Edge | `planned` | |
| Mobile browsers | `planned` | Responsive design |

### Mobile

| Platform | Status | Notes |
|----------|--------|-------|
| iOS | `planned` | React Native (Expo) |
| Android | `planned` | React Native (Expo) |

---

## Implementation Order

### Phase 1: Foundation
1. Backend setup (Express, Prisma, PostgreSQL)
2. Auth integration (Clerk)
3. Basic CRUD: Users, Wishlists, Items
4. Reservation system with privacy rules

### Phase 2: Sharing
5. Groups (create, join, invite)
6. Wishlist sharing (groups + individuals)
7. Public share links

### Phase 3: Exchanges
8. Exchange creation and management
9. Participant management
10. Magic Links
11. Name drawing algorithm
12. Assignment reveal

### Phase 4: Web Frontend
13. Next.js setup with Clerk
14. Dashboard, list views
15. Item management
16. Group management
17. Exchange flow

### Phase 5: Polish
18. URL extraction
19. Notifications
20. Micro-interactions

### Phase 6: Growth Features
21. AI Gift Concierge
22. Price tracking
23. Gift history

### Phase 7: Mobile
24. React Native setup
25. Core flows
26. Push notifications
27. Native features
