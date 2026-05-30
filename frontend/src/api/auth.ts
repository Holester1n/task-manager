import client from "./client"
import type { Token, User } from "../types/index.ts"

export const register = async (name: string, email: string, password: string): Promise<User> => {
  const response = await client.post("/users/register", { name, email, password })
  return response.data
}

export const login = async (email: string, password: string): Promise<Token> => {
  const response = await client.post("/users/login", { name: "", email, password })
  return response.data
}