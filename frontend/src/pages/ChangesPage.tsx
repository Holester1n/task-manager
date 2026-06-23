import { useState, useEffect, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { getChanges, deleteChange, updateChange } from "../api/changes"
import { getSystems } from "../api/systems"
import type { Change, ChangeStatus, System } from "../types"
import { useCurrentUser } from "../hooks/useCurrentUser"

const STATUS_LABELS: Record<ChangeStatus, string> = {
  created: "Создано",
  planned: "Запланировано",
  applied: "Применено",
  tested: "Протестировано",
  rolled_back: "Откатили",
}

const STATUS_COLORS: Record<ChangeStatus, string> = {
  created: "bg-gray-500",
  planned: "bg-blue-600",
  applied: "bg-orange-500",
  tested: "bg-green-600",
  rolled_back: "bg-red-600",
}

export default function ChangesPage() {
  const [changes, setChanges] = useState<Change[]>([])
  const [systems, setSystems] = useState<System[]>([])
  const [filterStatus, setFilterStatus] = useState<ChangeStatus | "">("")
  const [filterSystem, setFilterSystem] = useState<number | "">("")
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const currentUser = useCurrentUser()
  const isAdmin = currentUser?.role?.name === "admin"

  const location = useLocation()

  useEffect(() => {
    getSystems().then(setSystems)
  }, [])

  useEffect(() => {
    loadChanges()
  }, [filterStatus, filterSystem, location.key])

  const loadChanges = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getChanges({
        status: filterStatus || undefined,
        system_id: filterSystem || undefined,
      })
      setChanges(data)
    } catch {
      navigate("/login")
    } finally {
      setLoading(false)
    }
  }, [filterStatus, filterSystem])

  const handleStatusChange = async (id: number, status: ChangeStatus) => {
    setChanges(prev => prev.map(c => c.id === id ? { ...c, status } : c))
    await updateChange(id, { status })
  }

  const handleDelete = async (id: number) => {
    if (confirm("Удалить изменение?")) {
      await deleteChange(id)
      loadChanges()
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Изменения</h1>
          <div className="flex gap-2">
            <button onClick={() => navigate("/systems")} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition">Системы</button>
            {isAdmin && (
              <button onClick={() => navigate("/roles")} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition">Роли</button>
            )}
            {isAdmin && (
              <button onClick={() => navigate("/users")} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition">Пользователи</button>
            )}
            <button onClick={() => navigate("/profile")} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition">Профиль</button>
            <button onClick={() => navigate("/changes/new")} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition">+ Добавить</button>
            <button onClick={() => { localStorage.removeItem("token"); navigate("/login") }} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition">Выйти</button>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ChangeStatus | "")}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none"
          >
            <option value="">Все статусы</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <select
            value={filterSystem}
            onChange={(e) => setFilterSystem(Number(e.target.value) || "")}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none"
          >
            <option value="">Все системы</option>
            {systems.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {(filterStatus || filterSystem) && (
            <button
              onClick={() => { setFilterStatus(""); setFilterSystem("") }}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition"
            >
              Сбросить
            </button>
          )}
        </div>

        {loading && <p className="text-gray-400">Загрузка...</p>}
        {!loading && changes.length === 0 && <p className="text-gray-400">Изменений не найдено</p>}

        <div className="flex flex-col gap-3">
          {changes.map((change) => (
            <div key={change.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg">{change.title}</h3>
                <span className={`${STATUS_COLORS[change.status]} text-white text-xs px-3 py-1 rounded-full`}>
                  {STATUS_LABELS[change.status]}
                </span>
              </div>

              {change.description && (
                <p className="text-gray-400 text-sm mb-3">{change.description}</p>
              )}

              {change.requires_restart && (
                <span className="inline-flex items-center gap-1 text-xs text-orange-400 bg-orange-400/10 border border-orange-400/20 rounded-md px-2 py-1 mb-3">
                  ⚠ Требуется перезагрузка
                </span>
              )}

              <div className="flex gap-2 mt-3">
                <select
                  value={change.status}
                  onChange={(e) => handleStatusChange(change.id, e.target.value as ChangeStatus)}
                  className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-sm outline-none"
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleDelete(change.id)}
                  className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-sm transition"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}