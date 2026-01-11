# API Reference

## Base URL

| Environment | URL |
|-------------|-----|
| Production | `https://api.yourapp.com/v1` |
| Development | `http://localhost:3001/v1` |

## Authentication

All endpoints except public ones require authentication via one of:

```
Authorization: Bearer <clerk_jwt>
```
OR
```
X-Magic-Token: <magic_link_token>
```

## Response Format

### Success
```json
{
  "success": true,
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": { ... }
  }
}
```

### Common Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid auth |
| `FORBIDDEN` | 403 | Not allowed to access resource |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `CONFLICT` | 409 | Resource conflict (e.g., already reserved) |
| `RATE_LIMITED` | 429 | Too many requests |

---

## Endpoints

### Auth & Users

#### `POST /v1/auth/webhook`
Clerk webhook endpoint for user sync.

**Headers**: `svix-id`, `svix-timestamp`, `svix-signature`

---

#### `GET /v1/users/me`
Get current authenticated user.

**Response**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar_url": "https://...",
  "is_premium": false,
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

#### `PATCH /v1/users/me`
Update current user profile.

**Body**:
```json
{
  "name": "New Name",
  "avatar_url": "https://..."
}
```

---

#### `GET /v1/users/search?q=`
Search users by email or name (for direct sharing).

**Query**: `q` (min 3 chars)

**Response**:
```json
{
  "users": [
    { "id": "uuid", "name": "Jane", "email": "jane@...", "avatar_url": "..." }
  ]
}
```

---

### Wishlists

#### `GET /v1/wishlists`
Get all wishlists for current user.

**Query params**:
- `include_archived` (boolean, default false)
- `type` (filter by type)

**Response**:
```json
{
  "wishlists": [
    {
      "id": "uuid",
      "title": "Christmas 2024",
      "type": "christmas",
      "visibility": "shared",
      "item_count": 12,
      "created_at": "..."
    }
  ]
}
```

---

#### `POST /v1/wishlists`
Create a new wishlist.

**Body**:
```json
{
  "title": "Birthday Ideas",
  "description": "Things I'd love for my birthday",
  "type": "birthday",
  "visibility": "private"
}
```

**Response**: Created wishlist object

---

#### `GET /v1/wishlists/:id`
Get wishlist with items.

**Response**:
```json
{
  "id": "uuid",
  "title": "Christmas 2024",
  "owner": { "id": "...", "name": "John" },
  "items": [
    {
      "id": "uuid",
      "title": "AirPods Pro",
      "url": "https://apple.com/...",
      "image_url": "...",
      "price": 249.00,
      "currency": "USD",
      "priority": "high",
      "notes": "Space gray preferred",
      "reservation": null  // OR { "status": "reserved", "reserver": { "name": "..." } }
    }
  ]
}
```

**CRITICAL**: If requester is owner, `reservation` is ALWAYS null.

---

#### `PATCH /v1/wishlists/:id`
Update wishlist.

**Body** (all optional):
```json
{
  "title": "Updated Title",
  "description": "...",
  "type": "general",
  "visibility": "shared"
}
```

---

#### `DELETE /v1/wishlists/:id`
Delete wishlist (owner only).

---

#### `POST /v1/wishlists/:id/archive`
Archive wishlist.

---

#### `POST /v1/wishlists/:id/share-link`
Generate or regenerate shareable link slug.

**Response**:
```json
{
  "share_slug": "abc123xyz",
  "share_url": "https://app.yourapp.com/list/abc123xyz"
}
```

---

#### `DELETE /v1/wishlists/:id/share-link`
Revoke shareable link.

---

#### `POST /v1/wishlists/:id/share/group`
Share wishlist with a group.

**Body**:
```json
{
  "group_id": "uuid"
}
```

---

#### `POST /v1/wishlists/:id/share/user`
Share wishlist with an individual.

**Body**:
```json
{
  "user_id": "uuid"
}
```

---

#### `GET /v1/wishlists/:id/shares`
Get all shares for a wishlist.

**Response**:
```json
{
  "groups": [{ "id": "...", "name": "Family" }],
  "users": [{ "id": "...", "name": "Mom", "email": "..." }],
  "share_link": { "slug": "abc123", "url": "..." }
}
```

