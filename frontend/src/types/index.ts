export type ChangeStatus = 
  | "created" 
  | "planned" 
  | "applied" 
  | "tested" 
  | "rolled_back"

export type UserRole = "admin" | "user"

export interface User {
  id: number
  name: string
  email: string
  telegram_chat_id: string | null
  role: UserRole
  created_at: string
}

export interface System {
  id: number
  name: string
  description: string | null
}

export interface Segment {
  id: number
  name: string
  system_id: number
  description: string | null
  requires_restart: boolean
}

export interface Change {
  id: number
  title: string
  description: string | null
  status: ChangeStatus
  system_id: number
  segment_id: number | null
  responsible_id: number
  planned_at: string | null
  created_at: string
  updated_at: string
}

export interface Token {
  access_token: string
  token_type: string
}