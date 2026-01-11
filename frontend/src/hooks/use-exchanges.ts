'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/lib/api';
import type { CreateExchangeInput } from '@/types';

export function useExchanges() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['exchanges'],
    queryFn: async () => {
      const token = await getToken();
      api.setToken(token);
      const response = await api.getExchanges();
      return response.data;
    },
  });
}

export function useExchange(id: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['exchanges', id],
    queryFn: async () => {
      const token = await getToken();
      api.setToken(token);
      return api.getExchange(id);
    },
    enabled: !!id,
  });
}

export function useCreateExchange() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateExchangeInput) => {
      const token = await getToken();
      api.setToken(token);
      return api.createExchange(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchanges'] });
    },
  });
}

export function useUpdateExchange() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateExchangeInput> }) => {
      const token = await getToken();
      api.setToken(token);
      return api.updateExchange(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exchanges'] });
      queryClient.invalidateQueries({ queryKey: ['exchanges', variables.id] });
    },
  });
}

export function useDeleteExchange() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      api.setToken(token);
      return api.deleteExchange(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchanges'] });
    },
  });
}

export function useDrawNames() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (exchangeId: string) => {
      const token = await getToken();
      api.setToken(token);
      return api.drawNames(exchangeId);
    },
    onSuccess: (_, exchangeId) => {
      queryClient.invalidateQueries({ queryKey: ['exchanges', exchangeId] });
    },
  });
}

export function useMyAssignment(exchangeId: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['exchanges', exchangeId, 'assignment'],
    queryFn: async () => {
      const token = await getToken();
      api.setToken(token);
      return api.getMyAssignment(exchangeId);
    },
    enabled: !!exchangeId,
  });
}
