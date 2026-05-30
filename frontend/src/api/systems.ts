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

export const createSegment = async (system_id: number, name: string): Promise<Segment> => {
  const response = await client.post(`/systems/${system_id}/segments`, { name, system_id })
  return response.data
}