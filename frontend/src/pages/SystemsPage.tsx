import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getSystems, createSystem, getSegments, createSegment, updateSystem, deleteSystem, updateSegment, deleteSegment } from "../api/systems"
import type { System, Segment } from "../types"

export default function SystemsPage() {
  const [systems, setSystems] = useState<System[]>([])
  const [segments, setSegments] = useState<Record<number, Segment[]>>({})
  const [newSystemName, setNewSystemName] = useState("")
  const [newSystemDesc, setNewSystemDesc] = useState("")
  const [newSegmentName, setNewSegmentName] = useState<Record<number, string>>({})
  const [editingSystem, setEditingSystem] = useState<System | null>(null)
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null)
  const navigate = useNavigate()
  const [newSegmentDesc, setNewSegmentDesc] = useState<Record<number, string>>({})
  const [newSegmentRestart, setNewSegmentRestart] = useState<Record<number, boolean>>({})


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

  const handleUpdateSystem = async () => {
    if (!editingSystem) return
    await updateSystem(editingSystem.id, editingSystem.name, editingSystem.description || undefined)
    setEditingSystem(null)
    loadSystems()
  }

  const handleDeleteSystem = async (id: number) => {
    if (confirm("Удалить систему?")) {
      await deleteSystem(id)
      loadSystems()
    }
  }

  const handleCreateSegment = async (systemId: number) => {
    const name = newSegmentName[systemId]
    if (!name) return
    await createSegment(systemId, name, newSegmentDesc[systemId], newSegmentRestart[systemId] || false)
    setNewSegmentName(prev => ({ ...prev, [systemId]: "" }))
    setNewSegmentDesc(prev => ({ ...prev, [systemId]: "" }))
    setNewSegmentRestart(prev => ({ ...prev, [systemId]: false }))
    const segs = await getSegments(systemId)
    setSegments(prev => ({ ...prev, [systemId]: segs }))
  }

  const handleUpdateSegment = async () => {
    if (!editingSegment) return
    await updateSegment(editingSegment.system_id, editingSegment.id, editingSegment.name, editingSegment.description || undefined, editingSegment.requires_restart)
    setEditingSegment(null)
    loadSystems()
  }

  const handleDeleteSegment = async (systemId: number, segmentId: number) => {
    if (confirm("Удалить сегмент?")) {
      await deleteSegment(systemId, segmentId)
      const segs = await getSegments(systemId)
      setSegments(prev => ({ ...prev, [systemId]: segs }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate("/changes")} className="text-gray-400 hover:text-white transition">← Назад</button>
          <h1 className="text-2xl font-bold">Системы</h1>
        </div>

        {/* Новая система */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
          <h3 className="font-semibold mb-4">Новая система</h3>
          <div className="flex flex-col gap-3">
            <input
              placeholder="Название *"
              value={newSystemName}
              onChange={(e) => setNewSystemName(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition text-sm"
            />
            <input
              placeholder="Описание"
              value={newSystemDesc}
              onChange={(e) => setNewSystemDesc(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition text-sm"
            />
            <button onClick={handleCreateSystem} className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2.5 text-sm font-medium transition">
              Создать систему
            </button>
          </div>
        </div>

        {/* Список систем */}
        {systems.map((system) => (
          <div key={system.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-4">
            {editingSystem?.id === system.id ? (
              <div className="flex flex-col gap-3 mb-4">
                <input
                  value={editingSystem.name}
                  onChange={(e) => setEditingSystem({ ...editingSystem, name: e.target.value })}
                  className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition text-sm"
                />
                <input
                  value={editingSystem.description || ""}
                  onChange={(e) => setEditingSystem({ ...editingSystem, description: e.target.value })}
                  className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition text-sm"
                />
                <div className="flex gap-2">
                  <button onClick={handleUpdateSystem} className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm transition">Сохранить</button>
                  <button onClick={() => setEditingSystem(null)} className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg px-4 py-2 text-sm transition">Отмена</button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{system.name}</h3>
                  {system.description && <p className="text-gray-400 text-sm">{system.description}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingSystem(system)} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition">Изменить</button>
                  <button onClick={() => handleDeleteSystem(system.id)} className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-sm transition">Удалить</button>
                </div>
              </div>
            )}

            {/* Сегменты */}
            <div className="border-t border-gray-800 pt-4">
              <p className="text-sm text-gray-400 mb-3">Сегменты</p>
              {(segments[system.id] || []).map((seg) => (
                <div key={seg.id} className="flex justify-between items-center py-2">
                  {editingSegment?.id === seg.id && editingSegment ? (
                    <div className="flex flex-col gap-2 w-full">
                      <input
                        value={editingSegment.name}
                        onChange={(e) => setEditingSegment({ ...editingSegment, name: e.target.value })}
                        className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 outline-none text-sm"
                      />
                      <input
                        placeholder="Описание"
                        value={editingSegment.description || ""}
                        onChange={(e) => setEditingSegment({ ...editingSegment, description: e.target.value })}
                        className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 outline-none text-sm"
                      />
                      <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingSegment.requires_restart}
                          onChange={(e) => setEditingSegment({ ...editingSegment, requires_restart: e.target.checked })}
                          className="w-4 h-4"
                        />
                        Требуется перезагрузка
                      </label>
                      <div className="flex gap-2">
                        <button onClick={handleUpdateSegment} className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-3 py-1.5 text-sm transition">Сохранить</button>
                        <button onClick={() => setEditingSegment(null)} className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg px-3 py-1.5 text-sm transition">Отмена</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-300">{seg.name}</span>
                        {seg.description && <span className="text-xs text-gray-500">{seg.description}</span>}
                        {seg.requires_restart && <span className="text-xs text-orange-400">⚠ Требуется перезагрузка</span>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingSegment(seg)} className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs transition">Изменить</button>
                        <button onClick={() => handleDeleteSegment(system.id, seg.id)} className="px-2 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded text-xs transition">Удалить</button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              <div className="flex flex-col gap-2 mt-3">
                <div className="flex gap-2">
                  <input
                    placeholder="Новый сегмент"
                    value={newSegmentName[system.id] || ""}
                    onChange={(e) => setNewSegmentName(prev => ({ ...prev, [system.id]: e.target.value }))}
                    className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 outline-none text-sm flex-1"
                  />
                  <button onClick={() => handleCreateSegment(system.id)} className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-1.5 text-sm transition">+</button>
                </div>
                <input
                  placeholder="Описание сегмента"
                  value={newSegmentDesc[system.id] || ""}
                  onChange={(e) => setNewSegmentDesc(prev => ({ ...prev, [system.id]: e.target.value }))}
                  className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 outline-none text-sm"
                />
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSegmentRestart[system.id] || false}
                    onChange={(e) => setNewSegmentRestart(prev => ({ ...prev, [system.id]: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  Требуется перезагрузка
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}