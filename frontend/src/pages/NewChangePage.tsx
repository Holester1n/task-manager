import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { createChange } from "../api/changes"
import { getSystems, getSegments } from "../api/systems"
import { useCurrentUser } from "../hooks/useCurrentUser"
import type { System, Segment } from "../types"

export default function NewChangePage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [systemId, setSystemId] = useState<number | null>(null)
  const [segmentId, setSegmentId] = useState<number | null>(null)
  const [plannedAt, setPlannedAt] = useState("")
  const [systems, setSystems] = useState<System[]>([])
  const [segments, setSegments] = useState<Segment[]>([])
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const currentUser = useCurrentUser()

  useEffect(() => {
    getSystems().then(setSystems)
  }, [])

  useEffect(() => {
    if (systemId) {
      getSegments(systemId).then(setSegments)
    } else {
      setSegments([])
      setSegmentId(null)
    }
  }, [systemId])

  const handleSubmit = async () => {
    if (!title || !systemId) {
      setError("Заполните название и систему")
      return
    }
    try {
      await createChange({
        title,
        description: description || undefined,
        system_id: systemId,
        segment_id: segmentId || undefined,
        responsible_id: 1,
        planned_at: plannedAt || undefined,
      })
      navigate("/changes")
    } catch {
      setError("Ошибка при создании")
    }
  }

  return (
    <div style={{ padding: "20px", maxWidth: "600px" }}>
      <h1>Новое изменение</h1>
      {currentUser && <p style={{ color: "#666" }}>Ответственный: {currentUser.name}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input
          placeholder="Название *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <select
          value={systemId ?? ""}
          onChange={(e) => setSystemId(Number(e.target.value) || null)}
        >
          <option value="">Выберите систему *</option>
          {systems.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        {segments.length > 0 && (
          <select
            value={segmentId ?? ""}
            onChange={(e) => setSegmentId(Number(e.target.value) || null)}
          >
            <option value="">Выберите сегмент</option>
            {segments.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}

        <input
          type="datetime-local"
          value={plannedAt}
          onChange={(e) => setPlannedAt(e.target.value)}
        />

        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={handleSubmit}>Создать</button>
          <button onClick={() => navigate("/changes")}>Отмена</button>
        </div>
      </div>
    </div>
  )
}