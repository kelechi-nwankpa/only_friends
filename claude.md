# Wishlist App — Product & Build Context (claude.md)

## 1. Product Overview

This project is a **modern wishlist & gift coordination app** inspired by platforms like Elfster, Giftster, and newer universal wishlist apps.

The core mission:
> Make gifting simpler, more intentional, and less wasteful — without clutter, ads, or friction.

The app should feel:
- Simple
- Lovable
- Calm
- Trustworthy
- Modern (clean UX, fast, intuitive)

This is **not** just a Secret Santa app and **not** just a personal wishlist.
It is a **holistic gifting OS** that works:
- Year-round
- For individuals
- For families
- For friend groups
- For events (birthdays, Christmas, Secret Santa, weddings, etc.)

---

## 2. Target Users (Primary & Secondary)

### Primary Users
- Families sharing wishlists year-round
- Friend groups exchanging gifts
- Couples coordinating gifts or shared events
- Small social circles (not enterprise-first)

### Secondary Users
- Office / team Secret Santa groups
- Event-based users (birthdays, weddings, baby showers)
- Power users who maintain ongoing personal wishlists

⚠️ Influencers and public monetized wishlists are **not** the primary focus (may be optional later).

---

## 3. Core Problems Being Solved

- People receive gifts they don't want or can't use
- Gift givers don't know what to buy
- Duplicate gifts within families/groups
- Poor coordination for Secret Santa / group gifting
- Wishlists locked to a single store (e.g. Amazon)
- Overly cluttered, ad-heavy, or outdated apps
- Lack of privacy control in existing tools

---

## 4. Core Product Principles (Non-Negotiable)

Claude should **always** respect these principles when suggesting features or designs:

1. **Simplicity over feature bloat**
2. **No dark patterns**
3. **Privacy first**
4. **User trust > monetization**
5. **Universal (any store, any item)**
6. **Fast and intuitive UX**
7. **Surprise-preserving gift logic**

If a feature adds complexity without solving a real pain point, it should be questioned.

---

## 5. Must-Have Core Features (MVP Baseline)

Claude should treat these as table stakes:

### Wishlists
- Create multiple wishlists per user
- Universal item support (any store, any URL)
- Manual items (ideas without links)
- Item priorities (low / medium / high)
- Optional price field

### Sharing & Privacy
- Private lists
- Shared lists (invite-only)
- Shareable read-only links
- Control who can see each list

### Gift Reservation Logic
- Givers can mark items as:
  - Reserved
  - Purchased
- List owner **must not see** reservation status
- Other givers **can** see reservation status
- Prevents duplicate gifts while preserving surprise

### Groups
- Create groups (family, friends, work)
- Members can see each other's lists
- Optional group chat or comments (non-blocking for MVP)

---

## 6. Group Gifting & Secret Santa

These are **important but should remain lightweight**.

- Create gift exchanges (e.g. Secret Santa)
- Automatic name drawing
- Optional exclusions (e.g. spouse)
- Budget limits per person
- Each participant links a wishlist to the exchange
- Simple exchange timeline (created → drawn → gifting)

Claude should avoid over-gamifying this.

---

## 7. UX / UI Direction

Design should feel:
- Calm
- Neutral
- Friendly
- Minimalist

Avoid:
- Cluttered dashboards
- Loud colours
- Excessive onboarding steps
- Heavy branding that distracts from content

UX inspiration:
- Modern iOS apps
- Simple list-based flows
- Focus on readability and speed

---

## 8. Platform Strategy

Short-term:
- Build **web-first or cross-platform core**
- Ensure shareable web links work without app install

Long-term:
- Native iOS & Android apps
- Browser extension / share action for adding items

Claude should:
- Avoid assuming mobile-only flows
- Always consider how features behave on web AND mobile

---

## 9. Monetization Philosophy

Monetization should be **subtle and optional**.

Allowed approaches:
- Affiliate links on item clicks (transparent)
- Optional premium tier (e.g. price alerts, themes, advanced history)
- No forced ads
- No paywalls blocking core gifting functionality

Avoid:
- Banner ads
- Sponsored items disguised as recommendations
- Dark UX patterns to push upgrades

Revenue should never compromise trust.

