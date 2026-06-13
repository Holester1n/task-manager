import client from "./client"
import type { System, Segment } from "../types"

export const getSystems = async (): Promise<System[]> => {
  const response = await client.get("/systems/")
  return response.data
}

export const createSystem = async (name: string, description?: string): Promise<System> => {
  const response = await client.post("/systems/", { name, description })
  return response.data
}

export const getSegments = async (system_id: number): Promise<Segment[]> => {
  const response = await client.get(`/systems/${system_id}/segments`)
  return response.data
}

export const createSegment = async (system_id: number, name: string, description?: string, requires_restart?: boolean): Promise<Segment> => {
  const response = await client.post(`/systems/${system_id}/segments`, { name, system_id, description, requires_restart })
  return response.data
}

export const getSubscriptions = async (): Promise<{ subscribed_system_ids: number[] }> => {
  const response = await client.get("/subscriptions/")
  return response.data
}

export const subscribe = async (system_id: number): Promise<void> => {
  await client.post(`/subscriptions/${system_id}`)
}

export const unsubscribe = async (system_id: number): Promise<void> => {
  await client.delete(`/subscriptions/${system_id}`)
}

export const updateSystem = async (id: number, name: string, description?: string): Promise<System> => {
  const response = await client.patch(`/systems/${id}`, { name, description })
  return response.data
}

export const deleteSystem = async (id: number): Promise<void> => {
  await client.delete(`/systems/${id}`)
}

export const updateSegment = async (system_id: number, segment_id: number, name: string, description?: string): Promise<Segment> => {
  const response = await client.patch(`/systems/${system_id}/segments/${segment_id}`, { name, system_id, description})
  return response.data
}

export const deleteSegment = async (system_id: number, segment_id: number): Promise<void> => {
  await client.delete(`/systems/${system_id}/segments/${segment_id}`)
}