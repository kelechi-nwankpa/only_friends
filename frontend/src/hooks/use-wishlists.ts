'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { api } from '@/lib/api';
import type { Wishlist, CreateWishlistInput, UpdateWishlistInput } from '@/types';

export function useWishlists() {
  const { getToken } = useAuth();

  useEffect(() => {
    getToken().then((token) => {
      api.setToken(token);
    });
  }, [getToken]);

  return useQuery({
    queryKey: ['wishlists'],
    queryFn: async () => {
      const token = await getToken();
      api.setToken(token);
      return api.getWishlists();
    },
  });
}

export function useWishlist(id: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['wishlists', id],
    queryFn: async () => {
      const token = await getToken();
      api.setToken(token);
      return api.getWishlist(id);
    },
    enabled: !!id,
  });
}

export function useCreateWishlist() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateWishlistInput) => {
      const token = await getToken();
      api.setToken(token);
      return api.createWishlist(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlists'] });
    },
  });
}

export function useUpdateWishlist() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateWishlistInput }) => {
      const token = await getToken();
      api.setToken(token);
      return api.updateWishlist(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wishlists'] });
      queryClient.invalidateQueries({ queryKey: ['wishlists', variables.id] });
    },
  });
}

export function useDeleteWishlist() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      api.setToken(token);
      return api.deleteWishlist(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlists'] });
    },
  });
}

export function useAddWishlistItem() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({
      wishlistId,
      data,
    }: {
      wishlistId: string;
      data: import('@/types').CreateWishlistItemInput;
    }) => {
      const token = await getToken();
      api.setToken(token);
      return api.addWishlistItem(wishlistId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wishlists', variables.wishlistId] });
    },
  });
}

export function useUpdateWishlistItem() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({
      wishlistId,
      itemId,
      data,
    }: {
      wishlistId: string;
      itemId: string;
      data: import('@/types').UpdateWishlistItemInput;
    }) => {
      const token = await getToken();
      api.setToken(token);
      return api.updateWishlistItem(wishlistId, itemId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wishlists', variables.wishlistId] });
    },
  });
}

export function useDeleteWishlistItem() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({
      wishlistId,
      itemId,
    }: {
      wishlistId: string;
      itemId: string;
    }) => {
      const token = await getToken();
      api.setToken(token);
      return api.deleteWishlistItem(wishlistId, itemId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wishlists', variables.wishlistId] });
    },
  });
}

export function useGenerateShareLink() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (wishlistId: string) => {
      const token = await getToken();
      api.setToken(token);
      return api.generateShareLink(wishlistId);
    },
    onSuccess: (_, wishlistId) => {
      queryClient.invalidateQueries({ queryKey: ['wishlists', wishlistId] });
    },
  });
}

export function useRevokeShareLink() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (wishlistId: string) => {
      const token = await getToken();
      api.setToken(token);
      return api.revokeShareLink(wishlistId);
    },
    onSuccess: (_, wishlistId) => {
      queryClient.invalidateQueries({ queryKey: ['wishlists', wishlistId] });
    },
  });
}

export function useSharedWishlist(slug: string) {
  return useQuery({
    queryKey: ['shared-wishlist', slug],
    queryFn: () => api.getSharedWishlist(slug),
    enabled: !!slug,
  });
}
