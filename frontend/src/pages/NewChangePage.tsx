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
  const [submitting, setSubmitting] = useState(false)
  const [requiresRestart, setRequiresRestart] = useState(false)
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
      if (submitting) return
      setSubmitting(true)

      try {
        await createChange({
          title,
          description: description || undefined,
          system_id: systemId,
          segment_id: segmentId || undefined,
          responsible_id: 1,
          planned_at: plannedAt || undefined,
          requires_restart: requiresRestart
        })
        console.log("success, navigating")
        navigate("/changes")
      } catch (e) {
        console.log("error", e)
        setError("Ошибка при создании")
        setSubmitting(false)
      }
    }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Новое изменение</h1>

          <button
            onClick={() => navigate("/changes")}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition"
          >
            Назад
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">

          {currentUser && (
            <div className="mb-6">
              <p className="text-sm text-gray-400">
                Ответственный:
                <span className="text-white ml-2 font-medium">
                  {currentUser.name}
                </span>
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">

            <input
              type="text"
              placeholder="Название *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <textarea
              placeholder="Описание"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none resize-none focus:border-blue-500"
            />

            <select
              value={systemId ?? ""}
              onChange={(e) => setSystemId(Number(e.target.value) || null)}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="">Выберите систему *</option>

              {systems.map((system) => (
                <option key={system.id} value={system.id}>
                  {system.name}
                </option>
              ))}
            </select>

            {segments.length > 0 && (
              <select
                value={segmentId ?? ""}
                onChange={(e) => setSegmentId(Number(e.target.value) || null)}
                className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Выберите сегмент</option>

                {segments.map((segment) => (
                  <option key={segment.id} value={segment.id}>
                    {segment.name}
                  </option>
                ))}
              </select>
            )}

            <input
              type="datetime-local"
              value={plannedAt}
              onChange={(e) => setPlannedAt(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={requiresRestart}
                onChange={(e) => setRequiresRestart(e.target.checked)}
                className="w-4 h-4"
              />
              Требуется перезагрузка
            </label>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm font-medium transition"
              >
                {submitting ? "Создание..." : "Создать изменение"}
              </button>

              <button
                onClick={() => navigate("/changes")}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition"
              >
                Отмена
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}