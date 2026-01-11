'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/lib/api';
import type { CreateGroupInput } from '@/types';

export function useGroups() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const token = await getToken();
      api.setToken(token);
      const response = await api.getGroups();
      return response.data;
    },
  });
}

export function useGroup(id: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['groups', id],
    queryFn: async () => {
      const token = await getToken();
      api.setToken(token);
      return api.getGroup(id);
    },
    enabled: !!id,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateGroupInput) => {
      const token = await getToken();
      api.setToken(token);
      return api.createGroup(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateGroupInput> }) => {
      const token = await getToken();
      api.setToken(token);
      return api.updateGroup(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups', variables.id] });
    },
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      api.setToken(token);
      return api.deleteGroup(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useInviteToGroup() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ groupId, email }: { groupId: string; email: string }) => {
      const token = await getToken();
      api.setToken(token);
      return api.inviteToGroup(groupId, email);
    },
  });
}
