# Feature List & Implementation Status

## Status Legend

| Status | Meaning |
|--------|---------|
| `planned` | Designed, not started |
| `in-progress` | Currently being built |
| `complete` | Implemented and working |
| `partial` | Backend done, frontend incomplete (or vice versa) |
| `deferred` | Postponed |

---

## Core Features (MVP v1.0)

### Authentication & Users

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Email/password signup | `complete` | P0 | Via Clerk |
| Google OAuth | `complete` | P0 | Via Clerk |
| Apple OAuth | `complete` | P1 | Via Clerk |
| Magic Link access (no account) | `complete` | P0 | Full implementation with claim flow |
| User profile management | `complete` | P1 | Name, avatar |
| Account deletion | `complete` | P2 | Clerk handles + DB cascade |

### Wishlists

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Create wishlist | `complete` | P0 | |
| Edit wishlist | `complete` | P0 | Title, description, type |
| Delete wishlist | `complete` | P0 | |
| Archive wishlist | `complete` | P1 | `isArchived` flag |
| Multiple wishlists per user | `complete` | P0 | |
| Wishlist types | `complete` | P1 | General, birthday, christmas, wedding, baby, home |
| Drag-and-drop reorder items | `complete` | P1 | `reorderItems` endpoint |

### Wishlist Items

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Add item manually | `complete` | P0 | Title, notes, price, priority |
| Add item from URL | `complete` | P0 | Auto-extract metadata via metascraper |
| Edit item | `complete` | P0 | |
| Delete item | `complete` | P0 | |
| Item priorities | `complete` | P0 | Low, medium, high |
| Item notes | `complete` | P0 | Owner's notes for givers |
| Item images | `complete` | P1 | From URL extraction |
| Reorder items | `complete` | P1 | Position-based ordering |

### URL Extraction

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Extract title from URL | `complete` | P0 | Using metascraper |
| Extract image from URL | `complete` | P1 | |
| Extract price from URL | `complete` | P1 | Basic regex patterns |
| Manual override always available | `complete` | P0 | When extraction fails |

### Sharing & Privacy

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Private wishlists | `complete` | P0 | Default mode |
| Share with groups | `complete` | P0 | |
| Share with individuals (1-on-1) | `complete` | P0 | Direct sharing |
| Shareable read-only links | `complete` | P0 | No auth required to view |
| Revoke share link | `complete` | P1 | |
| Visibility controls | `complete` | P0 | Private, shared, public |

### Gift Reservation

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Reserve item | `complete` | P0 | One-click reserve |
| Release reservation | `complete` | P0 | |
| Mark as purchased | `complete` | P0 | |
| Owner cannot see reservations | `complete` | P0 | **CRITICAL** — enforced in backend |
| Other givers can see reservations | `complete` | P0 | Prevents duplicates |
| Real-time status sync | `complete` | P1 | React Query invalidation |

### Groups

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Create group | `complete` | P0 | |
| Edit group | `complete` | P0 | Name, description |
| Delete group | `complete` | P0 | Creator only |
| Invite via code | `complete` | P0 | Shareable link |
| Join via code | `complete` | P0 | |
| Member list | `complete` | P0 | |
| Remove member | `complete` | P1 | Admin only |
| Admin role | `complete` | P1 | Can manage group |
| View group members' wishlists | `complete` | P0 | |

### Secret Santa / Exchanges

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Create exchange | `complete` | P0 | |
| Edit exchange | `complete` | P0 | |
| Delete exchange | `complete` | P0 | |
| Add participants | `complete` | P0 | Name, email, phone |
| Generate Magic Links | `complete` | P0 | Auto-generated per participant |
| Send invites (email) | `planned` | P0 | TODO: Resend integration |
| Send invites (SMS) | `planned` | P1 | TODO: Twilio integration |
| Exclusions | `complete` | P0 | spouse, same_household, custom |
| Draw names | `complete` | P0 | Backtracking algorithm with validation |
| View my assignment | `complete` | P0 | Reveal animation |
| Link wishlist to exchange | `complete` | P0 | |
| Budget limits | `complete` | P1 | Min/max with currency |
| Exchange dates | `complete` | P1 | Draw date, exchange date |
| Exchange status | `complete` | P1 | open → drawn → completed → archived |

---

## Growth Features (v1.1)

### AI Gift Concierge

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Gift suggestions from description | `partial` | P1 | Backend complete, **frontend uses mock data** |
| Budget-aware suggestions | `partial` | P1 | Backend supports it |
| Save/dismiss suggestions | `planned` | P2 | |
| Add suggestion to wishlist | `planned` | P1 | Button exists but not wired |

### Price Tracking

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Enable price tracking on item | `partial` | P1 | API exists, no UI |
| Price history chart | `planned` | P2 | |
| Price drop alerts | `planned` | P1 | No notification trigger |
| Daily price checks | `planned` | P1 | **No background job implemented** |

