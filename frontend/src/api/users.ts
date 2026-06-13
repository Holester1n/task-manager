import client from "./client"
import type { User } from "../types"

export const getUsers = async (): Promise<User[]> => {
  const response = await client.get("/users/")
  return response.data
}

export const assignRole = async (userId: number, roleId: number): Promise<void> => {
  await client.patch(`/users/${userId}/role`, null, { params: { role_id: roleId } })
}