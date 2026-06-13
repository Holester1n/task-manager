import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getUsers, assignRole } from "../api/users"
import { getRoles } from "../api/roles"
import type { User, Role } from "../types"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [usersData, rolesData] = await Promise.all([getUsers(), getRoles()])
    setUsers(usersData)
    setRoles(rolesData)
  }

  const handleAssignRole = async (userId: number, roleId: number) => {
    await assignRole(userId, roleId)
    loadData()
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate("/changes")} className="text-gray-400 hover:text-white transition">← Назад</button>
          <h1 className="text-2xl font-bold">Пользователи</h1>
        </div>

        <div className="flex flex-col gap-3">
          {users.map((user) => (
            <div key={user.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Роль: <span className="text-gray-300">{user.role?.name ?? "не назначена"}</span>
                  </p>
                </div>
                <select
                  value={user.role?.id ?? ""}
                  onChange={(e) => handleAssignRole(user.id, Number(e.target.value))}
                  className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none"
                >
                  <option value="">Без роли</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}