---

#### `GET /v1/public/lists/:slug`
**No auth required**. View shared list by slug.

Returns same format as `GET /v1/wishlists/:id` but without reservation data.

---

### Items

#### `POST /v1/wishlists/:id/items`
Add item to wishlist.

**Body**:
```json
{
  "title": "Nintendo Switch",
  "url": "https://amazon.com/...",
  "image_url": "https://...",
  "price": 299.99,
  "currency": "USD",
  "notes": "OLED model",
  "priority": "high"
}
```

---

#### `PATCH /v1/items/:id`
Update item.

---

#### `DELETE /v1/items/:id`
Delete item (owner only).

---

#### `POST /v1/wishlists/:id/items/reorder`
Reorder items in a wishlist.

**Body**:
```json
{
  "items": [
    { "id": "uuid1", "position": 0 },
    { "id": "uuid2", "position": 1 }
  ]
}
```

---

#### `POST /v1/items/:id/reserve`
Reserve an item (giver only, not owner).

**Response**:
```json
{
  "reservation": {
    "id": "uuid",
    "status": "reserved",
    "created_at": "..."
  }
}
```

**Error if already reserved**: `CONFLICT`

---

#### `DELETE /v1/items/:id/reserve`
Release reservation.

---

#### `PATCH /v1/items/:id/reserve`
Update reservation status.

**Body**:
```json
{
  "status": "purchased",
  "notes": "Got it on sale!"
}
```

---

### Groups

#### `GET /v1/groups`
Get all groups user belongs to.

---

#### `POST /v1/groups`
Create a group.

**Body**:
```json
{
  "name": "Smith Family",
  "description": "Our family gift coordination"
}
```

---

#### `GET /v1/groups/:id`
Get group with members and shared wishlists.

**Response**:
```json
{
  "id": "uuid",
  "name": "Smith Family",
  "members": [
    { "id": "...", "name": "John", "role": "admin" }
  ],
  "wishlists": [
    { "id": "...", "title": "John's Wishlist", "owner": {...} }
  ],
  "invite_code": "abc123"
}
```

---

#### `POST /v1/groups/:id/invite-code`
Generate new invite code (invalidates old one).

---

#### `POST /v1/groups/join/:code`
Join a group via invite code.

---

#### `DELETE /v1/groups/:id/members/:userId`
Remove member from group (admin only).

---

### Exchanges

#### `GET /v1/exchanges`
Get all exchanges user participates in.

---

#### `POST /v1/exchanges`
Create an exchange.

**Body**:
```json
{
  "name": "Family Christmas 2024",
  "description": "Annual gift exchange",
  "group_id": "uuid",  // optional
  "budget_min": 25,
  "budget_max": 50,
  "currency": "USD",
  "draw_date": "2024-12-01",
  "exchange_date": "2024-12-25",
  "is_incognito": false
}
```

---

#### `GET /v1/exchanges/:id`
Get exchange details.

**Response**:
```json
{
  "id": "uuid",
  "name": "Family Christmas 2024",
  "status": "open",
  "budget": { "min": 25, "max": 50, "currency": "USD" },
  "dates": { "draw": "2024-12-01", "exchange": "2024-12-25" },
  "participants": [
    { "id": "...", "name": "John", "has_wishlist": true, "has_joined": true }
  ],
  "exclusions": [
    { "participant_a": "...", "participant_b": "...", "reason": "spouse" }
  ],
  "my_assignment": null  // OR { "id": "...", "name": "Sarah", "wishlist_id": "..." }
}
```

---

#### `POST /v1/exchanges/:id/participants`
Add participant (generates Magic Link).

**Body**:
```json
{
  "name": "Grandma",
  "email": "grandma@email.com",
  "phone": "+1234567890"  // optional, for SMS
}
```

**Response**:
```json
{
  "participant": { "id": "...", "name": "Grandma" },
  "magic_link": "https://app.yourapp.com/magic/abc123token"
}
```

---

#### `POST /v1/exchanges/:id/send-invites`
Send Magic Links to all participants without accounts.