### Gift History

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| View gifts given | `planned` | P1 | Schema exists only |
| View gifts received | `planned` | P1 | |
| Log gift manually | `planned` | P2 | |
| Auto-log from reservations | `planned` | P1 | When marked purchased |
| Gift analytics | `planned` | P2 | Spending trends |

### Notifications

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| In-app notifications | `planned` | P0 | Schema exists only |
| Push notifications (mobile) | `planned` | P1 | No FCM/APNs integration |
| Email notifications | `planned` | P1 | No Resend integration |
| Notification preferences | `planned` | P2 | |

### Privacy Features

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Incognito exchange mode | `complete` | P1 | `isIncognito` + auto-delete after 30 days |
| Data export | `planned` | P2 | GDPR |
| Delete all data | `planned` | P2 | GDPR |

---

## Polished Features (v1.2)

### Delightful UX

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Scratch-off reveal animation | `complete` | P2 | Framer Motion |
| Confetti on purchase | `complete` | P2 | |
| Card flip animation | `complete` | P2 | |
| Haptic feedback (mobile) | `planned` | P2 | Mobile only |
| Dark mode | `planned` | P1 | |
| Custom themes | `planned` | P2 | Premium |

### Communication

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Exchange group chat | `partial` | P2 | Backend complete, **no frontend UI** |
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
| Public wishlist page | `complete` | P2 | Via shareable link |
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
| Image optimization | `complete` | P1 | Next.js Image |
| API response caching | `planned` | P2 | Redis (later) |
| Lazy loading | `complete` | P1 | |
| Optimistic updates | `complete` | P1 | React Query for reservations |

### Security

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Rate limiting | `complete` | P0 | 100 req/15min global, 10 req/min strict |
| Input validation | `complete` | P0 | Zod schemas |
| CORS configuration | `complete` | P0 | |
| Helmet security headers | `complete` | P0 | |
| Magic Link expiry | `complete` | P0 | 7 days default |

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
| Chrome | `complete` | Primary |
| Firefox | `complete` | |
| Safari | `complete` | |
| Edge | `complete` | |
| Mobile browsers | `complete` | Responsive design |

### Mobile

| Platform | Status | Notes |
|----------|--------|-------|
| iOS | `planned` | React Native (Expo) |
| Android | `planned` | React Native (Expo) |

---

## Implementation Progress

### Phase 1: Foundation ✅ COMPLETE
1. ✅ Backend setup (Express, Prisma, PostgreSQL)
2. ✅ Auth integration (Clerk)
3. ✅ Basic CRUD: Users, Wishlists, Items
4. ✅ Reservation system with privacy rules

### Phase 2: Sharing ✅ COMPLETE
5. ✅ Groups (create, join, invite)
6. ✅ Wishlist sharing (groups + individuals)
7. ✅ Public share links

### Phase 3: Exchanges ✅ COMPLETE
8. ✅ Exchange creation and management
9. ✅ Participant management
10. ✅ Magic Links
11. ✅ Name drawing algorithm
12. ✅ Assignment reveal with animations

### Phase 4: Web Frontend ✅ COMPLETE
13. ✅ Next.js setup with Clerk
14. ✅ Dashboard, list views
15. ✅ Item management
16. ✅ Group management
17. ✅ Exchange flow

### Phase 5: Polish 🚧 IN PROGRESS
18. ✅ URL extraction
19. ❌ Notifications (schema only)
20. ✅ Micro-interactions (reveal animations, confetti)

### Phase 6: Growth Features 🚧 IN PROGRESS
21. 🚧 AI Gift Concierge (backend done, frontend mocked)
22. 🚧 Price tracking (API only, no background job)
23. ❌ Gift history (schema only)

### Phase 7: Mobile ❌ NOT STARTED
24. ❌ React Native setup
25. ❌ Core flows
26. ❌ Push notifications
27. ❌ Native features

---

## Summary Statistics

| Category | Complete | Partial | Planned | Total | Progress |
|----------|----------|---------|---------|-------|----------|
| MVP v1.0 | 57 | 0 | 2 | 59 | 97% |
| Growth v1.1 | 1 | 3 | 16 | 20 | 20% |
| Polished v1.2 | 4 | 1 | 15 | 20 | 23% |
| Technical | 8 | 0 | 4 | 12 | 67% |
| **TOTAL** | **70** | **4** | **37** | **111** | **67%** |

---

## Critical Gaps (Priority Fixes)

| Priority | Feature | Current State | Action Needed |
|----------|---------|---------------|---------------|
| **P0** | Email/SMS invites | Not sending | Integrate Resend/Twilio |
| **P1** | AI Concierge frontend | Uses mock data | Wire to backend API |
| **P1** | Chat UI | No frontend | Build chat component |
| **P1** | Price check job | No background job | Implement cron/scheduler |
| **P1** | Dark mode | Not implemented | Add theme provider |
| **P2** | Notifications | Schema only | Build notification system |
