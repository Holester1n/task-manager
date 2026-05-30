import client from "./client"
import type { Change, ChangeStatus } from "../types"

export const getChanges = async (filters?: {
  system_id?: number
  status?: ChangeStatus
  responsible_id?: number
}): Promise<Change[]> => {
  const response = await client.get("/changes/", { params: filters })
  return response.data
}

export const createChange = async (data: {
  title: string
  description?: string
  system_id: number
  segment_id?: number
  responsible_id: number
  planned_at?: string
}): Promise<Change> => {
  const response = await client.post("/changes/", data)
  return response.data
}

export const updateChange = async (id: number, data: {
  title?: string
  description?: string
  status?: ChangeStatus
  segment_id?: number
  responsible_id?: number
  planned_at?: string
}): Promise<Change> => {
  const response = await client.patch(`/changes/${id}`, data)
  return response.data
}

export const deleteChange = async (id: number): Promise<void> => {
  await client.delete(`/changes/${id}`)
}