**Body**:
```json
{
  "method": "email"  // or "sms"
}
```

---

#### `POST /v1/exchanges/:id/exclusions`
Add exclusion.

**Body**:
```json
{
  "participant_a_id": "uuid",
  "participant_b_id": "uuid",
  "reason": "spouse"
}
```

---

#### `POST /v1/exchanges/:id/draw`
Draw names (validates exclusions first).

**Response**:
```json
{
  "success": true,
  "message": "Names drawn successfully"
}
```

**Error if exclusions unsatisfiable**: `VALIDATION_ERROR`

---

#### `GET /v1/exchanges/:id/my-assignment`
Get current user's assignment.

**Response**:
```json
{
  "receiver": {
    "id": "uuid",
    "name": "Sarah",
    "wishlist_id": "uuid",
    "wishlist_title": "Sarah's Christmas List"
  },
  "has_revealed": true
}
```

---

#### `POST /v1/exchanges/:id/reveal`
Mark assignment as revealed (triggers animation on frontend).

---

### Magic Links

#### `GET /v1/magic/:token`
Validate Magic Link and get exchange context.

**No auth required**.

**Response**:
```json
{
  "valid": true,
  "participant": { "id": "...", "name": "Grandma" },
  "exchange": { "id": "...", "name": "Family Christmas", "status": "drawn" },
  "assignment": { ... }  // if names drawn
}
```

---

### Utilities

#### `POST /v1/utils/extract-url`
Extract metadata from a URL.

**Body**:
```json
{
  "url": "https://amazon.com/dp/B09V3KXJPB"
}
```

**Response**:
```json
{
  "title": "Apple AirPods Pro (2nd Generation)",
  "image_url": "https://...",
  "price": 249.00,
  "currency": "USD",
  "description": "..."
}
```

**Note**: May fail for some sites. Always allow manual override in UI.

---

### AI Gift Concierge

#### `POST /v1/ai/gift-suggestions`
Get AI-powered gift suggestions.

**Requires**: Premium subscription

**Body**:
```json
{
  "description": "12-year-old nephew who loves Minecraft and space",
  "budget_min": 20,
  "budget_max": 50,
  "count": 5
}
```

**Response**:
```json
{
  "suggestions": [
    {
      "title": "Minecraft LEGO Set",
      "description": "Build your own Minecraft world...",
      "price_range": "$25-35",
      "search_url": "https://amazon.com/s?k=minecraft+lego"
    }
  ]
}
```

---

### Notifications

#### `GET /v1/notifications`
Get user notifications.

**Query**:
- `unread_only` (boolean)
- `limit` (default 20)

---

#### `PATCH /v1/notifications/:id/read`
Mark notification as read.

---

#### `POST /v1/notifications/read-all`
Mark all as read.

---

### Push Tokens (Mobile)

#### `POST /v1/users/me/push-token`
Register device for push notifications.

**Body**:
```json
{
  "token": "expo_push_token_xxx",
  "platform": "ios",
  "device_name": "John's iPhone"
}
```

---

#### `DELETE /v1/users/me/push-token`
Unregister device.

**Body**:
```json
{
  "token": "expo_push_token_xxx"
}
```

---

### Gift History

#### `GET /v1/gift-history`
Get gift history.

**Query**:
- `type`: `given` | `received` | `all`
- `year`: filter by year

---

#### `POST /v1/gift-history`
Log a gift manually.

---

#### `POST /v1/gift-history/:id/thank-you`
Send thank you note.

**Body**:
```json
{
  "message": "Thank you so much for the..."
}
```

---

### Price Alerts

#### `POST /v1/items/:id/price-alert`
Enable price tracking on an item.

**Body**:
```json
{
  "target_price": 199.99  // optional
}
```

---

#### `DELETE /v1/items/:id/price-alert`
Disable price tracking.

---

#### `GET /v1/items/:id/price-history`
Get price history for an item.

**Response**:
```json
{
  "history": [
    { "price": 249.99, "recorded_at": "2024-01-01" },
    { "price": 229.99, "recorded_at": "2024-01-15" }
  ]
}
```
