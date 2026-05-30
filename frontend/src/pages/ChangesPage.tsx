import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getChanges, deleteChange, updateChange } from "../api/changes"
import type { Change, ChangeStatus } from "../types"

const STATUS_LABELS: Record<ChangeStatus, string> = {
  created: "Создано",
  planned: "Запланировано",
  applied: "Применено",
  tested: "Протестировано",
  rolled_back: "Откатили",
}

export default function ChangesPage() {
  const [changes, setChanges] = useState<Change[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadChanges()
  }, [])

  const loadChanges = async () => {
    try {
      const data = await getChanges()
      setChanges(data)
    } catch {
      navigate("/login")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить изменение?")) return
    await deleteChange(id)
    setChanges(changes.filter(c => c.id !== id))
  }

  const handleStatusChange = async (id: number, status: ChangeStatus) => {
    const updated = await updateChange(id, { status })
    setChanges(changes.map(c => c.id === id ? updated : c))
  }

  if (loading) return <p>Загрузка...</p>

  return (
    <div>
      <h1>Изменения</h1>
      <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => navigate("/systems")}>Системы</button>
            <button onClick={() => navigate("/changes/new")}>+ Добавить</button>
            <button onClick={() => {
                localStorage.removeItem("token")
                navigate("/login")
            }}>Выйти</button>
        </div>

      {changes.length === 0 && <p>Изменений пока нет</p>}

      {changes.map(change => (
        <div key={change.id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
          <h3>{change.title}</h3>
          <p>{change.description}</p>
          <p>Статус: {STATUS_LABELS[change.status]}</p>
          <p>Создано: {new Date(change.created_at).toLocaleString()}</p>

          <select
            value={change.status}
            onChange={(e) => handleStatusChange(change.id, e.target.value as ChangeStatus)}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <button onClick={() => handleDelete(change.id)}>Удалить</button>
        </div>
      ))}
    </div>
  )
}