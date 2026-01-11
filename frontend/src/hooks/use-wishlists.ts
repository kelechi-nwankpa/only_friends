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

export function useShareWishlist() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({
      wishlistId,
      email,
      permission,
    }: {
      wishlistId: string;
      email?: string;
      permission?: 'VIEW' | 'EDIT';
    }) => {
      const token = await getToken();
      api.setToken(token);
      return api.shareWishlist(wishlistId, { email, permission });
    },
  });
}
