'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/lib/api';
import type { CreateExchangeInput } from '@/types';

export function useExchanges() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ['exchanges'],
    queryFn: async () => {
      const token = await getToken();
      api.setToken(token);
      const response = await api.getExchanges();
      return response.data?.exchanges || response.data || [];
    },
    enabled: isLoaded && isSignedIn,
  });
}

export function useExchange(id: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['exchanges', id],
    queryFn: async () => {
      const token = await getToken();
      api.setToken(token);
      const response = await api.getExchange(id);
      return response.data || response;
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
      queryClient.invalidateQueries({ queryKey: ['exchanges'] });
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
      const response = await api.getMyAssignment(exchangeId);
      return response.data || response;
    },
    enabled: !!exchangeId,
  });
}

export function useAddParticipant() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({
      exchangeId,
      name,
      email,
      phone,
    }: {
      exchangeId: string;
      name: string;
      email?: string;
      phone?: string;
    }) => {
      const token = await getToken();
      api.setToken(token);
      const response = await api.addParticipant(exchangeId, { name, email, phone });
      return response.data || response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exchanges', variables.exchangeId] });
    },
  });
}

export function useRemoveParticipant() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({
      exchangeId,
      participantId,
    }: {
      exchangeId: string;
      participantId: string;
    }) => {
      const token = await getToken();
      api.setToken(token);
      return api.removeParticipant(exchangeId, participantId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exchanges', variables.exchangeId] });
    },
  });
}

export function useExclusions(exchangeId: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['exchanges', exchangeId, 'exclusions'],
    queryFn: async () => {
      const token = await getToken();
      api.setToken(token);
      const response = await api.getExclusions(exchangeId);
      return response.data?.exclusions || [];
    },
    enabled: !!exchangeId,
  });
}

export function useAddExclusion() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({
      exchangeId,
      participantAId,
      participantBId,
      reason,
    }: {
      exchangeId: string;
      participantAId: string;
      participantBId: string;
      reason?: string;
    }) => {
      const token = await getToken();
      api.setToken(token);
      return api.addExclusion(exchangeId, { participantAId, participantBId, reason });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exchanges', variables.exchangeId, 'exclusions'] });
      queryClient.invalidateQueries({ queryKey: ['exchanges', variables.exchangeId] });
    },
  });
}

export function useRemoveExclusion() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({
      exchangeId,
      exclusionId,
    }: {
      exchangeId: string;
      exclusionId: string;
    }) => {
      const token = await getToken();
      api.setToken(token);
      return api.removeExclusion(exchangeId, exclusionId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exchanges', variables.exchangeId, 'exclusions'] });
      queryClient.invalidateQueries({ queryKey: ['exchanges', variables.exchangeId] });
    },
  });
}

export function useRevealAssignment() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (exchangeId: string) => {
      const token = await getToken();
      api.setToken(token);
      return api.revealAssignment(exchangeId);
    },
    onSuccess: (_, exchangeId) => {
      queryClient.invalidateQueries({ queryKey: ['exchanges', exchangeId, 'assignment'] });
    },
  });
}