---

## 10. Competitive Positioning (Internal Knowledge)

Claude should assume:
- Elfster is strong at Secret Santa but weak at personal wishlists
- Giftster is trusted but outdated and clunky
- Amazon wishlists are store-locked
- Newer apps win on design but lack depth or scale

This product aims to:
> Combine **trust + modern UX + universal flexibility**

---

## 11. What Claude Should Help With

Claude is expected to:
- Design features aligned with the above philosophy
- Suggest database schemas & APIs
- Help with UX copy and flows
- Identify feature trade-offs
- Propose phased roadmaps (MVP → V1 → V2)
- Question unnecessary complexity
- Act like a product-minded senior engineer & designer

Claude should **not**:
- Drift the app into influencer monetization by default
- Add enterprise-heavy features early
- Assume aggressive growth hacks
- Introduce ads-first thinking

---

## 12. Long-Term Vision (Optional, Not MVP)

Potential future expansions (not guaranteed):
- Price drop alerts
- Gift history & analytics
- Event-specific modes (wedding, baby)
- Public wishlists (opt-in)
- Light AI gift suggestions (only if genuinely useful)

Claude should treat these as **optional**, not core.

---

## 13. Final Guiding Question

For any suggestion Claude makes, it should pass this test:

> "Does this make gifting calmer, clearer, and more intentional?"

If not — reconsider.

---

## 14. User Pain Points & Market Gaps

Analysis of existing applications reveals recurring pain points that present significant opportunities:

| Pain Point | Description |
|------------|-------------|
| **Onboarding Friction** | Apps require extensive setup, account creation, and email verification for ALL participants — barriers for less tech-savvy users |
| **Privacy Concerns** | Users worry about sharing personal data (addresses, emails) with platforms that monetize through ads or data sales |
| **Complexity** | Established app interfaces are overwhelming, especially for multi-generational family groups |
| **Lack of Syncing** | Poor real-time synchronization of gift statuses leads to duplicate gifts |
| **Ad-Heavy Experience** | Excessive ads and affiliate links make apps feel like shopping platforms, not helpful utilities |

---

## 15. Differentiation Strategy & Standout Features

**Refined UVP:**
> "The simplest, most private, and delightful way for everyone to organize gift exchanges and manage wishlists, without the clutter of ads or the friction of accounts."

### 15.1 Magic Link Participation (The "Friction Killer")

**Critical for mass adoption.** Only the organizer needs an account.

- Participants receive a unique, secure Magic Link via SMS/WhatsApp/email
- Clicking grants immediate access to their exchange view and wishlist
- No login, no app download required
- Optional account creation later for full features
- Reduces support burden and barriers to entry

### 15.2 AI Gift Concierge (The "Creative Spark")

Integrated AI assistant for personalized gift suggestions:

- User inputs brief description: "my 12-year-old nephew who loves Minecraft and space"
- AI generates unique, non-obvious gift ideas with purchase links
- Uses cost-effective LLMs (GPT-4o-mini or similar)
- High perceived value with minimal development overhead

### 15.3 Privacy-First Architecture (Building Mass Trust)

- Transparent data policy: user data is NEVER sold
- Ad-free core offering
- Optional "Incognito Exchange" mode: exchange data auto-deleted 30 days post-event
- Clear communication about what data is stored and why

### 15.4 Universal Importer (Seamless UX)

Robust URL parsing to add items from ANY website:

- Share a product link → app extracts name, image, price, description
- Works with e-commerce sites, blogs, local store pages
- Always allow manual override when parsing fails

### 15.5 "Lovable" Micro-interactions (Engagement & Retention)

Delightful UX details that differentiate from utilitarian competitors:

- "Scratch-off" animation to reveal Secret Santa draw
- Celebratory confetti when a gift is marked as purchased
- Smooth, intuitive interface animations
- These details create a premium, shareable experience

---

## 16. User Personas

### The Organizer (e.g., Sarah, 32)
- Tech-savvy, responsible for setting up exchanges
- Values efficiency, reliability, clean experience
- Willing to pay for premium features that save time

### The Participant (e.g., Grandpa Joe, 70)
- May be less tech-savvy
- Wants to know their recipient and desired gifts with minimal friction
- Will use the app if it's frictionless and intuitive

