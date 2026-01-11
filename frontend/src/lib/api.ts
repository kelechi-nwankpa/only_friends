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
    return this.request<{ data: import('@/types').Group[] }>('/groups');
  }

  async getGroup(id: string) {
    return this.request<import('@/types').Group>(`/groups/${id}`);
  }

  async createGroup(data: import('@/types').CreateGroupInput) {
    return this.request<import('@/types').Group>('/groups', {
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

  async inviteToGroup(groupId: string, email: string) {
    return this.request<{ inviteUrl: string }>(`/groups/${groupId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Exchanges
  async getExchanges() {
    return this.request<{ data: import('@/types').Exchange[] }>('/exchanges');
  }

  async getExchange(id: string) {
    return this.request<import('@/types').Exchange>(`/exchanges/${id}`);
  }

  async createExchange(data: import('@/types').CreateExchangeInput) {
    return this.request<import('@/types').Exchange>('/exchanges', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExchange(id: string, data: Partial<import('@/types').CreateExchangeInput>) {
    return this.request<import('@/types').Exchange>(`/exchanges/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteExchange(id: string) {
    return this.request<void>(`/exchanges/${id}`, {
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
    return this.request<import('@/types').ExchangeParticipant>(
      `/exchanges/${exchangeId}/my-assignment`
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
    return this.request<void>(`/items/${itemId}/unreserve`, {
      method: 'DELETE',
    });
  }

  async markAsPurchased(itemId: string) {
    return this.request<import('@/types').Reservation>(`/items/${itemId}/purchased`, {
      method: 'POST',
    });
  }

  // Sharing
  async shareWishlist(
    wishlistId: string,
    data: { email?: string; permission?: 'VIEW' | 'EDIT' }
  ) {
    return this.request<{ shareUrl: string }>(`/wishlists/${wishlistId}/share`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSharedWishlist(token: string) {
    return this.request<import('@/types').Wishlist>(`/shared/wishlists/${token}`);
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
