import client from "./client"
import type { Role } from "../types"

export const getRoles = async (): Promise<Role[]> => {
  const response = await client.get("/roles/")
  return response.data
}

export const createRole = async (name: string): Promise<Role> => {
  const response = await client.post("/roles/", { name })
  return response.data
}

export const deleteRole = async (id: number): Promise<void> => {
  await client.delete(`/roles/${id}`)
}

export const setRoleSystems = async (roleId: number, systemIds: number[]): Promise<void> => {
  await client.put(`/roles/${roleId}/systems`, { system_ids: systemIds })
}