### The Power User (e.g., Maya, 28)
- Maintains year-round wishlists across multiple categories
- Wants organization, price tracking, easy sharing
- Appreciates advanced features but expects core simplicity

---

## 17. Core User Flows

### 17.1 Organizing an Exchange

1. **Create Exchange**: Organizer logs in, creates new exchange (name, date, budget)
2. **Invite Participants**: Add names/emails/phones → system generates Magic Links
3. **Join (No Account)**: Participant clicks Magic Link → instant access, no login
4. **Draw Names**: Organizer triggers draw once ready; system handles exclusions
5. **Notification**: Participants notified via link or in-app

### 17.2 Participating in an Exchange

1. **Access**: Click Magic Link → web app opens instantly
2. **Reveal Recipient**: Gamified animation reveals assigned recipient
3. **Create Wishlist**: Add items via Universal Importer
4. **Shop for Recipient**: View their wishlist, mark items reserved/purchased (real-time sync, hidden from recipient)

### 17.3 Year-Round Wishlist Management

1. **Create Lists**: Multiple wishlists per user (Birthday, Christmas, Home, etc.)
2. **Add Items**: URL import or manual entry with priority and notes
3. **Share**: Share with groups, individuals, or via public link
4. **Receive Gifts**: Others reserve/purchase without you knowing

---

## 18. Technical Stack (Confirmed)

| Layer | Technology |
|-------|------------|
| **Web Frontend** | Next.js (React) |
| **Mobile Apps** | React Native (iOS + Android) |
| **Backend** | Node.js + Express (separate service) |
| **Database** | PostgreSQL |
| **Auth** | Clerk |
| **Web Hosting** | Vercel |
| **Backend Hosting** | Railway |

### Architecture Notes
- Frontend and backend are decoupled (separate repos/deployments)
- API communication via REST (platform-agnostic, serves web + mobile)
- Clerk handles auth for web, mobile, and Magic Link sessions
- PostgreSQL for relational data model
- React Native app built AFTER web app is stable
- Shared TypeScript types between all three projects (web, mobile, API)

---

## 19. Sharing Model

The app supports **both** sharing modes:

1. **Group Sharing**: Share wishlists with entire groups (family, friends, work)
2. **Direct User Sharing**: Share a specific list with one individual (1-on-1)

This provides flexibility for both social coordination and personal gift sharing.

---

## 20. Feature Roadmap

All features below are in scope (not deferred):

### MVP (v1.0) — Core Functionality
- User auth via Clerk (email, Google, Magic Links)
- Create/edit/delete multiple wishlists
- Universal URL parser for adding items
- Manual item entry with priority, price, notes
- Share lists via groups OR direct to individuals
- Shareable read-only links (no auth required to view)
- Groups with invite codes
- Full Secret Santa with exclusions
- Real-time reservation system (surprise-preserving)
- Budget limits per exchange
- Group visibility of participant wishlists

### Growth (v1.1) — Engagement & Retention
- AI Gift Concierge for personalized suggestions
- Integrated budget tracker for exchanges
- Multiple wishlist types (Birthday, Wedding, Baby, etc.)
- Push notifications for key events
- Price drop alerts
- Gift history & analytics
- "Incognito Exchange" mode (auto-delete after event)

### Polished (v1.2) — Delight & Expansion
- In-app ephemeral group chat for exchanges
- "Thank You" note generator
- Browser extension for easy item adding
- Dark mode theme
- Gamified reveal animations (scratch-off, confetti)
- Public wishlists (opt-in)
- Native iOS & Android apps (future)

---

## 21. Monetization Model

### Free Tier
- Core wishlist functionality
- Basic Secret Santa (limited participants)
- Share lists with groups and individuals
- Universal URL import

### Premium Tier (Subscription)
- Unlimited exchange participants
- AI Gift Concierge
- Price drop alerts
- Advanced themes and customization
- Gift history analytics
- Priority support

### Additional Revenue
- Affiliate links (subtly integrated, transparent, opt-in)
- Virtual gift cards (future)

**Principle**: Core gifting functionality is NEVER paywalled.

---

