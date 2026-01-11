-- ============================================================================
-- WISHLIST APP — COMPLETE DATABASE SCHEMA
-- ============================================================================
-- Database: PostgreSQL
-- ORM: Prisma (this SQL is for reference; Prisma schema is source of truth)
-- ============================================================================

-- ============================================
-- USERS
-- Synced from Clerk via webhook
-- ============================================
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id        TEXT UNIQUE NOT NULL,           -- Clerk user ID (user_xxx)
  email           TEXT UNIQUE,                     -- May be null for Magic Link guests initially
  name            TEXT NOT NULL,
  avatar_url      TEXT,
  is_premium      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- WISHLISTS
-- ============================================
CREATE TABLE wishlists (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  type            TEXT DEFAULT 'general',          -- 'general', 'birthday', 'christmas', 'wedding', 'baby', 'home'
  visibility      TEXT NOT NULL DEFAULT 'private', -- 'private', 'shared', 'public'
  share_slug      TEXT UNIQUE,                     -- For shareable links: /list/abc123
  is_archived     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wishlists_owner ON wishlists(owner_id);
CREATE INDEX idx_wishlists_share_slug ON wishlists(share_slug);

-- ============================================
-- WISHLIST ITEMS
-- ============================================
CREATE TABLE wishlist_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id     UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  url             TEXT,                            -- Nullable (manual items have no URL)
  image_url       TEXT,
  price           DECIMAL(10,2),                   -- Nullable
  currency        TEXT DEFAULT 'USD',
  notes           TEXT,                            -- Owner's notes ("size medium", "the blue one")
  priority        TEXT DEFAULT 'medium',           -- 'low', 'medium', 'high'
  position        INTEGER NOT NULL DEFAULT 0,      -- For drag-and-drop ordering
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_items_wishlist ON wishlist_items(wishlist_id);

-- ============================================
-- PRICE HISTORY
-- For price drop alerts
-- ============================================
CREATE TABLE price_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id         UUID NOT NULL REFERENCES wishlist_items(id) ON DELETE CASCADE,
  price           DECIMAL(10,2) NOT NULL,
  currency        TEXT DEFAULT 'USD',
  recorded_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_price_history_item ON price_history(item_id);
CREATE INDEX idx_price_history_recorded ON price_history(recorded_at);

-- ============================================
-- PRICE ALERTS
-- Users opt-in to track specific items
-- ============================================
CREATE TABLE price_alerts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id         UUID NOT NULL REFERENCES wishlist_items(id) ON DELETE CASCADE,
  target_price    DECIMAL(10,2),                   -- Optional: alert only below this price
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, item_id)
);

-- ============================================
-- RESERVATIONS
-- CRITICAL: Owner must NEVER see this data
-- ============================================
CREATE TABLE reservations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id         UUID UNIQUE NOT NULL REFERENCES wishlist_items(id) ON DELETE CASCADE,
  reserver_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'reserved', -- 'reserved', 'purchased'
  notes           TEXT,                             -- Private notes for the giver
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Note: UNIQUE on item_id ensures only one person can reserve

-- ============================================
-- GROUPS
-- ============================================
CREATE TABLE groups (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  avatar_url      TEXT,
  created_by      UUID NOT NULL REFERENCES users(id),
  invite_code     TEXT UNIQUE,                     -- For invite links: /groups/join/abc123
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_groups_invite_code ON groups(invite_code);

-- ============================================
-- GROUP MEMBERS
-- ============================================
CREATE TABLE group_members (
  group_id        UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            TEXT DEFAULT 'member',           -- 'admin', 'member'
  joined_at       TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (group_id, user_id)
);

CREATE INDEX idx_group_members_user ON group_members(user_id);

-- ============================================
-- WISHLIST SHARING — GROUPS
-- Share a wishlist with an entire group
-- ============================================
CREATE TABLE wishlist_group_shares (
  wishlist_id     UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  group_id        UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  shared_at       TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (wishlist_id, group_id)
);

-- ============================================
-- WISHLIST SHARING — DIRECT USERS
-- Share a wishlist with a specific individual (1-on-1)
-- ============================================
CREATE TABLE wishlist_user_shares (
  wishlist_id     UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shared_by       UUID NOT NULL REFERENCES users(id),
  shared_at       TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (wishlist_id, user_id)
);

CREATE INDEX idx_wishlist_user_shares_user ON wishlist_user_shares(user_id);

-- ============================================
-- EXCHANGES (Secret Santa)
-- ============================================
CREATE TABLE exchanges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id        UUID REFERENCES groups(id) ON DELETE SET NULL, -- Optional, can be standalone
  name            TEXT NOT NULL,
  description     TEXT,
  budget_min      DECIMAL(10,2),
  budget_max      DECIMAL(10,2),
  currency        TEXT DEFAULT 'USD',
  draw_date       DATE,                            -- When names will be drawn
  exchange_date   DATE,                            -- When gifts are exchanged
  status          TEXT DEFAULT 'open',             -- 'open', 'drawn', 'completed', 'archived'
  is_incognito    BOOLEAN DEFAULT FALSE,           -- Auto-delete after event
  incognito_delete_at TIMESTAMPTZ,                 -- When to delete if incognito
  created_by      UUID NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_exchanges_status ON exchanges(status);
CREATE INDEX idx_exchanges_incognito ON exchanges(is_incognito, incognito_delete_at);

-- ============================================
-- EXCHANGE PARTICIPANTS
-- ============================================
CREATE TABLE exchange_participants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exchange_id     UUID NOT NULL REFERENCES exchanges(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE, -- Nullable for Magic Link guests
  name            TEXT NOT NULL,                   -- Display name
  email           TEXT,                            -- For notifications
  phone           TEXT,                            -- For SMS notifications
  wishlist_id     UUID REFERENCES wishlists(id) ON DELETE SET NULL,
  has_revealed    BOOLEAN DEFAULT FALSE,           -- Have they seen their assignment?
  joined_at       TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(exchange_id, user_id)
);

CREATE INDEX idx_exchange_participants_exchange ON exchange_participants(exchange_id);

-- ============================================
-- MAGIC LINK TOKENS
-- Frictionless participation without account
-- ============================================
CREATE TABLE magic_link_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token           TEXT UNIQUE NOT NULL,            -- Secure random token
  exchange_id     UUID NOT NULL REFERENCES exchanges(id) ON DELETE CASCADE,
  participant_id  UUID NOT NULL REFERENCES exchange_participants(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id),       -- Linked if they create an account
  expires_at      TIMESTAMPTZ NOT NULL,
  used_at         TIMESTAMPTZ,                     -- Track first use
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_magic_link_token ON magic_link_tokens(token);
CREATE INDEX idx_magic_link_expires ON magic_link_tokens(expires_at);

-- ============================================
-- EXCHANGE EXCLUSIONS
-- "Don't match these two people"
-- ============================================
CREATE TABLE exchange_exclusions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exchange_id     UUID NOT NULL REFERENCES exchanges(id) ON DELETE CASCADE,
  participant_a   UUID NOT NULL REFERENCES exchange_participants(id) ON DELETE CASCADE,
  participant_b   UUID NOT NULL REFERENCES exchange_participants(id) ON DELETE CASCADE,
  reason          TEXT,                            -- 'spouse', 'same_household', 'custom'

  UNIQUE(exchange_id, participant_a, participant_b)
);

