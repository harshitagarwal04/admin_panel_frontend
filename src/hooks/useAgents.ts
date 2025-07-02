'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AgentAPI } from '@/lib/agent-api'
import { Agent } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

// Query Keys
export const agentKeys = {
  all: ['agents'] as const,
  lists: () => [...agentKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...agentKeys.lists(), filters] as const,
  details: () => [...agentKeys.all, 'detail'] as const,
  detail: (id: string) => [...agentKeys.details(), id] as const,
  voices: () => [...agentKeys.all, 'voices'] as const,
}

// Get all agents with caching
export function useAgents() {
  const { tokens } = useAuth()
  
  return useQuery({
    queryKey: agentKeys.lists(),
    queryFn: async () => {
      if (!tokens?.access_token) {
        throw new Error('No access token available')
      }
      
      const agents = await AgentAPI.getAgents(tokens.access_token)
      return { agents }
    },
    enabled: !!tokens?.access_token,
    staleTime: 15 * 60 * 1000, // 15 minutes - agents don't change frequently
    gcTime: 30 * 60 * 1000, // 30 minutes in cache
  })
}

// Get single agent
export function useAgent(agentId: string) {
  const { tokens } = useAuth()
  
  return useQuery({
    queryKey: agentKeys.detail(agentId),
    queryFn: () => AgentAPI.getAgent(agentId, tokens?.access_token || ''),
    enabled: !!tokens?.access_token && !!agentId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Get voices (cached separately for reuse)
export function useVoices() {
  const { tokens } = useAuth()
  
  return useQuery({
    queryKey: agentKeys.voices(),
    queryFn: () => AgentAPI.getVoices(tokens?.access_token || ''),
    enabled: !!tokens?.access_token,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - voices are static
    gcTime: 48 * 60 * 60 * 1000, // 48 hours in cache
  })
}

// Create agent mutation
export function useCreateAgent() {
  const queryClient = useQueryClient()
  const { tokens } = useAuth()

  return useMutation({
    mutationFn: (agentData: Agent) => 
      AgentAPI.createAgent(agentData, tokens?.access_token || ''),
    onSuccess: (newAgent) => {
      // Add to agents list cache immediately (optimistic update)
      queryClient.setQueryData(agentKeys.lists(), (old: any) => {
        if (!old) return old
        return {
          ...old,
          agents: [...old.agents, newAgent]
        }
      })
      
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() })
    },
    onError: () => {
      // On error, invalidate to refetch correct data
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() })
    }
  })
}

// Update agent mutation
export function useUpdateAgent() {
  const queryClient = useQueryClient()
  const { tokens } = useAuth()

  return useMutation({
    mutationFn: ({ agentId, agentData }: { agentId: string, agentData: Partial<Agent> }) => {
      
      return AgentAPI.updateAgent(agentId, agentData, tokens?.access_token || '')
    },
    onMutate: async ({ agentId, agentData }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: agentKeys.lists() })
      await queryClient.cancelQueries({ queryKey: agentKeys.detail(agentId) })

      // Snapshot previous values
      const previousAgents = queryClient.getQueryData(agentKeys.lists())
      const previousAgent = queryClient.getQueryData(agentKeys.detail(agentId))

      // Optimistically update agents list
      queryClient.setQueryData(agentKeys.lists(), (old: any) => {
        if (!old || !Array.isArray(old.agents)) return old
        return {
          ...old,
          agents: old.agents.map((agent: Agent) => 
            agent.id === agentId ? { ...agent, ...agentData } : agent
          )
        }
      })

      // Optimistically update single agent
      queryClient.setQueryData(agentKeys.detail(agentId), (old: Agent) => 
        old ? { ...old, ...agentData } : old
      )

      return { previousAgents, previousAgent }
    },
    onError: (err, variables, context) => {
      console.error('[useUpdateAgent] Mutation error:', err)
      // Rollback optimistic updates
      if (context?.previousAgents) {
        queryClient.setQueryData(agentKeys.lists(), context.previousAgents)
      }
      if (context?.previousAgent) {
        queryClient.setQueryData(agentKeys.detail(variables.agentId), context.previousAgent)
      }
    },
    onSettled: (data, error, { agentId }) => {
      // Ensure consistency by refetching
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(agentId) })
    }
  })
}

// Toggle agent status mutation
export function useToggleAgentStatus() {
  const queryClient = useQueryClient()
  const { tokens } = useAuth()

  return useMutation({
    mutationFn: (agentId: string) => 
      AgentAPI.toggleAgentStatus(agentId, tokens?.access_token || ''),
    onMutate: async (agentId) => {
      await queryClient.cancelQueries({ queryKey: agentKeys.lists() })
      
      const previousAgents = queryClient.getQueryData(agentKeys.lists())
      
      // Optimistically toggle status
      queryClient.setQueryData(agentKeys.lists(), (old: any) => {
        if (!old) return old
        return {
          ...old,
          agents: old.agents.map((agent: Agent) => 
            agent.id === agentId 
              ? { ...agent, status: agent.status === 'active' ? 'inactive' : 'active' }
              : agent
          )
        }
      })
      
      return { previousAgents }
    },
    onError: (err, agentId, context) => {
      if (context?.previousAgents) {
        queryClient.setQueryData(agentKeys.lists(), context.previousAgents)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() })
    }
  })
}

// Delete agent mutation
export function useDeleteAgent() {
  const queryClient = useQueryClient()
  const { tokens } = useAuth()

  return useMutation({
    mutationFn: (agentId: string) => 
      AgentAPI.deleteAgent(agentId, tokens?.access_token || ''),
    onSuccess: (_, agentId) => {
      // Remove from cache immediately
      queryClient.setQueryData(agentKeys.lists(), (old: any) => {
        if (!old) return old
        return {
          ...old,
          agents: old.agents.filter((agent: Agent) => agent.id !== agentId)
        }
      })
      
      // Remove individual agent cache
      queryClient.removeQueries({ queryKey: agentKeys.detail(agentId) })
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() })
    }
  })
}