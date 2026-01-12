import type { ApiError } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Merge with any additional headers from options
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: 'Unknown Error',
        message: 'An unknown error occurred',
        statusCode: response.status,
      }));
      throw new Error(error.message || 'API request failed');
    }

    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }

  // Wishlists
  async getWishlists() {
    const response = await this.request<{ success: boolean; data: { wishlists: import('@/types').Wishlist[] } }>('/wishlists');
    return response.data.wishlists;
  }

  async getWishlist(id: string) {
    const response = await this.request<{ success: boolean; data: import('@/types').Wishlist }>(`/wishlists/${id}`);
    return response.data;
  }

  async createWishlist(data: import('@/types').CreateWishlistInput) {
    const response = await this.request<{ success: boolean; data: import('@/types').Wishlist }>('/wishlists', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async updateWishlist(id: string, data: import('@/types').UpdateWishlistInput) {
    return this.request<import('@/types').Wishlist>(`/wishlists/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteWishlist(id: string) {
    return this.request<void>(`/wishlists/${id}`, {
      method: 'DELETE',
    });
  }

  // Wishlist Sharing
  async getWishlistShares(wishlistId: string) {
    return this.request<{ success: boolean; data: { groups: Array<{ id: string; name: string }>; users: Array<{ id: string; name: string; email: string }>; shareLink: { slug: string; url: string } | null } }>(`/wishlists/${wishlistId}/shares`);
  }

  async shareWishlistWithGroup(wishlistId: string, groupId: string) {
    return this.request<{ success: boolean }>(`/wishlists/${wishlistId}/share/group`, {
      method: 'POST',
      body: JSON.stringify({ groupId }),
    });
  }

  async unshareWishlistFromGroup(wishlistId: string, groupId: string) {
    return this.request<{ success: boolean }>(`/wishlists/${wishlistId}/share/group/${groupId}`, {
      method: 'DELETE',
    });
  }

  // Wishlist Items
  async getWishlistItems(wishlistId: string) {
    return this.request<{ data: import('@/types').WishlistItem[] }>(
      `/wishlists/${wishlistId}/items`
    );
  }

  async addWishlistItem(
    wishlistId: string,
    data: import('@/types').CreateWishlistItemInput
  ) {
    return this.request<import('@/types').WishlistItem>(
      `/wishlists/${wishlistId}/items`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async updateWishlistItem(
    _wishlistId: string,
    itemId: string,
    data: import('@/types').UpdateWishlistItemInput
  ) {
    return this.request<import('@/types').WishlistItem>(
      `/items/${itemId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  }

  async deleteWishlistItem(_wishlistId: string, itemId: string) {
    return this.request<void>(`/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Groups
  async getGroups() {
    return this.request<{ success: boolean; data: { groups: import('@/types').Group[] } }>('/groups');
  }

  async getGroup(id: string) {
    return this.request<{ success: boolean; data: import('@/types').Group }>(`/groups/${id}`);
  }

  async createGroup(data: import('@/types').CreateGroupInput) {
    return this.request<{ success: boolean; data: import('@/types').Group }>('/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGroup(id: string, data: Partial<import('@/types').CreateGroupInput>) {
    return this.request<import('@/types').Group>(`/groups/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteGroup(id: string) {
    return this.request<void>(`/groups/${id}`, {
      method: 'DELETE',
    });
  }

  async generateInviteCode(groupId: string) {
    return this.request<{ success: boolean; data: { inviteCode: string } }>(`/groups/${groupId}/invite-code`, {
      method: 'POST',
    });
  }

  async joinGroup(code: string) {
    return this.request<{ success: boolean; data: { groupId: string; groupName: string; alreadyMember: boolean } }>(`/groups/join/${code}`, {
      method: 'POST',
    });
  }

  async getGroupMembers(groupId: string) {
    return this.request<{ success: boolean; data: { members: Array<{ id: string; name: string; email: string; avatarUrl?: string; role: string; joinedAt: string }> } }>(`/groups/${groupId}/members`);
  }

  async removeGroupMember(groupId: string, userId: string) {
    return this.request<void>(`/groups/${groupId}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  async getGroupWishlists(groupId: string) {
    return this.request<{ success: boolean; data: { wishlists: Array<{ id: string; title: string; type: string; owner: { id: string; name: string; avatarUrl?: string }; itemCount: number; sharedAt: string }> } }>(`/groups/${groupId}/wishlists`);
  }

  // Exchanges
  async getExchanges() {
    return this.request<{ success: boolean; data: { exchanges: import('@/types').Exchange[] } }>('/exchanges');
  }

  async getExchange(id: string) {
    return this.request<{ success: boolean; data: import('@/types').Exchange }>(`/exchanges/${id}`);
  }

  async createExchange(data: import('@/types').CreateExchangeInput) {
    return this.request<{ success: boolean; data: import('@/types').Exchange }>('/exchanges', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExchange(id: string, data: Partial<import('@/types').CreateExchangeInput>) {
    return this.request<{ success: boolean; data: import('@/types').Exchange }>(`/exchanges/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteExchange(id: string) {
    return this.request<{ success: boolean }>(`/exchanges/${id}`, {
      method: 'DELETE',
    });
  }

  async drawNames(exchangeId: string) {
    return this.request<{ success: boolean; message: string }>(
      `/exchanges/${exchangeId}/draw`,
      {
        method: 'POST',
      }
    );
  }

  async getMyAssignment(exchangeId: string) {
    return this.request<{ success: boolean; data: { receiver: { id: string; name: string; wishlistId?: string; wishlistTitle?: string } | null; hasRevealed: boolean } }>(
      `/exchanges/${exchangeId}/my-assignment`
    );
  }

  async addParticipant(exchangeId: string, data: { name: string; email?: string; phone?: string }) {
    return this.request<{ success: boolean; data: { participant: import('@/types').ExchangeParticipant; magicLink: string } }>(
      `/exchanges/${exchangeId}/participants`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async removeParticipant(exchangeId: string, participantId: string) {
    return this.request<{ success: boolean }>(
      `/exchanges/${exchangeId}/participants/${participantId}`,
      {
        method: 'DELETE',
      }
    );
  }

  async getExclusions(exchangeId: string) {
    return this.request<{ success: boolean; data: { exclusions: Array<{ id: string; participantA: { id: string; name: string }; participantB: { id: string; name: string }; reason?: string }> } }>(
      `/exchanges/${exchangeId}/exclusions`
    );
  }

  async addExclusion(exchangeId: string, data: { participantAId: string; participantBId: string; reason?: string }) {
    return this.request<{ success: boolean; data: import('@/types').ExchangeExclusion }>(
      `/exchanges/${exchangeId}/exclusions`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async removeExclusion(exchangeId: string, exclusionId: string) {
    return this.request<{ success: boolean }>(
      `/exchanges/${exchangeId}/exclusions/${exclusionId}`,
      {
        method: 'DELETE',
      }
    );
  }

  async revealAssignment(exchangeId: string) {
    return this.request<{ success: boolean }>(
      `/exchanges/${exchangeId}/reveal`,
      {
        method: 'POST',
      }
    );
  }

  // Reservations (for gift-givers, not owners)
  async reserveItem(itemId: string, quantity?: number) {
    return this.request<import('@/types').Reservation>(`/items/${itemId}/reserve`, {
      method: 'POST',
      body: JSON.stringify({ quantity: quantity || 1 }),
    });
  }

  async unreserveItem(itemId: string) {
    return this.request<void>(`/items/${itemId}/reserve`, {
      method: 'DELETE',
    });
  }

  async markAsPurchased(itemId: string) {
    return this.request<import('@/types').Reservation>(`/items/${itemId}/reserve`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'purchased' }),
    });
  }

  // Sharing
  async generateShareLink(wishlistId: string) {
    const response = await this.request<{ success: boolean; data: { shareSlug: string; shareUrl: string } }>(
      `/wishlists/${wishlistId}/share-link`,
      { method: 'POST' }
    );
    return response.data;
  }

  async revokeShareLink(wishlistId: string) {
    return this.request<void>(`/wishlists/${wishlistId}/share-link`, {
      method: 'DELETE',
    });
  }

  async getSharedWishlist(slug: string) {
    const response = await this.request<{ success: boolean; data: import('@/types').Wishlist }>(
      `/public/lists/${slug}`
    );
    return response.data;
  }

  // Magic Links
  async verifyMagicLink(token: string) {
    return this.request<{
      success: boolean;
      data: {
        type: 'exchange';
        exchange: {
          id: string;
          name: string;
          description?: string;
          status: string;
          exchangeDate?: string;
        };
        participant: {
          id: string;
          name: string;
          hasRevealed: boolean;
        };
        assignment?: {
          receiver: {
            id: string;
            name: string;
            wishlistId?: string;
            wishlistTitle?: string;
          };
        };
      };
    }>(`/magic/${token}`);
  }

  async revealMagicLinkAssignment(token: string) {
    return this.request<{ success: boolean }>(`/magic/${token}/reveal`, {
      method: 'POST',
    });
  }

  // AI Suggestions
  async getGiftSuggestions(params: {
    recipientName?: string;
    occasion?: string;
    budget?: number;
    interests?: string[];
  }) {
    return this.request<{ suggestions: Array<{ name: string; description: string; priceRange: string; reason: string }> }>(
      '/ai/suggestions',
      {
        method: 'POST',
        body: JSON.stringify(params),
      }
    );
  }
}

export const api = new ApiClient(API_BASE_URL);
