export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Wishlist {
  id: string;
  title: string;
  description?: string;
  occasion?: string;
  eventDate?: string;
  isPublic: boolean;
  ownerId: string;
  owner?: User;
  items?: WishlistItem[];
  shares?: WishlistShare[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    items: number;
    shares: number;
  };
}

export interface WishlistItem {
  id: string;
  name: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  price?: number;
  currency: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  quantity: number;
  wishlistId: string;
  createdAt: string;
  updatedAt: string;
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
  createdById: string;
  createdBy?: User;
  members?: GroupMember[];
  wishlists?: GroupWishlist[];
  createdAt: string;
  updatedAt: string;
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
  budget?: number;
  currency: string;
  status: 'DRAFT' | 'ACTIVE' | 'DRAWING_COMPLETE' | 'COMPLETED' | 'CANCELLED';
  groupId?: string;
  group?: Group;
  createdById: string;
  createdBy?: User;
  participants?: ExchangeParticipant[];
  exclusions?: ExchangeExclusion[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    participants: number;
    exclusions: number;
  };
}

export interface ExchangeParticipant {
  id: string;
  exchangeId: string;
  userId?: string;
  user?: User;
  name: string;
  email?: string;
  wishlistId?: string;
  wishlist?: Wishlist;
  assignedToId?: string;
  assignedTo?: ExchangeParticipant;
  joinedAt: string;
}

export interface ExchangeExclusion {
  id: string;
  exchangeId: string;
  participantId: string;
  participant?: ExchangeParticipant;
  excludedParticipantId: string;
  excludedParticipant?: ExchangeParticipant;
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
  occasion?: string;
  eventDate?: string;
  isPublic?: boolean;
};

export type UpdateWishlistInput = Partial<CreateWishlistInput>;

export type CreateWishlistItemInput = {
  name: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  quantity?: number;
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