## 22. Mobile Strategy (React Native)

### Timeline
1. **Phase 1**: Build and stabilize web app (Next.js)
2. **Phase 2**: Build React Native app sharing the same API
3. **Phase 3**: App Store / Play Store deployment

### Architecture for Mobile

```
┌─────────────────────────────────────────────────────────────┐
│                    SHARED BACKEND                            │
│                 (Express API on Railway)                     │
│         Serves: Web (Next.js) + Mobile (React Native)        │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
   ┌─────────┐      ┌──────────┐     ┌──────────┐
   │ Next.js │      │   iOS    │     │ Android  │
   │   Web   │      │   App    │     │   App    │
   └─────────┘      └──────────┘     └──────────┘
                    └────────────────────────┘
                         React Native
                      (Single Codebase)
```

### Mobile-Specific Considerations

| Feature | Web | Mobile |
|---------|-----|--------|
| **Auth** | Clerk React SDK | Clerk Expo/RN SDK |
| **Push Notifications** | Web Push API | Firebase Cloud Messaging (FCM) + APNs |
| **Deep Links** | Standard URLs | Universal Links (iOS) + App Links (Android) |
| **Magic Links** | Opens in browser | Deep links into app (with fallback to web) |
| **Share Extension** | Browser extension | Native share sheet integration |
| **Offline Support** | Service Worker (optional) | AsyncStorage + sync queue |
| **Animations** | Framer Motion | React Native Reanimated |

### React Native Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React Native (Expo managed workflow) |
| **Navigation** | React Navigation |
| **State** | Zustand or TanStack Query |
| **Auth** | @clerk/clerk-expo |
| **UI Components** | React Native Paper or Tamagui |
| **Animations** | React Native Reanimated + Lottie |
| **Push Notifications** | Expo Notifications + FCM/APNs |
| **Storage** | AsyncStorage + MMKV |

### Code Sharing Strategy

```
wishlist-mono/                    # Optional monorepo structure
├── packages/
│   ├── shared/                   # Shared across all projects
│   │   ├── types/                # TypeScript interfaces
│   │   ├── validators/           # Zod schemas
│   │   ├── constants/            # Shared constants
│   │   └── utils/                # Pure utility functions
│   ├── api/                      # Express backend
│   ├── web/                      # Next.js app
│   └── mobile/                   # React Native app
└── package.json                  # Workspace root
```

**What CAN be shared:**
- TypeScript types/interfaces
- Zod validation schemas
- API client logic
- Business logic utilities
- Constants and enums

**What CANNOT be shared:**
- UI components (React DOM vs React Native)
- Navigation (Next.js router vs React Navigation)
- Storage (localStorage vs AsyncStorage)
- Platform-specific features

### Mobile-Specific Features

1. **Native Share Sheet**
   - Add items to wishlist by sharing URLs from any app
   - Extracts URL, sends to API, adds to selected list

2. **Haptic Feedback**
   - Subtle vibration on reserve, purchase, reveal actions
   - Enhances "lovable" micro-interactions

3. **Biometric Auth**
   - Face ID / Touch ID for quick access
   - Optional, not required

4. **Offline Mode**
   - View cached wishlists offline
   - Queue actions (reserve, add items) for sync when online

5. **Widget Support** (Future)
   - iOS: Home screen widget showing upcoming exchanges
   - Android: Home screen widget

### Deep Linking for Magic Links

```
# Web URL
https://app.yourapp.com/magic/abc123token

# Universal Link (iOS) / App Link (Android)
yourapp://magic/abc123token

# Fallback flow:
1. User clicks Magic Link in SMS/email
2. If app installed → opens app directly
3. If app not installed → opens web version
4. Web version shows "Get the app" banner
```

### Push Notification Types

| Event | Notification |
|-------|--------------|
| Exchange invite | "Sarah invited you to Family Christmas Exchange" |
| Names drawn | "Names have been drawn! Tap to reveal your person" |
| Item reserved | (Only to other givers) "An item on Mom's list was reserved" |
| Price drop | "Price dropped on 'AirPods Pro' - now $199" |
| Exchange reminder | "Christmas Exchange is in 3 days!" |
| Thank you received | "Mom sent you a thank you note" |
