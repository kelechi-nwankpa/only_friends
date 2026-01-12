'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/lib/api';
import type { CreateGroupInput } from '@/types';

export function useGroups() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const token = await getToken();
      api.setToken(token);
      const response = await api.getGroups();
      return response.data.groups;
    },
    enabled: isLoaded && isSignedIn,
  });
}

export function useGroup(id: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['groups', id],
    queryFn: async () => {
      const token = await getToken();
      api.setToken(token);
      const response = await api.getGroup(id);
      return response.data;
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
      const response = await api.createGroup(data);
      return response.data;
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

export function useGenerateInviteCode() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (groupId: string) => {
      const token = await getToken();
      api.setToken(token);
      const response = await api.generateInviteCode(groupId);
      return response.data;
    },
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
    },
  });
}

export function useJoinGroup() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (code: string) => {
      const token = await getToken();
      api.setToken(token);
      const response = await api.joinGroup(code);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useGroupMembers(groupId: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['groups', groupId, 'members'],
    queryFn: async () => {
      const token = await getToken();
      api.setToken(token);
      const response = await api.getGroupMembers(groupId);
      return response.data.members;
    },
    enabled: !!groupId,
  });
}

export function useRemoveGroupMember() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ groupId, userId }: { groupId: string; userId: string }) => {
      const token = await getToken();
      api.setToken(token);
      return api.removeGroupMember(groupId, userId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId, 'members'] });
    },
  });
}

export function useGroupWishlists(groupId: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['groups', groupId, 'wishlists'],
    queryFn: async () => {
      const token = await getToken();
      api.setToken(token);
      const response = await api.getGroupWishlists(groupId);
      return response.data.wishlists;
    },
    enabled: !!groupId,
  });
}
