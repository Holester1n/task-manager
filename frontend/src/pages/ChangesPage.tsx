import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getChanges, deleteChange, updateChange } from "../api/changes"
import { getSystems } from "../api/systems"
import type { Change, ChangeStatus, System } from "../types"

const STATUS_LABELS: Record<ChangeStatus, string> = {
  created: "Создано",
  planned: "Запланировано",
  applied: "Применено",
  tested: "Протестировано",
  rolled_back: "Откатили",
}

const STATUS_COLORS: Record<ChangeStatus, string> = {
  created: "#6c757d",
  planned: "#0d6efd",
  applied: "#fd7e14",
  tested: "#198754",
  rolled_back: "#dc3545",
}

export default function ChangesPage() {
  const [changes, setChanges] = useState<Change[]>([])
  const [systems, setSystems] = useState<System[]>([])
  const [filterStatus, setFilterStatus] = useState<ChangeStatus | "">("")
  const [filterSystem, setFilterSystem] = useState<number | "">("")
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getSystems().then(setSystems)
  }, [])

  useEffect(() => {
    loadChanges()
  }, [filterStatus, filterSystem])

  const loadChanges = async () => {
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
  }

  const handleStatusChange = async (id: number, status: ChangeStatus) => {
    await updateChange(id, { status })
    loadChanges()
  }

  const handleDelete = async (id: number) => {
    if (confirm("Удалить изменение?")) {
      await deleteChange(id)
      loadChanges()
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Изменения</h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => navigate("/systems")}>Системы</button>
          <button onClick={() => navigate("/profile")}>Профиль</button>
          <button onClick={() => navigate("/changes/new")}>+ Добавить</button>
          <button onClick={() => {
            localStorage.removeItem("token")
            navigate("/login")
          }}>Выйти</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as ChangeStatus | "")}
        >
          <option value="">Все статусы</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <select
          value={filterSystem}
          onChange={(e) => setFilterSystem(Number(e.target.value) || "")}
        >
          <option value="">Все системы</option>
          {systems.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        {(filterStatus || filterSystem) && (
          <button onClick={() => {
            setFilterStatus("")
            setFilterSystem("")
          }}>Сбросить</button>
        )}
      </div>

      {loading && <p>Загрузка...</p>}

      {!loading && changes.length === 0 && <p>Изменений не найдено</p>}

      {changes.map((change) => (
        <div key={change.id} style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "12px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3 style={{ margin: 0 }}>{change.title}</h3>
            <span style={{
              background: STATUS_COLORS[change.status],
              color: "white",
              padding: "4px 10px",
              borderRadius: "12px",
              fontSize: "13px",
            }}>
              {STATUS_LABELS[change.status]}
            </span>
          </div>

          {change.description && <p style={{ color: "#666" }}>{change.description}</p>}

          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
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
        </div>
      ))}
    </div>
  )
}