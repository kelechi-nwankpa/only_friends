export interface User {
  id: string;
  clerkId: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Wishlist {
  id: string;
  title: string;
  description?: string;
  type?: string;
  visibility?: 'private' | 'public' | 'shared';
  isPublic?: boolean;
  isArchived?: boolean;
  ownerId?: string;
  owner?: User;
  isOwner?: boolean;
  items?: WishlistItem[];
  shares?: WishlistShare[];
  shareSlug?: string;
  createdAt: string;
  updatedAt: string;
  itemCount?: number;
  _count?: {
    items: number;
    shares: number;
  };
}

export interface WishlistItem {
  id: string;
  title: string;
  notes?: string;
  url?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  priority?: 'low' | 'medium' | 'high';
  position?: number;
  wishlistId: string;
  createdAt: string;
  updatedAt: string;
  reservation?: {
    status: string;
    reserver?: { id: string; clerkId?: string; name: string };
  } | null;
}

export interface WishlistShare {
  id: string;
  wishlistId: string;
  sharedWithId?: string;
  sharedWith?: User;
  email?: string;
  permission: 'VIEW' | 'EDIT';
  token?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface Reservation {
  id: string;
  itemId: string;
  item?: WishlistItem;
  reservedById: string;
  reservedBy?: User;
  quantity: number;
  isPurchased: boolean;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  inviteCode?: string;
  createdById?: string;
  createdBy?: User;
  members?: Array<{
    id: string;
    name?: string;
    email?: string;
    avatarUrl?: string;
    role: string;
    joinedAt: string;
  }>;
  wishlists?: GroupWishlist[];
  createdAt?: string;
  updatedAt?: string;
  memberCount?: number;
  myRole?: string;
  role?: string;
  joinedAt?: string;
  _count?: {
    members: number;
    wishlists: number;
  };
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  user?: User;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: string;
}

export interface GroupWishlist {
  id: string;
  groupId: string;
  wishlistId: string;
  wishlist?: Wishlist;
  addedAt: string;
}

export interface Exchange {
  id: string;
  name: string;
  description?: string;
  exchangeDate?: string;
  status: 'open' | 'drawn' | 'completed' | 'archived';
  groupId?: string;
  group?: { id: string; name: string };
  createdById?: string;
  createdBy?: User;
  participants?: ExchangeParticipant[];
  exclusions?: ExchangeExclusion[];
  exclusionCount?: number;
  isIncognito?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Budget can come in two formats from backend
  budget?: number | { min?: number; max?: number; currency?: string };
  currency?: string;
  // Dates can come in different format
  dates?: { draw?: string; exchange?: string };
  // For list view
  participantCount?: number;
  hasRevealed?: boolean;
  _count?: {
    participants: number;
    exclusions: number;
  };
}

export interface ExchangeParticipant {
  id: string;
  exchangeId?: string;
  userId?: string;
  user?: { id: string; name?: string; avatarUrl?: string };
  name: string;
  email?: string;
  phone?: string;
  wishlistId?: string;
  wishlist?: { id: string; title: string };
  hasWishlist?: boolean;
  hasJoined?: boolean;
  hasRevealed?: boolean;
  magicLink?: string;
  assignedToId?: string;
  assignedTo?: ExchangeParticipant;
  joinedAt?: string;
}

export interface ExchangeExclusion {
  id: string;
  exchangeId?: string;
  participantA?: { id: string; name: string };
  participantB?: { id: string; name: string };
  participantAId?: string;
  participantBId?: string;
  reason?: string;
}

export interface MagicLink {
  id: string;
  token: string;
  type: 'WISHLIST_VIEW' | 'WISHLIST_EDIT' | 'EXCHANGE_JOIN' | 'GROUP_INVITE';
  resourceId: string;
  email?: string;
  name?: string;
  usedAt?: string;
  expiresAt: string;
  createdAt: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type CreateWishlistInput = {
  title: string;
  description?: string;
  type?: 'general' | 'birthday' | 'christmas' | 'wedding' | 'baby' | 'home';
  visibility?: 'private' | 'shared' | 'public';
};

export type UpdateWishlistInput = Partial<CreateWishlistInput>;

export type CreateWishlistItemInput = {
  title: string;
  notes?: string;
  url?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  priority?: 'low' | 'medium' | 'high';
};

export type UpdateWishlistItemInput = Partial<CreateWishlistItemInput>;

export type CreateGroupInput = {
  name: string;
  description?: string;
};

export type CreateExchangeInput = {
  name: string;
  description?: string;
  exchangeDate?: string;
  budget?: number;
  currency?: string;
  groupId?: string;
};
