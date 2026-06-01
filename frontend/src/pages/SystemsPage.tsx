import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getSystems, createSystem, getSegments, createSegment } from "../api/systems"
import type { System, Segment } from "../types"

export default function SystemsPage() {
  const [systems, setSystems] = useState<System[]>([])
  const [segments, setSegments] = useState<Record<number, Segment[]>>({})
  const [newSystemName, setNewSystemName] = useState("")
  const [newSystemDesc, setNewSystemDesc] = useState("")
  const [newSegmentName, setNewSegmentName] = useState<Record<number, string>>({})
  const navigate = useNavigate()

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
  <div className="min-h-screen bg-gray-950 text-white">
    <div className="max-w-4xl mx-auto px-4 py-8">

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Системы</h1>

        <button
          onClick={() => navigate("/changes")}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition"
        >
          ← Назад
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">
          Новая система
        </h2>

        <div className="flex flex-col gap-4">
          <input
            placeholder="Название *"
            value={newSystemName}
            onChange={(e) => setNewSystemName(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
          />

          <input
            placeholder="Описание"
            value={newSystemDesc}
            onChange={(e) => setNewSystemDesc(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
          />

          <div>
            <button
              onClick={handleCreateSystem}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition"
            >
              Создать систему
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {systems.map((system) => (
          <div
            key={system.id}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5"
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold">
                {system.name}
              </h3>

              {system.description && (
                <p className="text-sm text-gray-400 mt-1">
                  {system.description}
                </p>
              )}
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Сегменты
              </h4>

              {(segments[system.id] || []).length === 0 ? (
                <p className="text-sm text-gray-500">
                  Нет сегментов
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(segments[system.id] || []).map((seg) => (
                    <div
                      key={seg.id}
                      className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm"
                    >
                      {seg.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <input
                placeholder="Новый сегмент"
                value={newSegmentName[system.id] || ""}
                onChange={(e) =>
                  setNewSegmentName((prev) => ({
                    ...prev,
                    [system.id]: e.target.value,
                  }))
                }
                className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
              />

              <button
                onClick={() => handleCreateSegment(system.id)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition"
              >
                Добавить
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  </div>
)}