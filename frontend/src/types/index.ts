export type ChangeStatus = 
  | "created" 
  | "planned" 
  | "applied" 
  | "tested" 
  | "rolled_back"

export interface Role {
  id: number
  name: string
}

export interface User {
  id: number
  name: string
  email: string
  telegram_chat_id: string | null
  role: Role | null
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
  requires_restart: boolean
}

export interface Token {
  access_token: string
  token_type: string
}