import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useCurrentUser } from "../hooks/useCurrentUser"
import { getSystems, getSubscriptions, subscribe, unsubscribe } from "../api/systems"
import type { System } from "../types"
import client from "../api/client"

export default function ProfilePage() {
  const user = useCurrentUser()
  const [chatId, setChatId] = useState("")
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [systems, setSystems] = useState<System[]>([])
  const [subscribedIds, setSubscribedIds] = useState<number[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    loadSystems()
  }, [])

  const loadSystems = async () => {
    const [allSystems, subs] = await Promise.all([
      getSystems(),
      getSubscriptions()
    ])
    setSystems(allSystems)
    setSubscribedIds(subs.subscribed_system_ids)
  }

  const handleConnect = async () => {
    if (!chatId) {
      setError("Введи chat_id")
      return
    }
    try {
      await client.post(`/users/telegram/connect?chat_id=${chatId}`)
      setSuccess(true)
      setError("")
    } catch {
      setError("Ошибка подключения")
    }
  }

  const handleToggleSubscription = async (system_id: number) => {
    if (subscribedIds.includes(system_id)) {
      await unsubscribe(system_id)
      setSubscribedIds(prev => prev.filter(id => id !== system_id))
    } else {
      await subscribe(system_id)
      setSubscribedIds(prev => [...prev, system_id])
    }
  }

  return (
  <div className="min-h-screen bg-gray-950 text-white">
    <div className="max-w-3xl mx-auto px-4 py-8">

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Профиль</h1>

        <button
          onClick={() => navigate("/changes")}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition"
        >
          ← Назад
        </button>
      </div>

      {user && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Информация о пользователе</h2>

          <div className="flex flex-col gap-3 text-sm">
            <div>
              <span className="text-gray-400">Имя:</span>
              <span className="ml-2">{user.name}</span>
            </div>

            <div>
              <span className="text-gray-400">Email:</span>
              <span className="ml-2">{user.email}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-400">Telegram:</span>

              {user.telegram_chat_id ? (
                <span className="text-green-400">
                  ✓ Подключён
                </span>
              ) : (
                <span className="text-red-400">
                  ✕ Не подключён
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {!user?.telegram_chat_id && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">

          <h2 className="text-lg font-semibold mb-2">
            Подключить Telegram
          </h2>

          <p className="text-sm text-gray-400 mb-4">
            Найдите бота, отправьте ему команду /start и вставьте сюда полученный chat_id.
          </p>

          {success && (
            <div className="mb-4 rounded-lg border border-green-900 bg-green-950/30 px-4 py-3 text-sm text-green-400">
              Telegram подключён. Обновите страницу.
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg border border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <input
              placeholder="Ваш chat_id"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <button
              onClick={handleConnect}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition"
            >
              Подключить
            </button>
          </div>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-2">
          Подписки на системы
        </h2>

        <p className="text-sm text-gray-400 mb-5">
          Получайте уведомления об изменениях в выбранных системах.
        </p>

        <div className="flex flex-col gap-3">
          {systems.map((system) => {
            const subscribed = subscribedIds.includes(system.id)

            return (
              <div
                key={system.id}
                className="flex items-center justify-between bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3"
              >
                <span>{system.name}</span>

                <button
                  onClick={() => handleToggleSubscription(system.id)}
                  className={
                    subscribed
                      ? "px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-sm transition"
                      : "px-3 py-1.5 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded-lg text-sm transition"
                  }
                >
                  {subscribed ? "Отписаться" : "Подписаться"}
                </button>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  </div>
)}