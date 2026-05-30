import { useState, useEffect } from "react"
import { getMe } from "../api/auth"
import type { User } from "../types"

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    getMe().then(setUser).catch(() => setUser(null))
  }, [])

  return user
}