-- ============================================
-- EXCHANGE ASSIGNMENTS
-- Who gives to whom
-- CRITICAL: Only giver sees their own assignment
-- ============================================
CREATE TABLE exchange_assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exchange_id     UUID NOT NULL REFERENCES exchanges(id) ON DELETE CASCADE,
  giver_id        UUID NOT NULL REFERENCES exchange_participants(id) ON DELETE CASCADE,
  receiver_id     UUID NOT NULL REFERENCES exchange_participants(id) ON DELETE CASCADE,

  UNIQUE(exchange_id, giver_id)
);

-- ============================================
-- GIFT HISTORY
-- Track gifts given and received over time
-- ============================================
CREATE TABLE gift_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  giver_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_title      TEXT NOT NULL,
  item_url        TEXT,
  image_url       TEXT,
  price           DECIMAL(10,2),
  currency        TEXT DEFAULT 'USD',
  exchange_id     UUID REFERENCES exchanges(id) ON DELETE SET NULL,
  occasion        TEXT,                            -- 'christmas', 'birthday', 'other'
  gifted_at       DATE DEFAULT CURRENT_DATE,
  notes           TEXT,
  thank_you_sent  BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gift_history_giver ON gift_history(giver_id);
CREATE INDEX idx_gift_history_receiver ON gift_history(receiver_id);
CREATE INDEX idx_gift_history_date ON gift_history(gifted_at);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,                   -- See notification types below
  title           TEXT NOT NULL,
  body            TEXT,
  data            JSONB,                           -- Flexible payload (exchange_id, item_id, etc.)
  is_read         BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE NOT is_read;

-- Notification types:
-- 'exchange_invite'     — Invited to an exchange
-- 'names_drawn'         — Names have been drawn in an exchange
-- 'item_reserved'       — Someone reserved an item (to other givers only)
-- 'price_drop'          — Price dropped on a tracked item
-- 'exchange_reminder'   — Exchange date approaching
-- 'thank_you_received'  — Someone sent a thank you note
-- 'group_invite'        — Invited to a group

-- ============================================
-- PUSH TOKENS
-- For mobile push notifications
-- ============================================
CREATE TABLE push_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token           TEXT NOT NULL,
  platform        TEXT NOT NULL,                   -- 'ios', 'android', 'web'
  device_name     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, token)
);

CREATE INDEX idx_push_tokens_user ON push_tokens(user_id);

-- ============================================
-- CHAT MESSAGES
-- Ephemeral group chat for exchanges
-- ============================================
CREATE TABLE chat_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exchange_id     UUID NOT NULL REFERENCES exchanges(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message         TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_exchange ON chat_messages(exchange_id);
CREATE INDEX idx_chat_created ON chat_messages(exchange_id, created_at);

-- ============================================
-- AI GIFT SUGGESTIONS
-- Cache AI-generated suggestions
-- ============================================
CREATE TABLE ai_gift_suggestions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt          TEXT NOT NULL,
  suggestions     JSONB NOT NULL,                  -- Array of suggestion objects
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_suggestions_user ON ai_gift_suggestions(user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER wishlists_updated_at
  BEFORE UPDATE ON wishlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER wishlist_items_updated_at
  BEFORE UPDATE ON wishlist_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER exchanges_updated_at
  BEFORE UPDATE ON exchanges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
