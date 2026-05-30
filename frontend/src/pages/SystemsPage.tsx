import { useState, useEffect } from "react"
import { getSystems, createSystem, getSegments, createSegment } from "../api/systems"
import type { System, Segment } from "../types"

export default function SystemsPage() {
  const [systems, setSystems] = useState<System[]>([])
  const [segments, setSegments] = useState<Record<number, Segment[]>>({})
  const [newSystemName, setNewSystemName] = useState("")
  const [newSystemDesc, setNewSystemDesc] = useState("")
  const [newSegmentName, setNewSegmentName] = useState<Record<number, string>>({})

  useEffect(() => {
    loadSystems()
  }, [])

  const loadSystems = async () => {
    const data = await getSystems()
    setSystems(data)
    for (const system of data) {
      const segs = await getSegments(system.id)
      setSegments(prev => ({ ...prev, [system.id]: segs }))
    }
  }

  const handleCreateSystem = async () => {
    if (!newSystemName) return
    await createSystem(newSystemName, newSystemDesc || undefined)
    setNewSystemName("")
    setNewSystemDesc("")
    loadSystems()
  }

  const handleCreateSegment = async (systemId: number) => {
    const name = newSegmentName[systemId]
    if (!name) return
    await createSegment(systemId, name)
    setNewSegmentName(prev => ({ ...prev, [systemId]: "" }))
    const segs = await getSegments(systemId)
    setSegments(prev => ({ ...prev, [systemId]: segs }))
  }

  return (
    <div style={{ padding: "20px", maxWidth: "700px" }}>
      <h1>Системы</h1>

      <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "16px", marginBottom: "24px" }}>
        <h3>Новая система</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <input
            placeholder="Название *"
            value={newSystemName}
            onChange={(e) => setNewSystemName(e.target.value)}
          />
          <input
            placeholder="Описание"
            value={newSystemDesc}
            onChange={(e) => setNewSystemDesc(e.target.value)}
          />
          <button onClick={handleCreateSystem}>Создать систему</button>
        </div>
      </div>

      {systems.map((system) => (
        <div key={system.id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "16px", marginBottom: "12px" }}>
          <h3>{system.name}</h3>
          {system.description && <p style={{ color: "#666" }}>{system.description}</p>}

          <h4>Сегменты:</h4>
          {(segments[system.id] || []).length === 0 && <p style={{ color: "#999" }}>Нет сегментов</p>}
          {(segments[system.id] || []).map((seg) => (
            <div key={seg.id} style={{ padding: "4px 8px", background: "#f5f5f5", borderRadius: "4px", marginBottom: "4px" }}>
              {seg.name}
            </div>
          ))}

          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <input
              placeholder="Новый сегмент"
              value={newSegmentName[system.id] || ""}
              onChange={(e) => setNewSegmentName(prev => ({ ...prev, [system.id]: e.target.value }))}
            />
            <button onClick={() => handleCreateSegment(system.id)}>+</button>
          </div>
        </div>
      ))}
    </div>
  )
}