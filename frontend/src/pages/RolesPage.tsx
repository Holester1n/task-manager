import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getRoles, createRole, deleteRole, setRoleSystems } from "../api/roles"
import { getSystems } from "../api/systems"
import type { Role, System } from "../types"

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [systems, setSystems] = useState<System[]>([])
  const [newRoleName, setNewRoleName] = useState("")
  const [selectedSystems, setSelectedSystems] = useState<Record<number, number[]>>({})
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [rolesData, systemsData] = await Promise.all([getRoles(), getSystems()])
    setRoles(rolesData)
    setSystems(systemsData)
  }

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return
    await createRole(newRoleName.trim())
    setNewRoleName("")
    loadData()
  }

  const handleDeleteRole = async (id: number) => {
    if (confirm("Удалить роль?")) {
      await deleteRole(id)
      loadData()
    }
  }

  const handleToggleSystem = (roleId: number, systemId: number) => {
    setSelectedSystems(prev => {
      const current = prev[roleId] || []
      const updated = current.includes(systemId)
        ? current.filter(id => id !== systemId)
        : [...current, systemId]
      return { ...prev, [roleId]: updated }
    })
  }

  const handleSaveAccess = async (roleId: number) => {
    await setRoleSystems(roleId, selectedSystems[roleId] || [])
    alert("Доступ сохранён")
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate("/changes")} className="text-gray-400 hover:text-white transition">← Назад</button>
          <h1 className="text-2xl font-bold">Роли</h1>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
          <h3 className="font-semibold mb-4">Новая роль</h3>
          <div className="flex gap-2">
            <input
              placeholder="Название роли"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition text-sm flex-1"
            />
            <button onClick={handleCreateRole} className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition">
              Создать
            </button>
          </div>
        </div>

        {roles.map((role) => (
          <div key={role.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">{role.name}</h3>
              {role.name !== "admin" && (
                <button onClick={() => handleDeleteRole(role.id)} className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-sm transition">
                  Удалить
                </button>
              )}
            </div>

            {role.name === "admin" ? (
              <p className="text-sm text-gray-400">Админ имеет доступ ко всем системам</p>
            ) : (
              <>
                <p className="text-sm text-gray-400 mb-3">Доступ к системам:</p>
                <div className="flex flex-col gap-2 mb-4">
                  {systems.map((system) => (
                    <label key={system.id} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(selectedSystems[role.id] || []).includes(system.id)}
                        onChange={() => handleToggleSystem(role.id, system.id)}
                        className="w-4 h-4"
                      />
                      {system.name}
                    </label>
                  ))}
                </div>
                <button onClick={() => handleSaveAccess(role.id)} className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition">
                  Сохранить доступ
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}